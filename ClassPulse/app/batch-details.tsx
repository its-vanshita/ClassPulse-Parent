import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  subscribeToStudentsByBatch,
  deleteStudent,
} from '../src/services/firestoreService';
import { colors } from '../src/theme/colors';
import { spacing, borderRadius, fontSize } from '../src/theme/spacing';
import type { Student } from '../src/types';

export default function BatchDetailsScreen() {
  const { batchId } = useLocalSearchParams<{ batchId: string }>();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (!batchId) return;
    const unsub = subscribeToStudentsByBatch(batchId, setStudents);
    return unsub;
  }, [batchId]);

  const handleDeleteStudent = (s: Student) => {
    Alert.alert('Remove Student', `Remove "${s.name}" from this batch?`, [
      { text: 'Cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => deleteStudent(s.studentId, s.batchId),
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>{students.length} Students</Text>
        <TouchableOpacity
          style={styles.markBtn}
          onPress={() => router.push({ pathname: '/mark-attendance', params: { batchId: batchId! } })}
        >
          <Ionicons name="checkmark-circle" size={18} color={colors.white} />
          <Text style={styles.markBtnText}>Mark Attendance</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={students}
        keyExtractor={(s) => s.studentId}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.card}
            onLongPress={() => handleDeleteStudent(item)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.studentName}>{item.name}</Text>
              <Text style={styles.studentSub}>
                {item.rollNumber ? `Roll #${item.rollNumber}` : ''}
                {item.parentEmail ? ` · ${item.parentEmail}` : ''}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="person-outline" size={50} color={colors.textLight} />
            <Text style={styles.emptyText}>No students in this batch</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push({ pathname: '/add-student', params: { batchId: batchId! } })}
      >
        <Ionicons name="person-add" size={24} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  headerTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary },
  markBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: 6,
  },
  markBtnText: { color: colors.white, fontWeight: '700', fontSize: fontSize.sm },
  list: { padding: spacing.lg, paddingBottom: 100 },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { fontSize: fontSize.md, fontWeight: '700', color: colors.primary },
  studentName: { fontSize: fontSize.md, fontWeight: '600', color: colors.textPrimary },
  studentSub: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: fontSize.md, color: colors.textLight, marginTop: spacing.md },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
});
