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
  Switch,
} from 'react-native';
import DatePickerModal from '../src/components/DatePickerModal';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useTeacher } from '../src/context/TeacherContext';
import {
  subscribeToBatches,
  subscribeToStudentsByBatch,
  createBulkFees,
  createFee,
} from '../src/services/firestoreService';
import { colors } from '../src/theme/colors';
import { spacing, borderRadius, fontSize } from '../src/theme/spacing';
import type { Batch, Student } from '../src/types';

export default function CreateFeeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ batchId: string }>();
  const { teacher } = useTeacher();

  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState(params.batchId ?? '');
  const [students, setStudents] = useState<Student[]>([]);

  // Form fields
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDateObj, setDueDateObj] = useState(new Date(Date.now() + 30 * 86400000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [remarks, setRemarks] = useState('');

  const dueDate = dueDateObj.toISOString().slice(0, 10);
  const dueDateDisplay = `${dueDateObj.getDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dueDateObj.getMonth()]} ${dueDateObj.getFullYear()}`;
  const [bulkMode, setBulkMode] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [busy, setBusy] = useState(false);

  // Load batches
  useEffect(() => {
    if (!teacher) return;
    const unsub = subscribeToBatches(teacher.teacherId, (b) => {
      setBatches(b);
      if (b.length > 0 && !selectedBatchId) setSelectedBatchId(b[0].batchId);
    });
    return unsub;
  }, [teacher]);

  // Load students when batch changes
  useEffect(() => {
    if (!selectedBatchId) {
      setStudents([]);
      return;
    }
    const unsub = subscribeToStudentsByBatch(selectedBatchId, (s) => {
      setStudents(s);
      if (s.length > 0 && !selectedStudentId) setSelectedStudentId(s[0].studentId);
    });
    return unsub;
  }, [selectedBatchId]);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Title is required');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Required', 'Enter a valid amount');
      return;
    }
    if (!selectedBatchId || !teacher) return;

    setBusy(true);
    try {
      if (bulkMode) {
        // Create fee for ALL students in batch
        const records = students.map((s) => ({
          studentId: s.studentId,
          batchId: selectedBatchId,
          title: title.trim(),
          amount: numAmount,
          paidAmount: 0,
          dueDate,
          status: 'pending' as const,
          remarks: remarks.trim(),
          createdBy: teacher.teacherId,
        }));
        if (records.length === 0) {
          Alert.alert('No Students', 'Add students to this batch first');
          setBusy(false);
          return;
        }
        await createBulkFees(records);
        Alert.alert('Success', `Fee created for ${records.length} student(s)`, [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        // Individual student
        if (!selectedStudentId) {
          Alert.alert('Required', 'Select a student');
          setBusy(false);
          return;
        }
        await createFee({
          studentId: selectedStudentId,
          batchId: selectedBatchId,
          title: title.trim(),
          amount: numAmount,
          paidAmount: 0,
          dueDate,
          status: 'pending',
          remarks: remarks.trim(),
          createdBy: teacher.teacherId,
        });
        Alert.alert('Success', 'Fee created', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not create fee record');
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

      {/* Bulk toggle */}
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Assign to all students in batch</Text>
        <Switch
          value={bulkMode}
          onValueChange={setBulkMode}
          trackColor={{ true: colors.primary, false: colors.border }}
          thumbColor={colors.white}
        />
      </View>

      {!bulkMode && (
        <>
          <Text style={styles.label}>Student *</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={selectedStudentId}
              onValueChange={setSelectedStudentId}
              style={{ color: colors.textPrimary }}
            >
              {students.map((s) => (
                <Picker.Item key={s.studentId} label={s.name} value={s.studentId} />
              ))}
            </Picker>
          </View>
        </>
      )}

      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Monthly Tuition – June"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor={colors.textLight}
      />

      <Text style={styles.label}>Amount (₹) *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. 3000"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholderTextColor={colors.textLight}
      />

      <Text style={styles.label}>Due Date</Text>
      <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.dateBtnText}>{dueDateDisplay}</Text>
      </TouchableOpacity>
      <DatePickerModal
        visible={showDatePicker}
        date={dueDateObj}
        minimumDate={new Date()}
        title="Select Due Date"
        onConfirm={(d) => { setDueDateObj(d); setShowDatePicker(false); }}
        onCancel={() => setShowDatePicker(false)}
      />

      <Text style={styles.label}>Remarks</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Optional notes..."
        value={remarks}
        onChangeText={setRemarks}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        placeholderTextColor={colors.textLight}
      />

      <Text style={styles.hint}>
        {bulkMode
          ? `This will create a fee entry of ₹${amount || '0'} for all ${students.length} student(s) in the batch.`
          : 'This will create a fee entry for the selected student.'}
      </Text>

      <TouchableOpacity style={styles.btn} onPress={handleCreate} disabled={busy}>
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Create Fee</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: 60 },
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
  multiline: { minHeight: 80 },
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
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginTop: spacing.sm,
  },
  toggleLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.md,
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: spacing.lg,
    textAlign: 'center',
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
