import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DatePickerModal from '../src/components/DatePickerModal';
import { useTeacher } from '../src/context/TeacherContext';
import {
  subscribeToStudentsByBatch,
  subscribeToAttendanceByBatch,
  markBatchAttendance,
} from '../src/services/firestoreService';
import { colors } from '../src/theme/colors';
import { spacing, borderRadius, fontSize } from '../src/theme/spacing';
import type { Student, AttendanceRecord, AttendanceStatus } from '../src/types';

export default function MarkAttendanceScreen() {
  const { batchId } = useLocalSearchParams<{ batchId: string }>();
  const router = useRouter();
  const { teacher } = useTeacher();
  const [students, setStudents] = useState<Student[]>([]);
  const [existing, setExisting] = useState<AttendanceRecord[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [saving, setSaving] = useState(false);
  const [dateObj, setDateObj] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const today = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
  const dateDisplay = `${dateObj.getDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][dateObj.getMonth()]} ${dateObj.getFullYear()}`;

  useEffect(() => {
    if (!batchId) return;
    const unsubs: (() => void)[] = [];
    unsubs.push(subscribeToStudentsByBatch(batchId, setStudents));
    unsubs.push(subscribeToAttendanceByBatch(batchId, today, setExisting));
    return () => unsubs.forEach((u) => u());
  }, [batchId]);

  // Pre-fill statuses from existing records
  useEffect(() => {
    if (existing.length > 0) {
      const map: Record<string, AttendanceStatus> = {};
      existing.forEach((r) => (map[r.studentId] = r.status));
      setStatuses(map);
    } else if (students.length > 0) {
      // Default all to present
      const map: Record<string, AttendanceStatus> = {};
      students.forEach((s) => (map[s.studentId] = 'present'));
      setStatuses(map);
    }
  }, [existing, students]);

  const toggle = (studentId: string) => {
    setStatuses((prev) => {
      const current = prev[studentId] || 'present';
      const next: AttendanceStatus = current === 'present' ? 'absent' : current === 'absent' ? 'holiday' : 'present';
      return { ...prev, [studentId]: next };
    });
  };

  const markAll = (status: AttendanceStatus) => {
    const map: Record<string, AttendanceStatus> = {};
    students.forEach((s) => (map[s.studentId] = status));
    setStatuses(map);
  };

  const handleSave = async () => {
    if (!teacher || !batchId) return;
    setSaving(true);
    try {
      const records = students.map((s) => ({
        studentId: s.studentId,
        batchId: batchId!,
        date: today,
        status: statuses[s.studentId] || 'present',
        markedBy: teacher.teacherId,
      }));
      await markBatchAttendance(records);
      Alert.alert('Saved', 'Attendance marked successfully', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err) {
      Alert.alert('Error', 'Could not save attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(statuses).filter((s) => s === 'present').length;
  const absentCount = Object.values(statuses).filter((s) => s === 'absent').length;

  return (
    <View style={styles.container}>
      {/* Date Picker */}
      <TouchableOpacity style={styles.dateBtnRow} onPress={() => setShowDatePicker(true)}>
        <Ionicons name="calendar-outline" size={20} color={colors.primary} />
        <Text style={styles.dateBtnText}>{dateDisplay}</Text>
        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
      </TouchableOpacity>
      <DatePickerModal
        visible={showDatePicker}
        date={dateObj}
        title="Select Attendance Date"
        onConfirm={(d) => { setDateObj(d); setShowDatePicker(false); }}
        onCancel={() => setShowDatePicker(false)}
      />

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryCount, { color: colors.success }]}>{presentCount}</Text>
          <Text style={styles.summaryLabel}>Present</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryCount, { color: colors.danger }]}>{absentCount}</Text>
          <Text style={styles.summaryLabel}>Absent</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryCount, { color: colors.textPrimary }]}>{students.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
      </View>

      {/* Quick All */}
      <View style={styles.quickRow}>
        <TouchableOpacity style={styles.quickBtn} onPress={() => markAll('present')}>
          <Text style={[styles.quickBtnText, { color: colors.success }]}>All Present</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => markAll('absent')}>
          <Text style={[styles.quickBtnText, { color: colors.danger }]}>All Absent</Text>
        </TouchableOpacity>
      </View>

      {/* Student List */}
      <FlatList
        data={students}
        keyExtractor={(s) => s.studentId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const st = statuses[item.studentId] || 'present';
          return (
            <TouchableOpacity style={styles.row} onPress={() => toggle(item.studentId)}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.studentName}>{item.name}</Text>
                {item.rollNumber && <Text style={styles.roll}>Roll #{item.rollNumber}</Text>}
              </View>
              <View
                style={[
                  styles.statusBadge,
                  st === 'present' && styles.presentBadge,
                  st === 'absent' && styles.absentBadge,
                  st === 'holiday' && styles.holidayBadge,
                ]}
              >
                <Ionicons
                  name={st === 'present' ? 'checkmark' : st === 'absent' ? 'close' : 'sunny'}
                  size={18}
                  color={colors.white}
                />
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Save Button */}
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveBtnText}>Save Attendance</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  dateBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateBtnText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.lg,
    backgroundColor: colors.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    elevation: 1,
  },
  summaryItem: { alignItems: 'center' },
  summaryCount: { fontSize: fontSize.xxl, fontWeight: '800' },
  summaryLabel: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 2 },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginVertical: spacing.md,
  },
  quickBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
  },
  quickBtnText: { fontWeight: '700', fontSize: fontSize.sm },
  list: { padding: spacing.lg, paddingBottom: 100 },
  row: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: { fontWeight: '700', color: colors.primary, fontSize: fontSize.sm },
  studentName: { fontSize: fontSize.md, fontWeight: '600', color: colors.textPrimary },
  roll: { fontSize: fontSize.xs, color: colors.textSecondary },
  statusBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presentBadge: { backgroundColor: colors.success },
  absentBadge: { backgroundColor: colors.danger },
  holidayBadge: { backgroundColor: colors.warning },
  saveBtn: {
    position: 'absolute',
    bottom: 24,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    elevation: 4,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  saveBtnText: { color: colors.white, fontWeight: '800', fontSize: fontSize.md },
});
