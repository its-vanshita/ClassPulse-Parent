import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors } from '../theme/colors';
import { spacing, borderRadius, fontSize } from '../theme/spacing';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function daysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}

interface DatePickerModalProps {
  visible: boolean;
  date: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  minimumDate?: Date;
  title?: string;
}

export default function DatePickerModal({
  visible,
  date,
  onConfirm,
  onCancel,
  minimumDate,
  title = 'Select Date',
}: DatePickerModalProps) {
  const [year, setYear] = useState(date.getFullYear());
  const [month, setMonth] = useState(date.getMonth());
  const [day, setDay] = useState(date.getDate());

  // Sync internal state when the external date prop changes
  useEffect(() => {
    setYear(date.getFullYear());
    setMonth(date.getMonth());
    setDay(date.getDate());
  }, [date]);

  const currentYear = new Date().getFullYear();
  const years = useMemo(() => {
    const minYear = minimumDate ? minimumDate.getFullYear() : currentYear - 5;
    const maxYear = currentYear + 5;
    const arr: number[] = [];
    for (let y = minYear; y <= maxYear; y++) arr.push(y);
    return arr;
  }, [currentYear, minimumDate]);

  const maxDay = daysInMonth(month, year);
  const days = useMemo(() => {
    const arr: number[] = [];
    for (let d = 1; d <= maxDay; d++) arr.push(d);
    return arr;
  }, [maxDay]);

  // Clamp day if month/year changes
  useEffect(() => {
    if (day > maxDay) setDay(maxDay);
  }, [maxDay, day]);

  const handleConfirm = () => {
    const selected = new Date(year, month, day);
    if (minimumDate && selected < minimumDate) {
      // Snap to minimum date
      onConfirm(minimumDate);
    } else {
      onConfirm(selected);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.pickerRow}>
            {/* Day */}
            <View style={styles.pickerCol}>
              <Text style={styles.pickerLabel}>Day</Text>
              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={day}
                  onValueChange={(v) => setDay(v)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  {days.map((d) => (
                    <Picker.Item key={d} label={String(d)} value={d} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Month */}
            <View style={[styles.pickerCol, { flex: 1.4 }]}>
              <Text style={styles.pickerLabel}>Month</Text>
              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={month}
                  onValueChange={(v) => setMonth(v)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  {MONTHS.map((m, i) => (
                    <Picker.Item key={i} label={m} value={i} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Year */}
            <View style={styles.pickerCol}>
              <Text style={styles.pickerLabel}>Year</Text>
              <View style={styles.pickerWrap}>
                <Picker
                  selectedValue={year}
                  onValueChange={(v) => setYear(v)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  {years.map((y) => (
                    <Picker.Item key={y} label={String(y)} value={y} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* Preview */}
          <Text style={styles.preview}>
            {day} {MONTHS[month]} {year}
          </Text>

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmBtnText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '90%',
    maxWidth: 380,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pickerCol: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  pickerWrap: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  picker: {
    color: colors.textPrimary,
  },
  pickerItem: {
    fontSize: fontSize.md,
  },
  preview: {
    textAlign: 'center',
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  btnRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.white,
  },
});
