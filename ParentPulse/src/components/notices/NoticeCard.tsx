import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../common/Card';
import { colors } from '../../theme/colors';
import { spacing, fontSize, borderRadius } from '../../theme/spacing';
import { Notice } from '../../types';

interface Props {
  notice: Notice;
  compact?: boolean;
}

const TYPE_CONFIG: Record<Notice['type'], { label: string; color: string; bg: string }> = {
  general: { label: 'General', color: colors.primary, bg: colors.primaryLight },
  urgent: { label: 'Urgent', color: colors.danger, bg: colors.dangerLight },
  event: { label: 'Event', color: colors.info, bg: colors.infoLight },
  holiday: { label: 'Holiday', color: colors.holiday, bg: colors.warningLight },
  exam: { label: 'Exam', color: colors.info, bg: colors.infoLight },
  alert: { label: 'Alert', color: colors.danger, bg: colors.dangerLight },
};

export default function NoticeCard({ notice, compact }: Props) {
  const config = TYPE_CONFIG[notice.type];
  const dateStr = new Date(notice.date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Card>
      <View style={styles.topRow}>
        <View style={[styles.typeBadge, { backgroundColor: config.bg }]}>
          <Text style={[styles.typeText, { color: config.color }]}>{config.label}</Text>
        </View>
        <Text style={styles.date}>{dateStr}</Text>
      </View>
      <Text style={styles.title}>{notice.title}</Text>
      {!compact && <Text style={styles.desc}>{notice.description}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  typeText: {
    fontWeight: '600',
    fontSize: fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  title: {
    fontWeight: '700',
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  desc: {
    marginTop: spacing.xs,
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
});