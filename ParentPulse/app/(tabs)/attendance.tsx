import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/src/theme/colors';
import { spacing, fontSize, borderRadius } from '@/src/theme/spacing';
import Card from '@/src/components/common/Card';
import ProgressBar from '@/src/components/common/ProgressBar';
import AttendanceRow from '@/src/components/attendance/AttendanceRow';
import { useAttendance } from '@/src/hooks/useAttendance';

export default function AttendanceScreen() {
  const { overall, monthly, months, loading } = useAttendance();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // Default to last month once data is available
  const activeMonth = selectedMonth ?? (months.length > 0 ? months[months.length - 1] : '');
  const summary = monthly[activeMonth] ?? { totalDays: 0, presentDays: 0, absentDays: 0, percentage: 0, records: [] };

  const reversedRecords = useMemo(
    () => [...summary.records].reverse(),
    [summary.records]
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
        <Text style={styles.headerTitle}>Attendance</Text>
        <Text style={styles.headerSub}>Monthly overview</Text>
      </View>

      {/* Month Selector */}
      <View style={styles.monthRow}>
        {months.map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.monthBtn, activeMonth === m && styles.monthBtnActive]}
            onPress={() => setSelectedMonth(m)}
          >
            <Text
              style={[styles.monthText, activeMonth === m && styles.monthTextActive]}
            >
              {m}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Summary Card */}
      <View style={styles.summaryWrap}>
        <Card>
          <View style={styles.summaryRow}>
            <SummaryItem label="Present" value={summary.presentDays} color={colors.present} />
            <SummaryItem label="Absent" value={summary.absentDays} color={colors.absent} />
            <SummaryItem label="Working" value={summary.totalDays} color={colors.textSecondary} />
          </View>
          <View style={styles.pctRow}>
            <Text style={styles.pctLabel}>Attendance Rate</Text>
            <Text style={[styles.pctValue, { color: summary.percentage >= 75 ? colors.success : colors.danger }]}>
              {summary.percentage}%
            </Text>
          </View>
          <ProgressBar progress={summary.percentage} />
        </Card>
      </View>

      {/* Overall Stats */}
      <View style={styles.overallWrap}>
        <Card style={styles.overallCard}>
          <Text style={styles.overallLabel}>Overall Attendance</Text>
          <Text style={[styles.overallValue, { color: overall.percentage >= 75 ? colors.success : colors.danger }]}>
            {overall.percentage}%
          </Text>
          <Text style={styles.overallSub}>
            {overall.presentDays} present out of {overall.totalDays} working days
          </Text>
        </Card>
      </View>

      {/* Daily Records */}
      <Text style={styles.recordsTitle}>Daily Records</Text>
      <FlatList
        data={reversedRecords}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => <AttendanceRow record={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function SummaryItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'ios' ? 56 : (StatusBar.currentHeight ?? 24) + 16,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  headerTitle: {
    color: '#fff',
    fontSize: fontSize.xxl,
    fontWeight: '700',
  },
  headerSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.sm,
    marginTop: 4,
  },
  monthRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  monthBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  monthBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  monthText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  monthTextActive: {
    color: '#fff',
  },
  summaryWrap: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pctRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pctLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  pctValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  overallWrap: {
    marginHorizontal: spacing.md,
    marginTop: spacing.xs,
  },
  overallCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overallLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  overallValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  overallSub: {
    fontSize: fontSize.xs,
    color: colors.textLight,
  },
  recordsTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
});
