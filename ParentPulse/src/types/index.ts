// ══════════════════════════════════════════════════════════════
// Shared data models – aligned with ClassPulse ecosystem TRD
// ══════════════════════════════════════════════════════════════

// ── Core entities (mirrors Firestore collections) ────────────

export interface Teacher {
  teacherId: string;
  name: string;
  phone: string;
  institute: string;
}

export interface Batch {
  batchId: string;
  name: string;
  subject: string;
  teacherId: string;
  schedule?: string;
}

export interface Student {
  studentId: string;
  name: string;
  parentEmail: string;
  batchId: string;
  grade?: string;
  section?: string;
  rollNumber?: string;
  institute?: string;
}

// ── Attendance ───────────────────────────────────────────────

export interface AttendanceRecord {
  id?: string;
  studentId: string;
  batchId: string;
  date: string; // ISO date string  e.g. "2026-02-25"
  status: 'present' | 'absent' | 'holiday';
}

export interface AttendanceSummary {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  percentage: number;
  records: AttendanceRecord[];
}

// ── Homework ─────────────────────────────────────────────────

export interface Homework {
  homeworkId: string;
  batchId: string;
  subject: string;
  title: string;
  description: string;
  dueDate?: string;
  createdAt: string; // ISO date string
}

// ── Performance (Phase 2) ────────────────────────────────────

export interface TestResult {
  id: string;
  studentId: string;
  subject: string;
  testName: string;
  marks: number;
  total: number;
  percentage: number;
  date: string;
  remarks?: string;
}

export interface SubjectPerformance {
  subject: string;
  averagePercentage: number;
  tests: TestResult[];
  teacherRemarks?: string;
}

// ── Notices / Announcements ──────────────────────────────────

export type NoticeType = 'general' | 'urgent' | 'event' | 'holiday' | 'exam' | 'alert';

export interface Notice {
  noticeId: string;
  title: string;
  description: string;
  targetBatchIds: string[];
  date: string; // ISO date string
  type: NoticeType;
}

// ── Parent-facing convenience types ──────────────────────────

export interface Parent {
  id: string;
  name: string;
  phone: string;
  children: Student[];
}

export interface DashboardSummary {
  child: Student;
  attendancePercentage: number;
  overallPerformance: number;
  latestHomework: Homework[];
  recentTests: TestResult[];
  latestNotices: Notice[];
}

// ── Fee Management ───────────────────────────────────────────

export type FeeStatus = 'paid' | 'pending' | 'overdue' | 'partial';

export interface FeeRecord {
  feeId: string;
  studentId: string;
  batchId: string;
  title: string;
  amount: number;
  paidAmount: number;
  dueDate: string;
  status: FeeStatus;
  paidDate?: string;
  remarks?: string;
  createdAt: string;
}
