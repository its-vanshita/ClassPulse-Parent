import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useTeacher } from '../../src/context/TeacherContext';
import {
  subscribeToBatches,
  subscribeToStudentsByTeacher,
  subscribeToHomeworkByTeacher,
  subscribeToNoticesByTeacher,
} from '../../src/services/firestoreService';
import { colors } from '../../src/theme/colors';
import { spacing, borderRadius, fontSize } from '../../src/theme/spacing';
import type { Batch, Student, Homework, Notice } from '../../src/types';

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { teacher, isDemo } = useTeacher();

  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!teacher) return;
    const unsubs: (() => void)[] = [];

    unsubs.push(subscribeToBatches(teacher.teacherId, setBatches));
    unsubs.push(subscribeToHomeworkByTeacher(teacher.teacherId, setHomework));
    unsubs.push(subscribeToNoticesByTeacher(teacher.teacherId, setNotices));

    return () => unsubs.forEach((u) => u());
  }, [teacher]);

  useEffect(() => {
    if (!teacher || batches.length === 0) return;
    const batchIds = batches.map((b) => b.batchId);
    const unsub = subscribeToStudentsByTeacher(teacher.teacherId, batchIds, setStudents);
    return unsub;
  }, [teacher, batches]);

  // Check if the user is not authenticated and not in demo mode
  useEffect(() => {
    if (!user && !isDemo) {
      router.replace('/login');
    }
  }, [user, isDemo]);

  const quickActions = [
    { icon: 'checkmark-circle' as const, label: 'Attendance', color: colors.success, route: '/(tabs)/attendance' },
    { icon: 'book' as const, label: 'Homework', color: colors.info, route: '/manage-homework' },
    { icon: 'cash' as const, label: 'Fees', color: '#7C3AED', route: '/manage-fees' },
    { icon: 'megaphone' as const, label: 'Notices', color: colors.warning, route: '/manage-notices' },
    { icon: 'trophy' as const, label: 'Test Results', color: colors.accent, route: '/add-test-results' },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            // Re-triggering subscriptions via teacher change is heavy;
            // instead rely on realtime and just dismiss the spinner.
            setTimeout(() => setRefreshing(false), 600);
          }}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello,</Text>
          <Text style={styles.teacherName}>{teacher?.name || 'Teacher'}</Text>
        </View>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => router.push('/(tabs)/more')}
        >
          <Ionicons name="person-circle" size={40} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard label="Batches" value={batches.length} icon="people" color={colors.primary} />
        <StatCard label="Students" value={students.length} icon="school" color={colors.success} />
        <StatCard label="Homework" value={homework.length} icon="book" color={colors.info} />
        <StatCard label="Notices" value={notices.length} icon="megaphone" color={colors.warning} />
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={styles.actionCard}
            onPress={() => router.push(action.route as any)}
          >
            <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
              <Ionicons name={action.icon} size={24} color={action.color} />
            </View>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Batches */}
      <Text style={styles.sectionTitle}>Your Batches</Text>
      {batches.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="add-circle-outline" size={40} color={colors.textLight} />
          <Text style={styles.emptyText}>No batches yet</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/add-batch')}>
            <Text style={styles.addBtnText}>Create Batch</Text>
          </TouchableOpacity>
        </View>
      ) : (
        batches.slice(0, 4).map((batch) => (
          <TouchableOpacity
            key={batch.batchId}
            style={styles.batchCard}
            onPress={() => router.push({ pathname: '/batch-details', params: { batchId: batch.batchId } })}
          >
            <View style={styles.batchIcon}>
              <Ionicons name="people" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.batchName}>{batch.name}</Text>
              <Text style={styles.batchSub}>
                {batch.studentIds.length} students{batch.subject ? ` · ${batch.subject}` : ''}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
          </TouchableOpacity>
        ))
      )}

      {/* Recent Notices */}
      {notices.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recent Notices</Text>
          {notices.slice(0, 3).map((n) => (
            <View key={n.noticeId} style={styles.noticeCard}>
              <View style={[styles.noticeTag, n.type === 'urgent' && { backgroundColor: colors.dangerLight }]}>
                <Text
                  style={[styles.noticeTagText, n.type === 'urgent' && { color: colors.danger }]}
                >
                  {n.type.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.noticeTitle}>{n.title}</Text>
              <Text style={styles.noticeDesc} numberOfLines={2}>{n.description}</Text>
            </View>
          ))}
        </>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.xxl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { color: colors.primaryLight, fontSize: fontSize.md },
  teacherName: { color: colors.white, fontSize: fontSize.xxl, fontWeight: '800' },
  profileBtn: { padding: spacing.xs },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.xl,
  },
  statCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  statValue: { fontSize: fontSize.xl, fontWeight: '800', color: colors.textPrimary, marginTop: 4 },
  statLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  actionCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    width: '47%',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textPrimary },
  emptyCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: { color: colors.textLight, marginTop: spacing.sm, marginBottom: spacing.md },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  addBtnText: { color: colors.white, fontWeight: '700', fontSize: fontSize.sm },
  batchCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  batchIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  batchName: { fontSize: fontSize.md, fontWeight: '700', color: colors.textPrimary },
  batchSub: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  noticeCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  noticeTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.infoLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  noticeTagText: { fontSize: fontSize.xs, fontWeight: '700', color: colors.info },
  noticeTitle: { fontSize: fontSize.md, fontWeight: '700', color: colors.textPrimary },
  noticeDesc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 },
});
