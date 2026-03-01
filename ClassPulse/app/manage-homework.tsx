import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTeacher } from '../src/context/TeacherContext';
import {
  subscribeToHomeworkByTeacher,
  subscribeToBatches,
  deleteHomework,
} from '../src/services/firestoreService';
import { colors } from '../src/theme/colors';
import { spacing, borderRadius, fontSize } from '../src/theme/spacing';
import type { Homework, Batch } from '../src/types';

export default function ManageHomeworkScreen() {
  const router = useRouter();
  const { teacher } = useTeacher();

  const [homework, setHomework] = useState<Homework[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacher) return;
    const unsubs: (() => void)[] = [];

    unsubs.push(
      subscribeToBatches(teacher.teacherId, setBatches),
    );
    unsubs.push(
      subscribeToHomeworkByTeacher(teacher.teacherId, (hw) => {
        setHomework(hw);
        setLoading(false);
      }),
    );

    return () => unsubs.forEach((u) => u());
  }, [teacher]);

  const batchName = (batchId: string) =>
    batches.find((b) => b.batchId === batchId)?.name ?? 'Unknown';

  const handleDelete = (hw: Homework) => {
    Alert.alert('Delete Homework', `Delete "${hw.title}"?`, [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteHomework(hw.homeworkId);
          } catch {
            Alert.alert('Error', 'Could not delete homework');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Homework }) => {
    const dueStr = item.dueDate
      ? new Date(item.dueDate).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : null;

    return (
      <TouchableOpacity
        style={styles.card}
        onLongPress={() => handleDelete(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.subjectBadge}>
            <Text style={styles.subjectText}>{item.subject || 'General'}</Text>
          </View>
          {dueStr && <Text style={styles.dueDate}>Due {dueStr}</Text>}
        </View>
        <Text style={styles.title}>{item.title}</Text>
        {item.description ? (
          <Text style={styles.desc} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
        <View style={styles.cardFooter}>
          <Ionicons name="people-outline" size={14} color={colors.textLight} />
          <Text style={styles.batchLabel}>{batchName(item.batchId)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={homework}
        keyExtractor={(item) => item.homeworkId}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="book-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No homework assigned</Text>
            <Text style={styles.emptyHint}>
              Tap the + button to assign homework
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/assign-homework')}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingBottom: 100 },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  subjectBadge: {
    backgroundColor: colors.infoLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  subjectText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.info,
    textTransform: 'uppercase',
  },
  dueDate: { fontSize: fontSize.xs, color: colors.warning, fontWeight: '600' },
  title: { fontSize: fontSize.md, fontWeight: '700', color: colors.textPrimary },
  desc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  batchLabel: { fontSize: fontSize.xs, color: colors.textLight },
  emptyBox: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyHint: { fontSize: fontSize.sm, color: colors.textLight, marginTop: spacing.xs },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
