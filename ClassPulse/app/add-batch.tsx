import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTeacher } from '../src/context/TeacherContext';
import { createBatch } from '../src/services/firestoreService';
import { colors } from '../src/theme/colors';
import { spacing, borderRadius, fontSize } from '../src/theme/spacing';

export default function AddBatchScreen() {
  const router = useRouter();
  const { teacher } = useTeacher();
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [section, setSection] = useState('');
  const [subject, setSubject] = useState('');
  const [busy, setBusy] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Batch name is required');
      return;
    }
    if (!teacher) return;
    setBusy(true);
    try {
      await createBatch({
        teacherId: teacher.teacherId,
        name: name.trim(),
        grade: grade.trim() || undefined,
        section: section.trim() || undefined,
        subject: subject.trim() || undefined,
        studentIds: [],
      });
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Could not create batch');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Batch Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Class 10-A"
        value={name}
        onChangeText={setName}
        placeholderTextColor={colors.textLight}
      />

      <Text style={styles.label}>Grade</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 10"
        value={grade}
        onChangeText={setGrade}
        placeholderTextColor={colors.textLight}
      />

      <Text style={styles.label}>Section</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. A"
        value={section}
        onChangeText={setSection}
        placeholderTextColor={colors.textLight}
      />

      <Text style={styles.label}>Subject</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Mathematics"
        value={subject}
        onChangeText={setSubject}
        placeholderTextColor={colors.textLight}
      />

      <TouchableOpacity style={styles.btn} onPress={handleCreate} disabled={busy}>
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Create Batch</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.lg,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  btnText: { color: colors.white, fontSize: fontSize.md, fontWeight: '700' },
});
