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
import DatePickerModal from '../src/components/DatePickerModal';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useTeacher } from '../src/context/TeacherContext';
import { assignHomework, subscribeToBatches } from '../src/services/firestoreService';
import { colors } from '../src/theme/colors';
import { spacing, borderRadius, fontSize } from '../src/theme/spacing';
import type { Batch } from '../src/types';

export default function AssignHomeworkScreen() {
  const router = useRouter();
  const { teacher } = useTeacher();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDateObj, setDueDateObj] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [busy, setBusy] = useState(false);

  const dueDate = dueDateObj ? dueDateObj.toISOString().slice(0, 10) : '';
  const dueDateDisplay = dueDateObj
    ? `${dueDateObj.getDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dueDateObj.getMonth()]} ${dueDateObj.getFullYear()}`
    : 'Tap to pick a date';

  useEffect(() => {
    if (!teacher) return;
    const unsub = subscribeToBatches(teacher.teacherId, (b) => {
      setBatches(b);
      if (b.length > 0 && !selectedBatchId) setSelectedBatchId(b[0].batchId);
    });
    return unsub;
  }, [teacher]);

  const handleAssign = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Title is required');
      return;
    }
    if (!selectedBatchId || !teacher) return;

    setBusy(true);
    try {
      await assignHomework({
        batchId: selectedBatchId,
        subject: subject.trim() || batches.find((b) => b.batchId === selectedBatchId)?.subject || 'General',
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate || undefined,
        createdBy: teacher.teacherId,
      });
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Could not assign homework');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Batch *</Text>
      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={selectedBatchId}
          onValueChange={setSelectedBatchId}
          style={{ color: colors.textPrimary }}
        >
          {batches.map((b) => (
            <Picker.Item key={b.batchId} label={b.name} value={b.batchId} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Subject</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Mathematics"
        value={subject}
        onChangeText={setSubject}
        placeholderTextColor={colors.textLight}
      />

      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Chapter 5 Exercises"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor={colors.textLight}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Details about the homework..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        placeholderTextColor={colors.textLight}
      />

      <Text style={styles.label}>Due Date</Text>
      <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
        <Text style={[styles.dateBtnText, !dueDateObj && { color: colors.textLight }]}>{dueDateDisplay}</Text>
      </TouchableOpacity>
      <DatePickerModal
        visible={showDatePicker}
        date={dueDateObj ?? new Date()}
        minimumDate={new Date()}
        title="Select Due Date"
        onConfirm={(d) => { setDueDateObj(d); setShowDatePicker(false); }}
        onCancel={() => setShowDatePicker(false)}
      />

      <TouchableOpacity style={styles.btn} onPress={handleAssign} disabled={busy}>
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Assign Homework</Text>
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
  multiline: { minHeight: 100 },
  dateBtn: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateBtnText: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    fontWeight: '600',
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
