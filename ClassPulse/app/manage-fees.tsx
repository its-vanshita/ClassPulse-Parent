import React, { useEffect, useState, useMemo } from 'react';
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
import { Picker } from '@react-native-picker/picker';
import { useTeacher } from '../src/context/TeacherContext';
import {
  subscribeToBatches,
  subscribeToFeesByBatch,
  subscribeToStudentsByBatch,
  deleteFee,
} from '../src/services/firestoreService';
import { colors } from '../src/theme/colors';
import { spacing, borderRadius, fontSize } from '../src/theme/spacing';
import type { Batch, FeeRecord, Student, FeeStatus } from '../src/types';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmt = (n: number) => String(n);
const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

const STATUS_CONFIG: Record<FeeStatus, { label: string; bg: string; fg: string }> = {
  paid: { label: 'Paid', bg: colors.successLight, fg: colors.success },
  pending: { label: 'Pending', bg: colors.warningLight, fg: colors.warning },
  overdue: { label: 'Overdue', bg: colors.dangerLight, fg: colors.danger },
  partial: { label: 'Partial', bg: colors.infoLight, fg: colors.info },
};

export default function ManageFeesScreen() {
  const router = useRouter();
  const { teacher } = useTeacher();

  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Load batches
  useEffect(() => {
    if (!teacher) return;
    const unsub = subscribeToBatches(teacher.teacherId, (b) => {
      setBatches(b);
      if (b.length > 0 && !selectedBatchId) setSelectedBatchId(b[0].batchId);
    });
    return unsub;
  }, [teacher]);

  // Load fees & students when batch changes
  useEffect(() => {
    if (!selectedBatchId) {
      setFees([]);
      setStudents([]);
      setLoading(false);
      return;
    }

    const unsubs: (() => void)[] = [];
    unsubs.push(
      subscribeToFeesByBatch(selectedBatchId, (f) => {
        setFees(f);
        setLoading(false);
      }),
    );
    unsubs.push(subscribeToStudentsByBatch(selectedBatchId, setStudents));

    return () => unsubs.forEach((u) => u());
  }, [selectedBatchId]);

  const studentName = (id: string) =>
    students.find((s) => s.studentId === id)?.name ?? 'Unknown';

  // Summary stats
  const summary = useMemo(() => {
    const total = fees.reduce((s, f) => s + f.amount, 0);
    const collected = fees.reduce((s, f) => s + f.paidAmount, 0);
    const pending = total - collected;
    const overdueCount = fees.filter((f) => f.status === 'overdue').length;
    return { total, collected, pending, overdueCount };
  }, [fees]);

  const handleDelete = (fee: FeeRecord) => {
    Alert.alert('Delete Fee', `Delete "${fee.title}" for ${studentName(fee.studentId)}?`, [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteFee(fee.feeId);
          } catch {
            Alert.alert('Error', 'Could not delete fee record');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: FeeRecord }) => {
    const sc = STATUS_CONFIG[item.status];
    const dueStr = item.dueDate ? fmtDate(item.dueDate) : '';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          router.push({
            pathname: '/record-payment',
            params: { feeId: item.feeId, batchId: selectedBatchId },
          })
        }
        onLongPress={() => handleDelete(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardTop}>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusText, { color: sc.fg }]}>{sc.label}</Text>
          </View>
          <Text style={styles.amount}>₹{fmt(item.amount)}</Text>
        </View>
        <Text style={styles.studentName}>{studentName(item.studentId)}</Text>
        <Text style={styles.feeTitle}>{item.title}</Text>
        <View style={styles.cardBottom}>
          <Text style={styles.dueDate}>Due: {dueStr}</Text>
          <Text style={styles.paidAmount}>
            Paid: ₹{fmt(item.paidAmount)}
          </Text>
        </View>
        {item.remarks ? (
          <Text style={styles.remarks} numberOfLines={1}>
            {item.remarks}
          </Text>
        ) : null}
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
      {/* Batch Picker */}
      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={selectedBatchId}
          onValueChange={(v) => {
            setSelectedBatchId(v);
            setLoading(true);
          }}
          style={{ color: colors.textPrimary }}
        >
          {batches.map((b) => (
            <Picker.Item key={b.batchId} label={b.name} value={b.batchId} />
          ))}
        </Picker>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderLeftColor: colors.success }]}>
          <Text style={styles.summaryValue}>₹{fmt(summary.collected)}</Text>
          <Text style={styles.summaryLabel}>Collected</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: colors.warning }]}>
          <Text style={styles.summaryValue}>₹{fmt(summary.pending)}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: colors.danger }]}>
          <Text style={styles.summaryValue}>{summary.overdueCount}</Text>
          <Text style={styles.summaryLabel}>Overdue</Text>
        </View>
      </View>

      {/* Fee List */}
      <FlatList
        data={fees}
        keyExtractor={(item) => item.feeId}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="cash-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No fee records</Text>
            <Text style={styles.emptyHint}>Tap + to create fee entries</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          router.push({
            pathname: '/create-fee',
            params: { batchId: selectedBatchId },
          })
        }
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  pickerWrap: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  summaryValue: {
    fontSize: fontSize.md,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  summaryLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  list: { padding: spacing.md, paddingBottom: 100 },
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
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  statusText: { fontSize: fontSize.xs, fontWeight: '700', textTransform: 'uppercase' },
  amount: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  studentName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  feeTitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  dueDate: { fontSize: fontSize.xs, color: colors.textLight },
  paidAmount: { fontSize: fontSize.xs, color: colors.success, fontWeight: '600' },
  remarks: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  emptyBox: { alignItems: 'center', paddingTop: 60 },
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
