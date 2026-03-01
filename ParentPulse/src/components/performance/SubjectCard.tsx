import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../common/Card';
import ProgressBar from '../common/ProgressBar';
import { colors } from '../../theme/colors';
import { spacing, fontSize } from '../../theme/spacing';
import { SubjectPerformance } from '../../types';

interface Props {
  performance: SubjectPerformance;
}

export default function SubjectCard({ performance }: Props) {
  const getColor = (pct: number) => {
    if (pct >= 85) return colors.success;
    if (pct >= 60) return colors.warning;
    return colors.danger;
  };

  const color = getColor(performance.averagePercentage);

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.subject}>{performance.subject}</Text>
        <Text style={[styles.pct, { color }]}>{performance.averagePercentage}%</Text>
      </View>
      <ProgressBar progress={performance.averagePercentage} />
      {performance.teacherRemarks && (
        <Text style={styles.remarks}>{performance.teacherRemarks}</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  subject: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  pct: {
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  remarks: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
});
