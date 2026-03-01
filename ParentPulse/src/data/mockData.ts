import {
  Parent,
  Student,
  AttendanceSummary,
  AttendanceRecord,
  Homework,
  TestResult,
  SubjectPerformance,
  Notice,
  DashboardSummary,
  FeeRecord,
} from '../types';

// Student is the unified type (formerly Child)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _Child = Student;

// ── Helpers ──────────────────────────────────────────────────

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function generateAttendanceRecords(year: number, month: number): AttendanceRecord[] {
  const total = daysInMonth(year, month);
  const records: AttendanceRecord[] = [];
  const absentDays = new Set([3, 8, 15]); // a few absent days
  const holidays = new Set([26]); // e.g. Republic Day

  for (let d = 1; d <= total; d++) {
    const date = new Date(year, month, d);
    const day = date.getDay();
    if (day === 0) continue; // skip Sundays
    const iso = date.toISOString().split('T')[0];
    if (holidays.has(d)) {
      records.push({ date: iso, status: 'holiday', studentId: 'c1', batchId: 'batch-demo' });
    } else if (absentDays.has(d)) {
      records.push({ date: iso, status: 'absent', studentId: 'c1', batchId: 'batch-demo' });
    } else {
      records.push({ date: iso, status: 'present', studentId: 'c1', batchId: 'batch-demo' });
    }
  }
  return records;
}

// ── Static Data ──────────────────────────────────────────────

export const mockChild: Student = {
  studentId: 'c1',
  name: 'Aarav Sharma',
  grade: '10',
  institute: 'Pinnacle Coaching Institute',
  rollNumber: '1024',
  section: 'A',
  parentEmail: 'demo@parent.com',
  batchId: 'batch-demo',
};

export const mockParent: Parent = {
  id: 'p1',
  name: 'Rajesh Sharma',
  phone: '+91 98765 43210',
  children: [mockChild],
};

// ── Attendance ───────────────────────────────────────────────

const febRecords = generateAttendanceRecords(2026, 1); // Feb 2026
const janRecords = generateAttendanceRecords(2026, 0); // Jan 2026

const allRecords = [...janRecords, ...febRecords];
const presentCount = allRecords.filter((r) => r.status === 'present').length;
const absentCount = allRecords.filter((r) => r.status === 'absent').length;
const totalWorking = allRecords.filter((r) => r.status !== 'holiday').length;

export const mockAttendance: AttendanceSummary = {
  totalDays: totalWorking,
  presentDays: presentCount,
  absentDays: absentCount,
  percentage: Math.round((presentCount / totalWorking) * 100),
  records: allRecords,
};

export const mockMonthlyAttendance: Record<string, AttendanceSummary> = {
  'Jan 2026': (() => {
    const present = janRecords.filter((r) => r.status === 'present').length;
    const absent = janRecords.filter((r) => r.status === 'absent').length;
    const working = janRecords.filter((r) => r.status !== 'holiday').length;
    return {
      totalDays: working,
      presentDays: present,
      absentDays: absent,
      percentage: Math.round((present / working) * 100),
      records: janRecords,
    };
  })(),
  'Feb 2026': (() => {
    const present = febRecords.filter((r) => r.status === 'present').length;
    const absent = febRecords.filter((r) => r.status === 'absent').length;
    const working = febRecords.filter((r) => r.status !== 'holiday').length;
    return {
      totalDays: working,
      presentDays: present,
      absentDays: absent,
      percentage: Math.round((present / working) * 100),
      records: febRecords,
    };
  })(),
};

// ── Homework ─────────────────────────────────────────────────

export const mockHomework: Homework[] = [
  {
    homeworkId: 'hw1',
    batchId: 'batch-demo',
    subject: 'Mathematics',
    title: 'Quadratic Equations',
    description: 'Complete exercises 5.1 to 5.3 from R.D. Sharma.',
    createdAt: '2026-02-26',
    dueDate: '2026-02-28',
  },
  {
    homeworkId: 'hw2',
    batchId: 'batch-demo',
    subject: 'Physics',
    title: 'Newton\'s Laws Worksheet',
    description: 'Solve all numericals from Chapter 4. Show working for every problem.',
    createdAt: '2026-02-25',
    dueDate: '2026-02-27',
  },
  {
    homeworkId: 'hw3',
    batchId: 'batch-demo',
    subject: 'Chemistry',
    title: 'Periodic Table Elements',
    description: 'Write electronic configuration for first 30 elements.',
    createdAt: '2026-02-24',
    dueDate: '2026-02-26',
  },
  {
    homeworkId: 'hw4',
    batchId: 'batch-demo',
    subject: 'English',
    title: 'Essay Writing',
    description: 'Write a 500 word essay on "The Role of Technology in Education".',
    createdAt: '2026-02-23',
    dueDate: '2026-02-25',
  },
  {
    homeworkId: 'hw5',
    batchId: 'batch-demo',
    subject: 'Biology',
    title: 'Cell Division Diagrams',
    description: 'Draw labelled diagrams of Mitosis and Meiosis.',
    createdAt: '2026-02-22',
    dueDate: '2026-02-24',
  },
];

// ── Test Results & Performance ───────────────────────────────

