import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTeacher } from '../../src/context/TeacherContext';
import { subscribeToBatches } from '../../src/services/firestoreService';
import { colors } from '../../src/theme/colors';
import { spacing, borderRadius, fontSize } from '../../src/theme/spacing';
import type { Batch } from '../../src/types';

export default function AttendanceTab() {
  const router = useRouter();
  const { teacher } = useTeacher();
  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    if (!teacher) return;
    const unsub = subscribeToBatches(teacher.teacherId, setBatches);
    return unsub;
  }, [teacher]);

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <View style={styles.dateBar}>
        <Ionicons name="calendar" size={18} color={colors.primary} />
        <Text style={styles.dateText}>{today}</Text>
      </View>

      <Text style={styles.prompt}>Select a batch to mark attendance</Text>

      <FlatList
        data={batches}
        keyExtractor={(b) => b.batchId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({ pathname: '/mark-attendance', params: { batchId: item.batchId } })
            }
          >
            <View style={styles.cardIcon}>
              <Ionicons name="people" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.batchName}>{item.name}</Text>
              <Text style={styles.sub}>{item.studentIds.length} students</Text>
            </View>
            <View style={styles.markBadge}>
              <Text style={styles.markBadgeText}>Mark</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkmark-circle-outline" size={50} color={colors.textLight} />
            <Text style={styles.emptyText}>Create a batch first</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  dateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.primaryLight,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.md,
  },
  dateText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.primary },
  prompt: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  list: { padding: spacing.lg, paddingBottom: 40 },
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
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  batchName: { fontSize: fontSize.md, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  markBadge: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  markBadgeText: { color: colors.success, fontWeight: '700', fontSize: fontSize.sm },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: fontSize.md, color: colors.textLight, marginTop: spacing.md },
});
