import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../common/Card';
import { colors } from '../../theme/colors';
import { spacing, fontSize, borderRadius } from '../../theme/spacing';
import { Homework } from '../../types';

interface Props {
  homework: Homework;
  compact?: boolean;
}

export default function HomeworkCard({ homework, compact }: Props) {
  const dueDate = homework.dueDate
    ? new Date(homework.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : null;

  return (
    <Card style={compact ? styles.compact : undefined}>
      <View style={styles.topRow}>
        <View style={styles.subjectBadge}>
          <Text style={styles.subjectText}>{homework.subject}</Text>
        </View>
        {dueDate && (
          <Text style={styles.due}>Due: {dueDate}</Text>
        )}
      </View>
      <Text style={styles.title}>{homework.title}</Text>
      {!compact && <Text style={styles.desc}>{homework.description}</Text>}
    </Card>
  );
}

const styles = StyleSheet.create({
  compact: {
    marginBottom: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  subjectBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  subjectText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: fontSize.sm,
  },
  due: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
  },
  desc: {
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
});