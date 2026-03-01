// ══════════════════════════════════════════════════════════════
// Supabase data services – read-only for ParentPulse
//
// File kept as firestoreService.ts so existing imports stay unchanged.
// ══════════════════════════════════════════════════════════════
import { supabase } from '../config/supabase';
import type {
  Student,
  AttendanceRecord,
  Homework,
  TestResult,
  Notice,
  Batch,
  FeeRecord,
} from '../types';

// ─── Helpers ─────────────────────────────────────────────────
type Unsub = () => void;
let channelCounter = 0;
const nextChannel = (prefix: string) => `${prefix}-${++channelCounter}-${Date.now()}`;

// ─── Row ↔ App mappers ──────────────────────────────────────

function rowToStudent(r: any): Student {
  return {
    studentId: r.id,
    name: r.name,
    parentEmail: r.parent_email ?? '',
    batchId: r.batch_id,
    grade: r.grade ?? '',
    section: r.section ?? '',
    rollNumber: r.roll_number ?? '',
    institute: r.institute ?? '',
  };
}

function rowToBatch(r: any): Batch {
  return {
    batchId: r.id,
    name: r.name,
    subject: r.subject ?? '',
    teacherId: r.teacher_id,
    schedule: '',
  };
}

function rowToAttendance(r: any): AttendanceRecord {
  return {
    id: r.id,
    studentId: r.student_id,
    batchId: r.batch_id,
    date: r.date,
    status: r.status,
  };
}

function rowToHomework(r: any): Homework {
  return {
    homeworkId: r.id,
    batchId: r.batch_id,
    subject: r.subject ?? '',
    title: r.title,
    description: r.description ?? '',
    dueDate: r.due_date ?? '',
    createdAt: r.created_at ?? '',
  };
}

function rowToTestResult(r: any): TestResult {
  const marks = Number(r.marks_obtained);
  const total = Number(r.total_marks);
  return {
    id: r.id,
    studentId: r.student_id,
    subject: r.subject,
    testName: r.test_name,
    marks,
    total,
    percentage: total > 0 ? Math.round((marks / total) * 100) : 0,
    date: r.date,
  };
}

function rowToNotice(r: any): Notice {
  return {
    noticeId: r.id,
    title: r.title,
    description: r.description ?? '',
    targetBatchIds: r.target_batch_ids ?? [],
    date: r.created_at ?? '',
    type: r.type ?? 'general',
  };
}

// ── Students ─────────────────────────────────────────────────

/** Get students linked to a parent email address (real-time). */
export function subscribeToStudents(
  parentEmail: string,
  callback: (students: Student[]) => void
): Unsub {
  const fetch = () =>
    supabase
      .from('students')
      .select('*')
      .eq('parent_email', parentEmail)
      .then(({ data }) => {
        callback((data ?? []).map(rowToStudent));
      });

  fetch();

  const channel = supabase
    .channel(nextChannel('students'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => fetch())
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

// ── Batch info ───────────────────────────────────────────────

export async function getBatch(batchId: string): Promise<Batch | null> {
  const { data } = await supabase.from('batches').select('*').eq('id', batchId).single();
  return data ? rowToBatch(data) : null;
}

// ── Attendance ───────────────────────────────────────────────

/** Real-time attendance for a given student. */
export function subscribeToAttendance(
  studentId: string,
  callback: (records: AttendanceRecord[]) => void
): Unsub {
  const fetch = () =>
    supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false })
      .then(({ data }) => {
        callback((data ?? []).map(rowToAttendance));
      });

  fetch();

  const channel = supabase
    .channel(nextChannel('attendance'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance', filter: `student_id=eq.${studentId}` }, () => fetch())
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

// ── Homework ─────────────────────────────────────────────────

/** Real-time homework for batches the student belongs to. */
export function subscribeToHomework(
  batchIds: string[],
  callback: (homework: Homework[]) => void
): Unsub {
  if (batchIds.length === 0) {
    callback([]);
    return () => {};
  }

  const fetch = () =>
    supabase
      .from('homework')
      .select('*')
      .in('batch_id', batchIds)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        callback((data ?? []).map(rowToHomework));
      });

  fetch();

  const channel = supabase
    .channel(nextChannel('homework'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'homework' }, () => fetch())
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

// ── Performance / Test Results ───────────────────────────────

export function subscribeToTestResults(
  studentId: string,
  callback: (results: TestResult[]) => void
): Unsub {
  const fetch = () =>
    supabase
      .from('test_results')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false })
      .then(({ data }) => {
        callback((data ?? []).map(rowToTestResult));
      });

  fetch();

  const channel = supabase
    .channel(nextChannel('test-results'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'test_results', filter: `student_id=eq.${studentId}` }, () => fetch())
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

// ── Notices ──────────────────────────────────────────────────

/** Real-time notices targeting the student's batches. */
export function subscribeToNotices(
  batchIds: string[],
  callback: (notices: Notice[]) => void
): Unsub {
  if (batchIds.length === 0) {
    callback([]);
    return () => {};
  }

  const fetch = () =>
    supabase
      .from('notices')
      .select('*')
      .overlaps('target_batch_ids', batchIds)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        callback((data ?? []).map(rowToNotice));
      });

  fetch();

  const channel = supabase
    .channel(nextChannel('notices'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, () => fetch())
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

// ── Fees ─────────────────────────────────────────────────────────

function rowToFee(r: any): FeeRecord {
  return {
    feeId: r.id,
    studentId: r.student_id,
    batchId: r.batch_id,
    title: r.title ?? 'Tuition Fee',
    amount: Number(r.amount),
    paidAmount: Number(r.paid_amount),
    dueDate: r.due_date ?? '',
    status: r.status ?? 'pending',
    paidDate: r.paid_date ?? undefined,
    remarks: r.remarks ?? '',
    createdAt: r.created_at ?? '',
  };
}

/** Real-time fees for a given student. */
export function subscribeToFees(
  studentId: string,
  callback: (fees: FeeRecord[]) => void
): Unsub {
  const fetch = () =>
    supabase
      .from('fees')
      .select('*')
      .eq('student_id', studentId)
      .order('due_date', { ascending: false })
      .then(({ data }) => {
        callback((data ?? []).map(rowToFee));
      });

  fetch();

  const channel = supabase
    .channel(nextChannel('fees'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'fees', filter: `student_id=eq.${studentId}` }, () => fetch())
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
