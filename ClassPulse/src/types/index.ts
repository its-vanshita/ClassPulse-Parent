/* ─── Shared types aligned with the TRD Firestore schema ─── */

// ────────── Teacher ──────────
export interface Teacher {
  teacherId: string;
  name: string;
  phone: string;
  email?: string;
  institute?: string;
  batchIds: string[];
  createdAt: string;
}

// ────────── Batch ──────────
export interface Batch {
  batchId: string;
  teacherId: string;
  name: string;
  grade?: string;
  section?: string;
  subject?: string;
  studentIds: string[];
  createdAt: string;
}

// ────────── Student ──────────
export interface Student {
  studentId: string;
  name: string;
  parentEmail: string;
  batchId: string;
  grade?: string;
  section?: string;
  rollNumber?: string;
  institute?: string;
  createdAt: string;
}

// ────────── Attendance ──────────
export type AttendanceStatus = 'present' | 'absent' | 'holiday';

export interface AttendanceRecord {
  id?: string; // Firestore doc id
  studentId: string;
  batchId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  markedBy: string; // teacherId
  createdAt: string;
}

// ────────── Homework ──────────
export interface Homework {
  homeworkId: string;
  batchId: string;
  subject: string;
  title: string;
  description: string;
  dueDate?: string;
  attachments?: string[];
  createdAt: string;
  createdBy: string; // teacherId
}

// ────────── Performance / Test Results ──────────
export interface TestResult {
  id?: string;
  studentId: string;
  batchId: string;
  subject: string;
  testName: string;
  marksObtained: number;
  totalMarks: number;
  date: string;
  createdBy: string;
  createdAt: string;
}

export interface SubjectPerformance {
  subject: string;
  average: number;
  tests: TestResult[];
}

// ────────── Notices ──────────
export type NoticeType = 'general' | 'urgent' | 'event' | 'holiday' | 'exam' | 'alert';

export interface Notice {
  noticeId: string;
  title: string;
  description: string;
  type: NoticeType;
  targetBatchIds: string[];
  createdBy: string; // teacherId
  createdAt: string;
}

// ────────── Dashboard helpers ──────────
export interface DashboardSummary {
  totalStudents: number;
  totalBatches: number;
  todayAttendancePercent: number;
  pendingHomework: number;
  recentNotices: Notice[];
}

// ────────── Fee Management ──────────
export type FeeStatus = 'paid' | 'pending' | 'overdue' | 'partial';

export interface FeeRecord {
  feeId: string;
  studentId: string;
  batchId: string;
  title: string;
  amount: number;
  paidAmount: number;
  dueDate: string; // YYYY-MM-DD
  status: FeeStatus;
  paidDate?: string;
  remarks?: string;
  createdBy: string; // teacherId
  createdAt: string;
}
