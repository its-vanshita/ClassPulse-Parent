import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTeacher } from '../../src/context/TeacherContext';
import { subscribeToBatches, deleteBatch } from '../../src/services/firestoreService';
import { colors } from '../../src/theme/colors';
import { spacing, borderRadius, fontSize } from '../../src/theme/spacing';
import type { Batch } from '../../src/types';

export default function BatchesScreen() {
  const router = useRouter();
  const { teacher } = useTeacher();
  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    if (!teacher) return;
    const unsub = subscribeToBatches(teacher.teacherId, setBatches);
    return unsub;
  }, [teacher]);

  const handleDelete = (batch: Batch) => {
    Alert.alert('Delete Batch', `Delete "${batch.name}"? This cannot be undone.`, [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteBatch(batch.batchId, batch.teacherId),
      },
    ]);
  };

  const renderBatch = ({ item }: { item: Batch }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: '/batch-details', params: { batchId: item.batchId } })}
      onLongPress={() => handleDelete(item)}
    >
      <View style={styles.cardIcon}>
        <Ionicons name="people" size={22} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>
          {item.studentIds.length} students
          {item.grade ? ` · Grade ${item.grade}` : ''}
          {item.subject ? ` · ${item.subject}` : ''}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={batches}
        keyExtractor={(b) => b.batchId}
        renderItem={renderBatch}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={50} color={colors.textLight} />
            <Text style={styles.emptyText}>No batches yet</Text>
            <Text style={styles.emptyHint}>Tap + to create your first batch</Text>
          </View>
        }
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-batch')}
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
  name: { fontSize: fontSize.md, fontWeight: '700', color: colors.textPrimary },
  sub: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyText: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textSecondary, marginTop: spacing.md },
  emptyHint: { fontSize: fontSize.sm, color: colors.textLight, marginTop: spacing.xs },
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
