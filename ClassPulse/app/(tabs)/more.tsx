import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useTeacher } from '../../src/context/TeacherContext';
import { updateTeacher } from '../../src/services/firestoreService';
import { colors } from '../../src/theme/colors';
import { spacing, borderRadius, fontSize } from '../../src/theme/spacing';

export default function MoreScreen() {
  const router = useRouter();
  const { signOut, isDemo } = useAuth();
  const { teacher } = useTeacher();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(teacher?.name || '');
  const [institute, setInstitute] = useState(teacher?.institute || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!teacher) return;
    setSaving(true);
    try {
      await updateTeacher(teacher.teacherId, {
        name: name.trim(),
        institute: institute.trim() || undefined,
      });
      setEditing(false);
    } catch {
      Alert.alert('Error', 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>
            {(teacher?.name || 'T').charAt(0).toUpperCase()}
          </Text>
        </View>
        {editing ? (
          <View style={{ flex: 1 }}>
            <TextInput
              style={styles.editInput}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.textLight}
            />
            <TextInput
              style={[styles.editInput, { marginTop: spacing.sm }]}
              value={institute}
              onChangeText={setInstitute}
              placeholder="Institute name"
              placeholderTextColor={colors.textLight}
            />
            <View style={styles.editActions}>
              <TouchableOpacity onPress={() => setEditing(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{teacher?.name || 'Set your name'}</Text>
            <Text style={styles.profilePhone}>{teacher?.phone || ''}</Text>
            {teacher?.institute && <Text style={styles.profileInstitute}>{teacher.institute}</Text>}
            <TouchableOpacity
              onPress={() => {
                setName(teacher?.name || '');
                setInstitute(teacher?.institute || '');
                setEditing(true);
              }}
            >
              <Text style={styles.editLink}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {isDemo && (
        <View style={styles.demoBanner}>
          <Ionicons name="information-circle" size={18} color={colors.warning} />
          <Text style={styles.demoText}>You are in Demo Mode. Data is local-only.</Text>
        </View>
      )}

      {/* Menu Items */}
      <Text style={styles.sectionTitle}>Actions</Text>
      <MenuItem
        icon="people"
        label="Manage Batches"
        onPress={() => router.push('/(tabs)/batches')}
      />
      <MenuItem
        icon="book"
        label="Manage Homework"
        onPress={() => router.push('/manage-homework')}
      />
      <MenuItem
        icon="megaphone"
        label="Manage Notices"
        onPress={() => router.push('/manage-notices')}
      />
      <MenuItem
        icon="trophy"
        label="Add Test Results"
        onPress={() => router.push('/add-test-results')}
      />
      <MenuItem
        icon="cash"
        label="Manage Fees"
        onPress={() => router.push('/manage-fees')}
      />

      <Text style={styles.sectionTitle}>Account</Text>
      <MenuItem
        icon="log-out"
        label="Sign Out"
        onPress={handleSignOut}
        danger
      />

      <Text style={styles.version}>ClassPulse Teacher v1.0.0</Text>
    </ScrollView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  danger,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons
        name={icon as any}
        size={20}
        color={danger ? colors.danger : colors.textPrimary}
      />
      <Text style={[styles.menuLabel, danger && { color: colors.danger }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textLight} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 40 },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: fontSize.xxl, fontWeight: '800', color: colors.primary },
  profileName: { fontSize: fontSize.lg, fontWeight: '700', color: colors.textPrimary },
  profilePhone: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
  profileInstitute: { fontSize: fontSize.sm, color: colors.textLight, marginTop: 2 },
  editLink: { color: colors.primary, fontWeight: '600', fontSize: fontSize.sm, marginTop: spacing.sm },
  editInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
    marginTop: spacing.md,
    alignItems: 'center',
  },
  cancelText: { color: colors.textSecondary, fontSize: fontSize.sm },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  saveBtnText: { color: colors.white, fontWeight: '700', fontSize: fontSize.sm },
  demoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warningLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
  },
  demoText: { color: colors.warning, fontSize: fontSize.sm, fontWeight: '600', flex: 1 },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
  },
  menuItem: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  menuLabel: { flex: 1, fontSize: fontSize.md, fontWeight: '600', color: colors.textPrimary },
  version: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: fontSize.xs,
    marginTop: spacing.xxl,
  },
});
