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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  subscribeToStudentsByBatch,
  updateFee,
} from '../src/services/firestoreService';
import { supabase } from '../src/config/supabase';
import { colors } from '../src/theme/colors';
import { spacing, borderRadius, fontSize } from '../src/theme/spacing';
import type { FeeRecord, Student, FeeStatus } from '../src/types';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmt = (n: number) => String(n);
const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export default function RecordPaymentScreen() {
  const router = useRouter();
  const { feeId, batchId } = useLocalSearchParams<{ feeId: string; batchId: string }>();

  const [fee, setFee] = useState<FeeRecord | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState('');
  const [remarks, setRemarks] = useState('');

  // Load fee record
  useEffect(() => {
    if (!feeId) return;
    supabase
      .from('fees')
      .select('*')
      .eq('id', feeId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          Alert.alert('Error', 'Fee record not found');
          router.back();
          return;
        }
        const f: FeeRecord = {
          feeId: data.id,
          studentId: data.student_id,
          batchId: data.batch_id,
          title: data.title ?? '',
          amount: Number(data.amount),
          paidAmount: Number(data.paid_amount),
          dueDate: data.due_date ?? '',
          status: data.status ?? 'pending',
          paidDate: data.paid_date ?? undefined,
          remarks: data.remarks ?? '',
          createdBy: data.created_by ?? '',
          createdAt: data.created_at ?? '',
        };
        setFee(f);
        setRemarks(f.remarks ?? '');
        setLoading(false);
      });
  }, [feeId]);

  // Load student name
  useEffect(() => {
    if (!batchId) return;
    const unsub = subscribeToStudentsByBatch(batchId, (list) => {
      if (fee) {
        const s = list.find((st) => st.studentId === fee.studentId);
        if (s) setStudent(s);
      }
    });
    return unsub;
  }, [batchId, fee]);

  const remaining = fee ? fee.amount - fee.paidAmount : 0;

  const handlePayFull = () => {
    setPaymentAmount(remaining.toString());
  };

  const handleRecord = async () => {
    if (!fee) return;
    const amt = parseFloat(paymentAmount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Invalid', 'Enter a valid payment amount');
      return;
    }
    if (amt > remaining) {
      Alert.alert('Exceeds', `Payment exceeds remaining balance (₹${remaining})`);
      return;
    }

    setBusy(true);
    const newPaid = fee.paidAmount + amt;
    const newStatus: FeeStatus = newPaid >= fee.amount ? 'paid' : 'partial';

    try {
      await updateFee(fee.feeId, {
        paidAmount: newPaid,
        status: newStatus,
        paidDate: newStatus === 'paid' ? new Date().toISOString().slice(0, 10) : fee.paidDate,
        remarks: remarks.trim(),
      });
      Alert.alert('Recorded', `₹${amt} payment recorded`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Error', 'Could not update fee record');
    } finally {
      setBusy(false);
    }
  };

  if (loading || !fee) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const dueStr = fee.dueDate ? fmtDate(fee.dueDate) : 'N/A';

  const statusColor =
    fee.status === 'paid'
      ? colors.success
      : fee.status === 'overdue'
      ? colors.danger
      : fee.status === 'partial'
      ? colors.info
      : colors.warning;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Fee Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.feeTitle}>{fee.title}</Text>
        <Text style={styles.studentLabel}>{student?.name ?? 'Loading...'}</Text>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Total</Text>
            <Text style={styles.infoValue}>₹{fmt(fee.amount)}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Paid</Text>
            <Text style={[styles.infoValue, { color: colors.success }]}>
              ₹{fmt(fee.paidAmount)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Remaining</Text>
            <Text style={[styles.infoValue, { color: remaining > 0 ? colors.danger : colors.success }]}>
              ₹{fmt(remaining)}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.infoValue, { color: statusColor, textTransform: 'capitalize' }]}>
              {fee.status}
            </Text>
          </View>
        </View>

        <Text style={styles.dueLabel}>Due: {dueStr}</Text>
      </View>

      {fee.status === 'paid' ? (
        <View style={styles.paidBanner}>
          <Ionicons name="checkmark-circle" size={32} color={colors.success} />
          <Text style={styles.paidText}>Fully Paid</Text>
          {fee.paidDate && (
            <Text style={styles.paidDate}>
              on{' '}
              {fmtDate(fee.paidDate)}
            </Text>
          )}
        </View>
      ) : (
        <>
          {/* Payment Form */}
          <Text style={styles.sectionTitle}>Record Payment</Text>

          <Text style={styles.label}>Payment Amount (₹) *</Text>
          <View style={styles.amountRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder={`Max ₹${remaining}`}
              value={paymentAmount}
              onChangeText={setPaymentAmount}
              keyboardType="numeric"
              placeholderTextColor={colors.textLight}
            />
            <TouchableOpacity style={styles.fullPayBtn} onPress={handlePayFull}>
              <Text style={styles.fullPayText}>Pay Full</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Remarks</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            placeholder="Payment notes (optional)"
            value={remarks}
            onChangeText={setRemarks}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            placeholderTextColor={colors.textLight}
          />

          <TouchableOpacity style={styles.btn} onPress={handleRecord} disabled={busy}>
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Record Payment</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: 60 },
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: spacing.xl,
  },
  feeTitle: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  studentLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  infoItem: {
    width: '47%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  infoLabel: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dueLabel: {
    fontSize: fontSize.xs,
    color: colors.textLight,
    marginTop: spacing.md,
    textAlign: 'right',
  },
  paidBanner: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  paidText: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.success,
    marginTop: spacing.sm,
  },
  paidDate: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
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
  multiline: { minHeight: 70 },
  amountRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  fullPayBtn: {
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    height: 50,
    justifyContent: 'center',
  },
  fullPayText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.success,
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
