import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { spacing, fontSize } from '../theme/spacing';
import SubjectCard from '../components/performance/SubjectCard';
import { mockSubjectPerformance } from '../data/mockData';

export default function PerformanceScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Subject-wise Performance</Text>
      {mockSubjectPerformance.map((sp) => (
        <SubjectCard key={sp.subject} performance={sp} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md, backgroundColor: colors.background },
  heading: { fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.md, color: colors.textPrimary },
});