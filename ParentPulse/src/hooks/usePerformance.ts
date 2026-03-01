// ══════════════════════════════════════════════════════════════
// usePerformance – real-time test results & subject aggregation
// ══════════════════════════════════════════════════════════════
import { useEffect, useState, useMemo } from 'react';
import { useStudent } from '../context/StudentContext';
import { subscribeToTestResults } from '../services/firestoreService';
import { mockTestResults, mockSubjectPerformance } from '../data/mockData';
import type { TestResult, SubjectPerformance } from '../types';

function aggregateBySubject(results: TestResult[]): SubjectPerformance[] {
  const map = new Map<string, TestResult[]>();
  for (const r of results) {
    const list = map.get(r.subject) ?? [];
    list.push(r);
    map.set(r.subject, list);
  }
  const out: SubjectPerformance[] = [];
  for (const [subject, tests] of map.entries()) {
    const avg = Math.round(
      tests.reduce((s, t) => s + t.percentage, 0) / tests.length
    );
    out.push({ subject, averagePercentage: avg, tests });
  }
  return out.sort((a, b) => a.subject.localeCompare(b.subject));
}

export function usePerformance() {
  const { selectedStudent, isDemo } = useStudent();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemo || !selectedStudent) {
      setTestResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToTestResults(selectedStudent.studentId, (res) => {
      setTestResults(res);
      setLoading(false);
    });
    return unsub;
  }, [selectedStudent, isDemo]);

  const subjectPerformance = useMemo(
    () => (isDemo ? mockSubjectPerformance : aggregateBySubject(testResults)),
    [testResults, isDemo]
  );

  if (isDemo) {
    return {
      testResults: mockTestResults as unknown as TestResult[],
      subjectPerformance: mockSubjectPerformance as unknown as SubjectPerformance[],
      loading: false,
    };
  }

  return { testResults, subjectPerformance, loading };
}
