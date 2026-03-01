import React, { useState, useEffect } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTeacher } from '../src/context/TeacherContext';
import { addStudent, subscribeToBatches } from '../src/services/firestoreService';
import { colors } from '../src/theme/colors';
import { spacing, borderRadius, fontSize } from '../src/theme/spacing';
import type { Batch } from '../src/types';
import { Picker } from '@react-native-picker/picker';

export default function AddStudentScreen() {
  const { batchId: paramBatchId } = useLocalSearchParams<{ batchId?: string }>();
  const router = useRouter();
  const { teacher } = useTeacher();

  const [name, setName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState(paramBatchId || '');
  const [batches, setBatches] = useState<Batch[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!teacher) return;
    const unsub = subscribeToBatches(teacher.teacherId, (b) => {
      setBatches(b);
      if (!selectedBatchId && b.length > 0) setSelectedBatchId(b[0].batchId);
    });
    return unsub;
  }, [teacher]);

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Student name is required');
      return;
    }
    if (!parentEmail.trim()) {
      Alert.alert('Required', 'Parent email is required');
      return;
    }
    if (!selectedBatchId) {
      Alert.alert('Required', 'Please select a batch');
      return;
    }
    setBusy(true);
    try {
      await addStudent({
        name: name.trim(),
        parentEmail: parentEmail.trim().toLowerCase(),
        batchId: selectedBatchId,
        rollNumber: rollNumber.trim() || undefined,
      });
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Could not add student');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Student Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Full name"
        value={name}
        onChangeText={setName}
        placeholderTextColor={colors.textLight}
      />

      <Text style={styles.label}>Parent Email *</Text>
      <TextInput
        style={styles.input}
        placeholder="parent@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={parentEmail}
        onChangeText={setParentEmail}
        placeholderTextColor={colors.textLight}
      />

      <Text style={styles.label}>Roll Number</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 15"
        value={rollNumber}
        onChangeText={setRollNumber}
        placeholderTextColor={colors.textLight}
      />

      <Text style={styles.label}>Batch *</Text>
      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={selectedBatchId}
          onValueChange={(v) => setSelectedBatchId(v)}
          style={{ color: colors.textPrimary }}
        >
          {batches.map((b) => (
            <Picker.Item key={b.batchId} label={b.name} value={b.batchId} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleAdd} disabled={busy}>
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Add Student</Text>
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
  pickerWrap: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
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
