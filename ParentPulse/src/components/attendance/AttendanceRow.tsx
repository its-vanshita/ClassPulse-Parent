import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, fontSize } from '../../theme/spacing';
import { AttendanceRecord } from '../../types';

interface Props {
  record: AttendanceRecord;
}

const STATUS_CONFIG = {
  present: { label: 'Present', color: colors.present, bg: colors.successLight },
  absent: { label: 'Absent', color: colors.absent, bg: colors.dangerLight },
  holiday: { label: 'Holiday', color: colors.holiday, bg: colors.warningLight },
};

export default function AttendanceRow({ record }: Props) {
  const config = STATUS_CONFIG[record.status];
  const dateObj = new Date(record.date);
  const dayName = dateObj.toLocaleDateString('en-IN', { weekday: 'short' });
  const dateStr = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <View style={styles.row}>
      <View style={styles.dateWrap}>
        <Text style={styles.day}>{dayName}</Text>
        <Text style={styles.date}>{dateStr}</Text>
      </View>
      <View style={[styles.badge, { backgroundColor: config.bg }]}>
        <View style={[styles.dot, { backgroundColor: config.color }]} />
        <Text style={[styles.status, { color: config.color }]}>{config.label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  dateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  day: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    width: 32,
  },
  date: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  status: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
