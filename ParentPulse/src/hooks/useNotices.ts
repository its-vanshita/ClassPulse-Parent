// ══════════════════════════════════════════════════════════════
// useNotices – real-time notices for the student's batches
// ══════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { useStudent } from '../context/StudentContext';
import { subscribeToNotices } from '../services/firestoreService';
import { mockNotices } from '../data/mockData';
import type { Notice } from '../types';

export function useNotices() {
  const { selectedStudent, isDemo } = useStudent();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemo || !selectedStudent) {
      setNotices([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const batchIds = [selectedStudent.batchId];
    const unsub = subscribeToNotices(batchIds, (n) => {
      setNotices(n);
      setLoading(false);
    });
    return unsub;
  }, [selectedStudent, isDemo]);

  if (isDemo) {
    return { notices: mockNotices as unknown as Notice[], loading: false };
  }

  return { notices, loading };
}
