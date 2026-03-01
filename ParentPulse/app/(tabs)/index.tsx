import React from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { spacing, fontSize, borderRadius } from '@/src/theme/spacing';
import Card from '@/src/components/common/Card';
import StatCard from '@/src/components/common/StatCard';
import HomeworkCard from '@/src/components/homework/HomeworkCard';
import NoticeCard from '@/src/components/notices/NoticeCard';
import SectionHeader from '@/src/components/common/SectionHeader';
import { useStudent } from '@/src/context/StudentContext';
import { useAttendance } from '@/src/hooks/useAttendance';
import { useHomework } from '@/src/hooks/useHomework';
import { useNotices } from '@/src/hooks/useNotices';
import { usePerformance } from '@/src/hooks/usePerformance';

export default function HomeScreen() {
  const router = useRouter();
  const { selectedStudent, loading: studentLoading, isDemo } = useStudent();
  const { overall } = useAttendance();
  const { homework } = useHomework();
  const { notices } = useNotices();
  const { testResults, subjectPerformance } = usePerformance();

  if (studentLoading || !selectedStudent) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const child = selectedStudent;
  const attendancePercentage = overall.percentage;
  const overallPerformance = subjectPerformance.length > 0
    ? Math.round(subjectPerformance.reduce((s, p) => s + p.averagePercentage, 0) / subjectPerformance.length)
    : 0;
  const recentTests = testResults.slice(0, 3);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.parentName}>Parent of {child.name}</Text>
          <View style={styles.childInfo}>
            <Text style={styles.childMeta}>
              Grade {child.grade ?? '-'} {child.section ? `• Section ${child.section}` : ''} {child.institute ? `• ${child.institute}` : ''}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <StatCard
            label="Attendance"
            value={`${attendancePercentage}%`}
            color={colors.success}
          />
          <View style={{ width: spacing.sm }} />
          <StatCard
            label="Performance"
            value={`${overallPerformance}%`}
            color={colors.primary}
          />
          <View style={{ width: spacing.sm }} />
          <StatCard
            label="Tests"
            value={recentTests.length.toString()}
            color={colors.accent}
          />
        </View>

        {/* Recent Test Scores */}
        <SectionHeader
          title="Recent Test Scores"
          rightAction={
            <TouchableOpacity onPress={() => router.push('/(tabs)/performance')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          }
        >
          <Card>
            {recentTests.map((t, i) => {
              const scoreColor = t.percentage >= 85 ? colors.success : t.percentage >= 60 ? colors.warning : colors.danger;
              return (
                <View
                  key={t.id}
                  style={[styles.testRow, i < recentTests.length - 1 && styles.testRowBorder]}
                >
                  <View>
                    <Text style={styles.testSubject}>{t.subject}</Text>
                    <Text style={styles.testName}>{t.testName}</Text>
                  </View>
                  <View style={[styles.testScore, { backgroundColor: scoreColor + '18' }]}>
                    <Text style={[styles.testScoreText, { color: scoreColor }]}>
                      {t.marks}/{t.total}
                    </Text>
                  </View>
                </View>
              );
            })}
          </Card>
        </SectionHeader>

        {/* Latest Homework */}
        <SectionHeader
          title="Latest Homework"
          rightAction={
            <TouchableOpacity onPress={() => router.push('/homework')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          }
        >
          {homework.slice(0, 2).map((hw) => (
            <HomeworkCard key={hw.homeworkId} homework={hw} compact />
          ))}
        </SectionHeader>

        {/* Announcements */}
        <SectionHeader
          title="Announcements"
          rightAction={
            <TouchableOpacity onPress={() => router.push('/(tabs)/notices')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          }
        >
          {notices.slice(0, 2).map((n) => (
            <NoticeCard key={n.noticeId} notice={n} compact />
          ))}
        </SectionHeader>

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
    paddingTop: Platform.OS === 'ios' ? 56 : StatusBar.currentHeight ? StatusBar.currentHeight + 16 : 40,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  headerContent: {},
  greeting: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSize.md,
  },
  parentName: {
    color: '#FFFFFF',
    fontSize: fontSize.xxl,
    fontWeight: '700',
    marginTop: 4,
  },
  childInfo: {
    marginTop: spacing.sm,
  },
  childMeta: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.sm,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
  },
  viewAll: {
    color: colors.primary,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  testRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  testRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  testSubject: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  testName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  testScore: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  testScoreText: {
    fontWeight: '700',
    fontSize: fontSize.sm,
  },
});
