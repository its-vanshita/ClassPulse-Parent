import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTeacher } from '../src/context/TeacherContext';
import {
  subscribeToNoticesByTeacher,
  deleteNotice,
} from '../src/services/firestoreService';
import { colors } from '../src/theme/colors';
import { spacing, borderRadius, fontSize } from '../src/theme/spacing';
import type { Notice, NoticeType } from '../src/types';

const TYPE_COLOR: Record<NoticeType, { bg: string; fg: string }> = {
  general: { bg: colors.infoLight, fg: colors.info },
  urgent: { bg: colors.dangerLight, fg: colors.danger },
  event: { bg: colors.primaryLight, fg: colors.primary },
  holiday: { bg: colors.warningLight, fg: colors.warning },
  exam: { bg: colors.infoLight, fg: colors.info },
  alert: { bg: colors.dangerLight, fg: colors.danger },
};

export default function ManageNoticesScreen() {
  const router = useRouter();
  const { teacher } = useTeacher();

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacher) return;
    const unsub = subscribeToNoticesByTeacher(teacher.teacherId, (n) => {
      setNotices(n);
      setLoading(false);
    });
    return unsub;
  }, [teacher]);

  const handleDelete = (n: Notice) => {
    Alert.alert('Delete Notice', `Delete "${n.title}"?`, [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteNotice(n.noticeId);
          } catch {
            Alert.alert('Error', 'Could not delete notice');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: Notice }) => {
    const tc = TYPE_COLOR[item.type] ?? TYPE_COLOR.general;
    const dateStr = new Date(item.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return (
      <TouchableOpacity
        style={styles.card}
        onLongPress={() => handleDelete(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardTop}>
          <View style={[styles.typeBadge, { backgroundColor: tc.bg }]}>
            <Text style={[styles.typeText, { color: tc.fg }]}>
              {item.type.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.date}>{dateStr}</Text>
        </View>
        <Text style={styles.title}>{item.title}</Text>
        {item.description ? (
          <Text style={styles.desc} numberOfLines={3}>
            {item.description}
          </Text>
        ) : null}
        {item.targetBatchIds.length > 0 && (
          <View style={styles.footer}>
            <Ionicons name="people-outline" size={13} color={colors.textLight} />
            <Text style={styles.footerText}>
              {item.targetBatchIds.length} batch{item.targetBatchIds.length > 1 ? 'es' : ''}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notices}
        keyExtractor={(item) => item.noticeId}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="megaphone-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No notices posted</Text>
            <Text style={styles.emptyHint}>Tap the + button to post a notice</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/post-notice')}
      >
        <Ionicons name="add" size={28} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingBottom: 100 },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  typeText: { fontSize: fontSize.xs, fontWeight: '700' },
  date: { fontSize: fontSize.xs, color: colors.textSecondary },
  title: { fontSize: fontSize.md, fontWeight: '700', color: colors.textPrimary },
  desc: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
  },
  footerText: { fontSize: fontSize.xs, color: colors.textLight },
  emptyBox: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyHint: { fontSize: fontSize.sm, color: colors.textLight, marginTop: spacing.xs },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
