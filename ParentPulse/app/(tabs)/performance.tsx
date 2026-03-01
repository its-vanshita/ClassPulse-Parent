import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/src/theme/colors';
import { spacing, fontSize, borderRadius } from '@/src/theme/spacing';
import SubjectCard from '@/src/components/performance/SubjectCard';
import TestResultCard from '@/src/components/performance/TestResultCard';
import { usePerformance } from '@/src/hooks/usePerformance';

type Tab = 'subjects' | 'tests';

export default function PerformanceScreen() {
  const [tab, setTab] = useState<Tab>('subjects');
  const { testResults, subjectPerformance, loading } = usePerformance();

  const overallAvg = subjectPerformance.length > 0
    ? Math.round(
        subjectPerformance.reduce((s, p) => s + p.averagePercentage, 0) /
          subjectPerformance.length
      )
    : 0;

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
        <Text style={styles.headerTitle}>Performance</Text>
        <View style={styles.overallRow}>
          <Text style={styles.overallLabel}>Overall Average</Text>
          <Text style={styles.overallValue}>{overallAvg}%</Text>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'subjects' && styles.tabBtnActive]}
          onPress={() => setTab('subjects')}
        >
          <Text style={[styles.tabText, tab === 'subjects' && styles.tabTextActive]}>
            By Subject
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'tests' && styles.tabBtnActive]}
          onPress={() => setTab('tests')}
        >
          <Text style={[styles.tabText, tab === 'tests' && styles.tabTextActive]}>
            Test Scores
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'subjects' ? (
          subjectPerformance.map((sp) => (
            <SubjectCard key={sp.subject} performance={sp} />
          ))
        ) : (
          testResults.map((tr) => (
            <TestResultCard key={tr.id} result={tr} />
          ))
        )}
        <View style={{ height: spacing.xl }} />
      </ScrollView>
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
  overallRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  overallLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSize.sm,
  },
  overallValue: {
    color: '#fff',
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.sm,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm - 2,
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#fff',
  },
  scrollContent: {
    padding: spacing.md,
  },
});
