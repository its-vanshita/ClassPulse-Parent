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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DatePickerModal from '../src/components/DatePickerModal';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useTeacher } from '../src/context/TeacherContext';
import {
  subscribeToBatches,
  subscribeToStudentsByBatch,
  addBulkTestResults,
} from '../src/services/firestoreService';
import { colors } from '../src/theme/colors';
import { spacing, borderRadius, fontSize } from '../src/theme/spacing';
import type { Batch, Student } from '../src/types';

export default function AddTestResultsScreen() {
  const router = useRouter();
  const { teacher } = useTeacher();

  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [subject, setSubject] = useState('');
  const [testName, setTestName] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [dateObj, setDateObj] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const date = dateObj.toISOString().slice(0, 10);
  const dateDisplay = `${dateObj.getDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dateObj.getMonth()]} ${dateObj.getFullYear()}`;

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
      // Reset marks for new batch
      const init: Record<string, string> = {};
      s.forEach((st) => { init[st.studentId] = ''; });
      setMarks(init);
    });
    return unsub;
  }, [selectedBatchId]);

  const handleSubmit = async () => {
    if (!testName.trim()) {
      Alert.alert('Required', 'Test name is required');
      return;
    }
    if (!totalMarks.trim() || isNaN(Number(totalMarks)) || Number(totalMarks) <= 0) {
      Alert.alert('Required', 'Enter a valid total marks value');
      return;
    }
    if (!selectedBatchId || !teacher) return;

    const total = Number(totalMarks);
    const results = students
      .filter((s) => marks[s.studentId]?.trim() !== '')
      .map((s) => {
        const obtained = Number(marks[s.studentId]);
        if (isNaN(obtained) || obtained < 0 || obtained > total) return null;
        return {
          studentId: s.studentId,
          batchId: selectedBatchId,
          subject: subject.trim() || batches.find((b) => b.batchId === selectedBatchId)?.subject || 'General',
          testName: testName.trim(),
          marksObtained: obtained,
          totalMarks: total,
          date: date.trim() || new Date().toISOString().split('T')[0],
          createdBy: teacher.teacherId,
        };
      })
      .filter(Boolean) as any[];

    if (results.length === 0) {
      Alert.alert('No marks', 'Enter marks for at least one student');
      return;
    }

    setBusy(true);
    try {
      await addBulkTestResults(results);
      Alert.alert('Success', `Saved ${results.length} result(s)`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Could not save test results');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Batch Picker */}
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

        {/* Test Info */}
        <Text style={styles.label}>Test Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Mid-Term Exam"
          value={testName}
          onChangeText={setTestName}
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

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Total Marks *</Text>
            <TextInput
              style={styles.input}
              placeholder="100"
              value={totalMarks}
              onChangeText={setTotalMarks}
              keyboardType="numeric"
              placeholderTextColor={colors.textLight}
            />
          </View>
          <View style={{ width: spacing.md }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity style={styles.dateBtn} onPress={() => setShowDatePicker(true)}>
              <Text style={[styles.dateBtnText, !dateObj && { color: colors.textLight }]}>
                {dateDisplay}
              </Text>
            </TouchableOpacity>
            <DatePickerModal
              visible={showDatePicker}
              date={dateObj ?? new Date()}
              title="Select Test Date"
              onConfirm={(d) => { setDateObj(d); setShowDatePicker(false); }}
              onCancel={() => setShowDatePicker(false)}
            />
          </View>
        </View>

        {/* Student marks list */}
        {students.length > 0 && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>
              Student Marks ({students.length} students)
            </Text>

            {students.map((s) => (
              <View key={s.studentId} style={styles.studentRow}>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName} numberOfLines={1}>
                    {s.name}
                  </Text>
                  {s.rollNumber ? (
                    <Text style={styles.rollNumber}>Roll #{s.rollNumber}</Text>
                  ) : null}
                </View>
                <TextInput
                  style={styles.marksInput}
                  placeholder="--"
                  value={marks[s.studentId] ?? ''}
                  onChangeText={(v) =>
                    setMarks((prev) => ({ ...prev, [s.studentId]: v }))
                  }
                  keyboardType="numeric"
                  placeholderTextColor={colors.textLight}
                />
                {totalMarks ? (
                  <Text style={styles.outOf}>/ {totalMarks}</Text>
                ) : null}
              </View>
            ))}
          </>
        )}

        {students.length === 0 && selectedBatchId && (
          <View style={styles.emptyBox}>
            <Ionicons name="people-outline" size={36} color={colors.textLight} />
            <Text style={styles.emptyText}>No students in this batch</Text>
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.btn, busy && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Save Test Results</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  row: { flexDirection: 'row' },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.xxl,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  studentInfo: { flex: 1, marginRight: spacing.sm },
  studentName: { fontSize: fontSize.md, fontWeight: '600', color: colors.textPrimary },
  rollNumber: { fontSize: fontSize.xs, color: colors.textLight, marginTop: 2 },
  marksInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    width: 64,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  outOf: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
    width: 40,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: { color: colors.textLight, marginTop: spacing.sm, fontSize: fontSize.sm },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  btnText: { color: colors.white, fontSize: fontSize.md, fontWeight: '700' },
});
