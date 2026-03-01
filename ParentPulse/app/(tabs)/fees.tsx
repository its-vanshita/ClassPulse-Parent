import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/src/theme/colors';
import { spacing, fontSize, borderRadius } from '@/src/theme/spacing';
import Card from '@/src/components/common/Card';
import { useFees } from '@/src/hooks/useFees';
import type { FeeRecord, FeeStatus } from '@/src/types';

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

function FeeItem({ item }: { item: FeeRecord }) {
  const sc = STATUS_CONFIG[item.status];
  const dueStr = item.dueDate ? fmtDate(item.dueDate) : '';

  return (
    <Card style={styles.feeCard}>
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.badgeText, { color: sc.fg }]}>{sc.label}</Text>
        </View>
        <Text style={styles.amount}>₹{fmt(item.amount)}</Text>
      </View>
      <Text style={styles.feeTitle}>{item.title}</Text>
      <View style={styles.cardRow}>
        <Text style={styles.dueText}>Due: {dueStr}</Text>
        <Text style={[styles.paidText, { color: colors.success }]}>
          Paid: ₹{fmt(item.paidAmount)}
        </Text>
      </View>
      {item.status !== 'paid' && (
        <View style={styles.progressWrap}>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(100, (item.paidAmount / item.amount) * 100)}%`,
                  backgroundColor: sc.fg,
                },
              ]}
            />
          </View>
          <Text style={styles.remainText}>
            ₹{fmt(item.amount - item.paidAmount)} remaining
          </Text>
        </View>
      )}
      {item.paidDate && (
        <Text style={styles.paidDate}>
          Paid on{' '}
          {fmtDate(item.paidDate)}
        </Text>
      )}
      {item.remarks ? (
        <Text style={styles.remarks} numberOfLines={2}>
          {item.remarks}
        </Text>
      ) : null}
    </Card>
  );
}

export default function FeesScreen() {
  const { summary, records, loading } = useFees();

  const sorted = useMemo(
    () =>
      [...records].sort((a, b) => {
        const order: Record<FeeStatus, number> = { overdue: 0, pending: 1, partial: 2, paid: 3 };
        return order[a.status] - order[b.status];
      }),
    [records],
  );

  if (loading) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fees</Text>
        <Text style={styles.headerSub}>Payment overview</Text>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderLeftColor: colors.success }]}>
          <Text style={styles.summaryValue}>₹{fmt(summary.totalPaid)}</Text>
          <Text style={styles.summaryLabel}>Paid</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: colors.warning }]}>
          <Text style={styles.summaryValue}>₹{fmt(summary.totalPending)}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
        <View style={[styles.summaryCard, { borderLeftColor: colors.danger }]}>
          <Text style={styles.summaryValue}>{summary.overdueCount}</Text>
          <Text style={styles.summaryLabel}>Overdue</Text>
        </View>
      </View>

      {/* Fee List */}
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.feeId}
        renderItem={({ item }) => <FeeItem item={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No fee records yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 56,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.white,
  },
  headerSub: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginTop: -spacing.md,
    marginBottom: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
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
  list: { padding: spacing.md, paddingBottom: 40 },
  feeCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  amount: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  feeTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dueText: { fontSize: fontSize.xs, color: colors.textLight },
  paidText: { fontSize: fontSize.xs, fontWeight: '600' },
  progressWrap: { marginTop: spacing.sm },
  progressBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  remainText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 4,
  },
  paidDate: {
    fontSize: fontSize.xs,
    color: colors.success,
    marginTop: spacing.xs,
  },
  remarks: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  emptyBox: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});
