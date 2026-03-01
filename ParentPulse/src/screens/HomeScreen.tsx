import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, fontSize } from '../theme/spacing';
import StatCard from '../components/common/StatCard';
import HomeworkCard from '../components/homework/HomeworkCard';
import NoticeCard from '../components/notices/NoticeCard';
import SectionHeader from '../components/common/SectionHeader';
import { mockDashboard, mockHomework, mockNotices } from '../data/mockData';

export default function HomeScreen() {
  const { child, attendancePercentage, overallPerformance } = mockDashboard;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome Back!</Text>
        <Text style={styles.name}>{child.name}</Text>
        <Text style={styles.grade}>Grade {child.grade ?? '-'} {child.institute ? `• ${child.institute}` : ''}</Text>
      </View>

      <View style={styles.row}>
        <StatCard label="Attendance" value={`${attendancePercentage}%`} color={colors.success} />
        <View style={{ width: spacing.sm }} />
        <StatCard label="Performance" value={`${overallPerformance}%`} color={colors.primary} />
      </View>

      <SectionHeader title="Latest Homework">
        {mockHomework.slice(0, 2).map((hw) => (
          <HomeworkCard key={hw.homeworkId} homework={hw} compact />
        ))}
      </SectionHeader>

      <SectionHeader title="Announcements">
        {mockNotices.slice(0, 2).map((n) => (
          <NoticeCard key={n.noticeId} notice={n} compact />
        ))}
      </SectionHeader>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, padding: 20, paddingTop: 48 },
  welcome: { color: 'rgba(255,255,255,0.8)', fontSize: fontSize.md },
  name: { color: '#fff', fontSize: fontSize.xxl, fontWeight: 'bold', marginTop: 4 },
  grade: { color: 'rgba(255,255,255,0.7)', fontSize: fontSize.sm, marginTop: 4 },
  row: { flexDirection: 'row', padding: spacing.md },
});