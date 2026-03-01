import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/src/theme/colors';
import { spacing, fontSize, borderRadius } from '@/src/theme/spacing';
import NoticeCard from '@/src/components/notices/NoticeCard';
import { useNotices } from '@/src/hooks/useNotices';
import { Notice } from '@/src/types';

const FILTERS: { label: string; value: Notice['type'] | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'General', value: 'general' },
  { label: 'Urgent', value: 'urgent' },
  { label: 'Event', value: 'event' },
  { label: 'Holiday', value: 'holiday' },
  { label: 'Exam', value: 'exam' },
  { label: 'Alert', value: 'alert' },
];

export default function NoticesScreen() {
  const { notices, loading } = useNotices();
  const [filter, setFilter] = useState<Notice['type'] | 'all'>('all');

  const filtered = useMemo(
    () => (filter === 'all' ? notices : notices.filter((n) => n.type === filter)),
    [filter, notices]
  );

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
        <Text style={styles.headerTitle}>Notices</Text>
        <Text style={styles.headerSub}>{notices.length} announcements</Text>
      </View>

      {/* Filters */}
      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(item) => item.value}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.filterBtn, filter === item.value && styles.filterBtnActive]}
            onPress={() => setFilter(item.value)}
          >
            <Text style={[styles.filterText, filter === item.value && styles.filterTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Notices List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.noticeId}
        renderItem={({ item }) => <NoticeCard notice={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No notices found</Text>
          </View>
        }
      />
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
  headerSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.sm,
    marginTop: 4,
  },
  filterRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
});
