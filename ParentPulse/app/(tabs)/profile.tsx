import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { colors } from '@/src/theme/colors';
import { spacing, fontSize, borderRadius } from '@/src/theme/spacing';
import Card from '@/src/components/common/Card';
import InfoRow from '@/src/components/common/InfoRow';
import { useStudent } from '@/src/context/StudentContext';
import { useAuth } from '@/src/context/AuthContext';

export default function ProfileScreen() {
  const { selectedStudent, isDemo, loading } = useStudent();
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  if (loading || !selectedStudent) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const child = selectedStudent;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Header with Avatar */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {child.name.split(' ').map((w: string) => w[0]).join('')}
          </Text>
        </View>
        <Text style={styles.name}>{child.name}</Text>
        <Text style={styles.meta}>
          Grade {child.grade ?? '-'} {child.section ? `• Section ${child.section}` : ''}
        </Text>
        {isDemo && (
          <View style={styles.demoBadge}>
            <Text style={styles.demoText}>Demo Mode</Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Child Details */}
        <Text style={styles.sectionTitle}>Child Details</Text>
        <Card>
          <InfoRow label="Full Name" value={child.name} />
          <InfoRow label="Grade" value={child.grade ?? '-'} />
          {child.section && <InfoRow label="Section" value={child.section} />}
          {child.rollNumber && <InfoRow label="Roll Number" value={child.rollNumber} />}
          <InfoRow label="Batch ID" value={child.batchId} />
        </Card>

        {/* Institute Info */}
        {child.institute && (
          <>
            <Text style={styles.sectionTitle}>Institute</Text>
            <Card>
              <InfoRow label="Institute Name" value={child.institute} />
            </Card>
          </>
        )}

        {/* Parent Details */}
        <Text style={styles.sectionTitle}>Parent / Guardian</Text>
        <Card>
          <InfoRow label="Email" value={user?.email ?? child.parentEmail} />
          {user?.user_metadata?.full_name && <InfoRow label="Name" value={user.user_metadata.full_name} />}
        </Card>

        {/* Sync Status */}
        <Text style={styles.sectionTitle}>Sync Status</Text>
        <Card>
          <InfoRow label="Data Mode" value={isDemo ? 'Offline (Demo)' : 'Live (Supabase)'} />
          <InfoRow label="Connected" value={isDemo ? 'No' : 'Yes'} />
        </Card>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>ParentPulse v1.0.0</Text>

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
    paddingBottom: spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  avatarText: {
    color: '#fff',
    fontSize: fontSize.xxl,
    fontWeight: '700',
  },
  name: {
    color: '#fff',
    fontSize: fontSize.xl,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  meta: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.sm,
    marginTop: 4,
  },
  scrollContent: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  logoutBtn: {
    marginTop: spacing.xl,
    backgroundColor: colors.dangerLight,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  logoutText: {
    color: colors.danger,
    fontSize: fontSize.md,
    fontWeight: '700',
  },
  version: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: fontSize.xs,
    marginTop: spacing.md,
  },
  demoBadge: {
    marginTop: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  demoText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});
