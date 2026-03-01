import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../common/Card';
import { colors } from '../../theme/colors';
import { spacing, fontSize } from '../../theme/spacing';
import { TestResult } from '../../types';

interface Props {
  result: TestResult;
}

export default function TestResultCard({ result }: Props) {
  const getScoreColor = (pct: number) => {
    if (pct >= 85) return colors.success;
    if (pct >= 60) return colors.warning;
    return colors.danger;
  };

  const scoreColor = getScoreColor(result.percentage);

  return (
    <Card style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.subjectWrap}>
          <Text style={styles.subject}>{result.subject}</Text>
          <Text style={styles.testName}>{result.testName}</Text>
        </View>
        <View style={[styles.scoreBadge, { backgroundColor: scoreColor + '18' }]}>
          <Text style={[styles.scoreText, { color: scoreColor }]}>
            {result.marks}/{result.total}
          </Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${result.percentage}%`, backgroundColor: scoreColor }]} />
      </View>
      <Text style={[styles.percentLabel, { color: scoreColor }]}>{result.percentage}%</Text>

      {result.remarks && (
        <Text style={styles.remarks}>Remark: {result.remarks}</Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectWrap: {
    flex: 1,
  },
  subject: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  testName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreText: {
    fontWeight: '700',
    fontSize: fontSize.md,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'right',
  },
  remarks: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
});
