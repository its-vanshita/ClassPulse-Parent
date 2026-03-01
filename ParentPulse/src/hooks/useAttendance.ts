// ══════════════════════════════════════════════════════════════
// useAttendance – real-time attendance for the selected student
// ══════════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { useStudent } from '../context/StudentContext';
import { subscribeToAttendance } from '../services/firestoreService';
import { mockAttendance, mockMonthlyAttendance } from '../data/mockData';
import type { AttendanceRecord, AttendanceSummary } from '../types';

function buildMonthlySummaries(records: AttendanceRecord[]) {
  const byMonth: Record<string, AttendanceRecord[]> = {};
  for (const r of records) {
    const d = new Date(r.date);
    const key = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (!byMonth[key]) byMonth[key] = [];
    byMonth[key].push(r);
  }

  const summaries: Record<string, AttendanceSummary> = {};
  for (const [month, recs] of Object.entries(byMonth)) {
    const present = recs.filter((r) => r.status === 'present').length;
    const absent = recs.filter((r) => r.status === 'absent').length;
    const working = recs.filter((r) => r.status !== 'holiday').length;
    summaries[month] = {
      totalDays: working,
      presentDays: present,
      absentDays: absent,
      percentage: working > 0 ? Math.round((present / working) * 100) : 0,
      records: recs,
    };
  }
  return summaries;
}

function buildOverall(records: AttendanceRecord[]): AttendanceSummary {
  const present = records.filter((r) => r.status === 'present').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const working = records.filter((r) => r.status !== 'holiday').length;
  return {
    totalDays: working,
    presentDays: present,
    absentDays: absent,
    percentage: working > 0 ? Math.round((present / working) * 100) : 0,
    records,
  };
}

export function useAttendance() {
  const { selectedStudent, isDemo } = useStudent();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemo || !selectedStudent) {
      setRecords([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToAttendance(selectedStudent.studentId, (recs) => {
      setRecords(recs);
      setLoading(false);
    });
    return unsub;
  }, [selectedStudent, isDemo]);

  if (isDemo) {
    return {
      overall: mockAttendance,
      monthly: mockMonthlyAttendance,
      months: Object.keys(mockMonthlyAttendance),
      loading: false,
    };
  }

  const monthly = buildMonthlySummaries(records);
  return {
    overall: buildOverall(records),
    monthly,
    months: Object.keys(monthly),
    loading,
  };
}