export const mockTestResults: TestResult[] = [
  { id: 't1', studentId: 'c1', subject: 'Mathematics', testName: 'Unit Test 3', marks: 42, total: 50, percentage: 84, date: '2026-02-20', remarks: 'Good progress. Needs practice in integration.' },
  { id: 't2', studentId: 'c1', subject: 'Physics', testName: 'Unit Test 3', marks: 38, total: 50, percentage: 76, date: '2026-02-20', remarks: 'Fair. Revise numerical problems.' },
  { id: 't3', studentId: 'c1', subject: 'Chemistry', testName: 'Unit Test 3', marks: 45, total: 50, percentage: 90, date: '2026-02-20', remarks: 'Excellent understanding.' },
  { id: 't4', studentId: 'c1', subject: 'English', testName: 'Unit Test 3', marks: 40, total: 50, percentage: 80, date: '2026-02-20' },
  { id: 't5', studentId: 'c1', subject: 'Biology', testName: 'Unit Test 3', marks: 44, total: 50, percentage: 88, date: '2026-02-20', remarks: 'Very good.' },
  { id: 't6', studentId: 'c1', subject: 'Mathematics', testName: 'Mid-Term', marks: 78, total: 100, percentage: 78, date: '2026-01-15' },
  { id: 't7', studentId: 'c1', subject: 'Physics', testName: 'Mid-Term', marks: 72, total: 100, percentage: 72, date: '2026-01-15' },
  { id: 't8', studentId: 'c1', subject: 'Chemistry', testName: 'Mid-Term', marks: 85, total: 100, percentage: 85, date: '2026-01-15' },
];

export const mockSubjectPerformance: SubjectPerformance[] = [
  {
    subject: 'Mathematics',
    averagePercentage: 81,
    tests: mockTestResults.filter((t) => t.subject === 'Mathematics'),
    teacherRemarks: 'Consistent performer. Should focus on calculus.',
  },
  {
    subject: 'Physics',
    averagePercentage: 74,
    tests: mockTestResults.filter((t) => t.subject === 'Physics'),
    teacherRemarks: 'Needs more practice with numericals.',
  },
  {
    subject: 'Chemistry',
    averagePercentage: 88,
    tests: mockTestResults.filter((t) => t.subject === 'Chemistry'),
    teacherRemarks: 'Outstanding performance.',
  },
  {
    subject: 'English',
    averagePercentage: 80,
    tests: mockTestResults.filter((t) => t.subject === 'English'),
  },
  {
    subject: 'Biology',
    averagePercentage: 88,
    tests: mockTestResults.filter((t) => t.subject === 'Biology'),
    teacherRemarks: 'Very good grasp of concepts.',
  },
];

// ── Notices ──────────────────────────────────────────────────

export const mockNotices: Notice[] = [
  {
    noticeId: 'n1',
    title: 'Holiday: Holi Festival',
    description: 'Classes will remain closed on March 14th on account of Holi. Classes resume on March 16th.',
    date: '2026-02-27',
    type: 'holiday',
    targetBatchIds: ['batch-demo'],
  },
  {
    noticeId: 'n2',
    title: 'Monthly Test Schedule',
    description: 'Monthly tests for all subjects will be held from March 5th to March 10th. Detailed timetable will be shared soon.',
    date: '2026-02-26',
    type: 'exam',
    targetBatchIds: ['batch-demo'],
  },
  {
    noticeId: 'n3',
    title: 'Parent-Teacher Meeting',
    description: 'PTM scheduled for March 20th, 10:00 AM to 1:00 PM. Attendance of at least one parent is mandatory.',
    date: '2026-02-25',
    type: 'general',
    targetBatchIds: ['batch-demo'],
  },
  {
    noticeId: 'n4',
    title: 'Fee Payment Reminder',
    description: 'Please clear all pending fee dues before March 5th to avoid late payment charges.',
    date: '2026-02-24',
    type: 'alert',
    targetBatchIds: ['batch-demo'],
  },
  {
    noticeId: 'n5',
    title: 'Science Exhibition',
    description: 'Annual Science Exhibition on March 25th. Students interested in participating should register by March 10th.',
    date: '2026-02-22',
    type: 'general',
    targetBatchIds: ['batch-demo'],
  },
];

// ── Fee Records ──────────────────────────────────────────────

export const mockFees: FeeRecord[] = [
  {
    feeId: 'fee1',
    studentId: 'c1',
    batchId: 'batch-demo',
    title: 'Monthly Tuition – March',
    amount: 3000,
    paidAmount: 3000,
    dueDate: '2026-03-05',
    status: 'paid',
    paidDate: '2026-03-02',
    remarks: 'Paid via UPI',
    createdAt: '2026-02-20',
  },
  {
    feeId: 'fee2',
    studentId: 'c1',
    batchId: 'batch-demo',
    title: 'Monthly Tuition – April',
    amount: 3000,
    paidAmount: 1500,
    dueDate: '2026-04-05',
    status: 'partial',
    remarks: 'Half payment received',
    createdAt: '2026-03-20',
  },
  {
    feeId: 'fee3',
    studentId: 'c1',
    batchId: 'batch-demo',
    title: 'Lab Fee – Semester 2',
    amount: 1500,
    paidAmount: 0,
    dueDate: '2026-03-15',
    status: 'overdue',
    createdAt: '2026-02-15',
  },
  {
    feeId: 'fee4',
    studentId: 'c1',
    batchId: 'batch-demo',
    title: 'Monthly Tuition – May',
    amount: 3000,
    paidAmount: 0,
    dueDate: '2026-05-05',
    status: 'pending',
    createdAt: '2026-04-20',
  },
];

// ── Dashboard Summary ────────────────────────────────────────

export const mockDashboard: DashboardSummary = {
  child: mockChild,
  attendancePercentage: mockAttendance.percentage,
  overallPerformance: Math.round(
    mockSubjectPerformance.reduce((s, p) => s + p.averagePercentage, 0) /
      mockSubjectPerformance.length
  ),
  latestHomework: mockHomework.slice(0, 2),
  recentTests: mockTestResults.slice(0, 3),
  latestNotices: mockNotices.slice(0, 2),
};
