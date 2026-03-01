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
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useTeacher } from '../src/context/TeacherContext';
import { postNotice, subscribeToBatches } from '../src/services/firestoreService';
import { colors } from '../src/theme/colors';
import { spacing, borderRadius, fontSize } from '../src/theme/spacing';
import type { Batch, NoticeType } from '../src/types';

const NOTICE_TYPES: { label: string; value: NoticeType }[] = [
  { label: 'General', value: 'general' },
  { label: 'Urgent', value: 'urgent' },
  { label: 'Event', value: 'event' },
  { label: 'Holiday', value: 'holiday' },
];

export default function PostNoticeScreen() {
  const router = useRouter();
  const { teacher } = useTeacher();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [noticeType, setNoticeType] = useState<NoticeType>('general');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!teacher) return;
    const unsub = subscribeToBatches(teacher.teacherId, (b) => {
      setBatches(b);
      if (b.length > 0 && selectedBatchIds.length === 0) {
        setSelectedBatchIds(b.map((batch) => batch.batchId)); // default: all batches
      }
    });
    return unsub;
  }, [teacher]);

  const toggleBatch = (batchId: string) => {
    setSelectedBatchIds((prev) =>
      prev.includes(batchId) ? prev.filter((id) => id !== batchId) : [...prev, batchId]
    );
  };

  const handlePost = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Title is required');
      return;
    }
    if (selectedBatchIds.length === 0) {
      Alert.alert('Required', 'Select at least one batch');
      return;
    }
    if (!teacher) return;

    setBusy(true);
    try {
      await postNotice({
        title: title.trim(),
        description: description.trim(),
        type: noticeType,
        targetBatchIds: selectedBatchIds,
        createdBy: teacher.teacherId,
      });
      router.back();
    } catch (err) {
      Alert.alert('Error', 'Could not post notice');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Notice Type</Text>
      <View style={styles.pickerWrap}>
        <Picker
          selectedValue={noticeType}
          onValueChange={(v) => setNoticeType(v)}
          style={{ color: colors.textPrimary }}
        >
          {NOTICE_TYPES.map((t) => (
            <Picker.Item key={t.value} label={t.label} value={t.value} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        placeholder="Notice title"
        value={title}
        onChangeText={setTitle}
        placeholderTextColor={colors.textLight}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        placeholder="Notice details..."
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        placeholderTextColor={colors.textLight}
      />

      <Text style={styles.label}>Target Batches</Text>
      <View style={styles.batchGrid}>
        {batches.map((b) => {
          const selected = selectedBatchIds.includes(b.batchId);
          return (
            <TouchableOpacity
              key={b.batchId}
              style={[styles.batchChip, selected && styles.batchChipSelected]}
              onPress={() => toggleBatch(b.batchId)}
            >
              <Text style={[styles.batchChipText, selected && styles.batchChipTextSelected]}>
                {b.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.btn} onPress={handlePost} disabled={busy}>
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnText}>Post Notice</Text>
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
  pickerWrap: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  batchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  batchChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  batchChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  batchChipText: { fontSize: fontSize.sm, color: colors.textSecondary },
  batchChipTextSelected: { color: colors.white, fontWeight: '700' },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  btnText: { color: colors.white, fontSize: fontSize.md, fontWeight: '700' },
});
