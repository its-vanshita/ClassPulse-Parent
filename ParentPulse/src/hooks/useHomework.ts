// ══════════════════════════════════════════════════════════════
// useHomework – real-time homework for the student's batches
// ══════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { useStudent } from '../context/StudentContext';
import { subscribeToHomework } from '../services/firestoreService';
import { mockHomework } from '../data/mockData';
import type { Homework } from '../types';

export function useHomework() {
  const { selectedStudent, isDemo } = useStudent();
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemo || !selectedStudent) {
      setHomework([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const batchIds = [selectedStudent.batchId];
    const unsub = subscribeToHomework(batchIds, (hw) => {
      setHomework(hw);
      setLoading(false);
    });
    return unsub;
  }, [selectedStudent, isDemo]);

  if (isDemo) {
    return { homework: mockHomework as unknown as Homework[], loading: false };
  }

  return { homework, loading };
}
