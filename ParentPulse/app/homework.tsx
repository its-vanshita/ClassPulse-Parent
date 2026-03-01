import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/src/theme/colors';
import { spacing, fontSize, borderRadius } from '@/src/theme/spacing';
import HomeworkCard from '@/src/components/homework/HomeworkCard';
import { useHomework } from '@/src/hooks/useHomework';

export default function HomeworkScreen() {
  const router = useRouter();
  const { homework, loading } = useHomework();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Homework</Text>
        <Text style={styles.headerSub}>{homework.length} assignments</Text>
      </View>

      {loading && (
        <View style={{ padding: spacing.xl, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      <FlatList
        data={homework}
        keyExtractor={(item) => item.homeworkId}
        renderItem={({ item }) => <HomeworkCard homework={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No homework assigned</Text>
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
  backBtn: {
    marginBottom: spacing.sm,
  },
  backText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSize.md,
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
  list: {
    padding: spacing.md,
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
