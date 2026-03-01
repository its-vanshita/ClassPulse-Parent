// ══════════════════════════════════════════════════════════════
// useFees – real-time fee records for the selected student
// ══════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { useStudent } from '../context/StudentContext';
import { subscribeToFees } from '../services/firestoreService';
import { mockFees } from '../data/mockData';
import type { FeeRecord } from '../types';

export interface FeeSummary {
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
  overdueCount: number;
  paidCount: number;
  records: FeeRecord[];
}

function buildSummary(records: FeeRecord[]): FeeSummary {
  const totalAmount = records.reduce((s, f) => s + f.amount, 0);
  const totalPaid = records.reduce((s, f) => s + f.paidAmount, 0);
  return {
    totalAmount,
    totalPaid,
    totalPending: totalAmount - totalPaid,
    overdueCount: records.filter((f) => f.status === 'overdue').length,
    paidCount: records.filter((f) => f.status === 'paid').length,
    records,
  };
}

export function useFees() {
  const { selectedStudent, isDemo } = useStudent();
  const [records, setRecords] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemo || !selectedStudent) {
      setRecords([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToFees(selectedStudent.studentId, (fees) => {
      setRecords(fees);
      setLoading(false);
    });
    return unsub;
  }, [selectedStudent, isDemo]);

  if (isDemo) {
    return {
      summary: buildSummary(mockFees),
      records: mockFees,
      loading: false,
    };
  }

  return {
    summary: buildSummary(records),
    records,
    loading,
  };
}
