import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, fontSize } from '../theme/spacing';
import Card from '../components/common/Card';
import ProgressBar from '../components/common/ProgressBar';
import AttendanceRow from '../components/attendance/AttendanceRow';
import { mockAttendance } from '../data/mockData';

export default function AttendanceScreen() {
  return (
    <View style={styles.container}>
      <Card>
        <Text style={styles.title}>Overall Attendance</Text>
        <Text style={styles.percent}>{mockAttendance.percentage}%</Text>
        <ProgressBar progress={mockAttendance.percentage} />
        <Text style={styles.sub}>
          {mockAttendance.presentDays} present of {mockAttendance.totalDays} working days
        </Text>
      </Card>

      <Text style={styles.recordsTitle}>Daily Records</Text>
      <FlatList
        data={[...mockAttendance.records].reverse()}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => <AttendanceRow record={item} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md, backgroundColor: colors.background },
  title: { fontWeight: '700', fontSize: fontSize.lg, color: colors.textPrimary },
  percent: { fontSize: 28, marginVertical: 10, fontWeight: '700', color: colors.primary },
  sub: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.sm },
  recordsTitle: { fontSize: fontSize.lg, fontWeight: '700', marginTop: spacing.lg, marginBottom: spacing.sm, color: colors.textPrimary },
});