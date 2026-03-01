/**
 * Supabase CRUD service for ClassPulse (Teacher App).
 * Writes to the SAME tables that ParentPulse reads from.
 *
 * File kept as firestoreService.ts so existing imports stay unchanged.
 */
import { supabase } from '../config/supabase';
import type {
  Teacher,
  Batch,
  Student,
  AttendanceRecord,
  Homework,
  TestResult,
  Notice,
  FeeRecord,
} from '../types';

// ─── Helper ───────────────────────────────────────────────────
const now = () => new Date().toISOString();
let channelCounter = 0;
const nextChannel = (prefix: string) => `${prefix}-${++channelCounter}-${Date.now()}`;

// ─── Row ↔ App mappers ───────────────────────────────────────

function rowToTeacher(r: any): Teacher {
  return {
    teacherId: r.id,
    name: r.name ?? '',
    phone: r.phone ?? '',
    email: r.email ?? '',
    institute: r.institute ?? '',
    batchIds: r.batch_ids ?? [],
    createdAt: r.created_at ?? '',
  };
}

function rowToBatch(r: any): Batch {
  return {
    batchId: r.id,
    teacherId: r.teacher_id,
    name: r.name,
    grade: r.grade ?? '',
    section: r.section ?? '',
    subject: r.subject ?? '',
    studentIds: r.student_ids ?? [],
    createdAt: r.created_at ?? '',
  };
}

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
    createdAt: r.created_at ?? '',
  };
}

function rowToAttendance(r: any): AttendanceRecord {
  return {
    id: r.id,
    studentId: r.student_id,
    batchId: r.batch_id,
    date: r.date,
    status: r.status,
    markedBy: r.marked_by ?? '',
    createdAt: r.created_at ?? '',
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
    createdBy: r.created_by ?? '',
  };
}

function rowToTestResult(r: any): TestResult {
  return {
    id: r.id,
    studentId: r.student_id,
    batchId: r.batch_id,
    subject: r.subject,
    testName: r.test_name,
    marksObtained: Number(r.marks_obtained),
    totalMarks: Number(r.total_marks),
    date: r.date,
    createdBy: r.created_by ?? '',
    createdAt: r.created_at ?? '',
  };
}

function rowToNotice(r: any): Notice {
  return {
    noticeId: r.id,
    title: r.title,
    description: r.description ?? '',
    type: r.type ?? 'general',
    targetBatchIds: r.target_batch_ids ?? [],
    createdBy: r.created_by ?? '',
    createdAt: r.created_at ?? '',
  };
}

// ═══════════════════════════════════════════════════════════════
// TEACHER
// ═══════════════════════════════════════════════════════════════

export async function getTeacherByPhone(phone: string): Promise<Teacher | null> {
  const { data } = await supabase.from('teachers').select('*').eq('phone', phone).limit(1).single();
  return data ? rowToTeacher(data) : null;
}

export async function getTeacherByEmail(email: string): Promise<Teacher | null> {
  const { data } = await supabase.from('teachers').select('*').eq('email', email).limit(1).single();
  return data ? rowToTeacher(data) : null;
}

export async function createTeacher(data: Omit<Teacher, 'teacherId' | 'createdAt'>): Promise<Teacher> {
  const { data: row, error } = await supabase
    .from('teachers')
    .insert({
      name: data.name,
      email: data.email ?? '',
      phone: data.phone ?? '',
      institute: data.institute ?? '',
      batch_ids: data.batchIds ?? [],
    })
    .select()
    .single();
  if (error) throw error;
  return rowToTeacher(row);
}

export async function updateTeacher(teacherId: string, data: Partial<Teacher>): Promise<void> {
  const mapped: Record<string, unknown> = {};
  if (data.name !== undefined) mapped.name = data.name;
  if (data.email !== undefined) mapped.email = data.email;
  if (data.phone !== undefined) mapped.phone = data.phone;
  if (data.institute !== undefined) mapped.institute = data.institute;
  if (data.batchIds !== undefined) mapped.batch_ids = data.batchIds;
  const { error } = await supabase.from('teachers').update(mapped).eq('id', teacherId);
  if (error) throw error;
}

export function subscribeToTeacher(teacherId: string, cb: (t: Teacher | null) => void) {
  // Initial fetch
  supabase.from('teachers').select('*').eq('id', teacherId).single().then(({ data }) => {
    cb(data ? rowToTeacher(data) : null);
  });

  const channel = supabase
    .channel(nextChannel('teacher'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'teachers', filter: `id=eq.${teacherId}` }, () => {
      supabase.from('teachers').select('*').eq('id', teacherId).single().then(({ data }) => {
        cb(data ? rowToTeacher(data) : null);
      });
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

// ═══════════════════════════════════════════════════════════════
// BATCHES
// ═══════════════════════════════════════════════════════════════

export function subscribeToBatches(teacherId: string, cb: (batches: Batch[]) => void) {
  const fetch = () =>
    supabase.from('batches').select('*').eq('teacher_id', teacherId).order('created_at', { ascending: false }).then(({ data }) => {
      cb((data ?? []).map(rowToBatch));
    });

  fetch();

  const channel = supabase
    .channel(nextChannel('batches'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'batches', filter: `teacher_id=eq.${teacherId}` }, () => fetch())
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

export async function createBatch(data: Omit<Batch, 'batchId' | 'createdAt'>): Promise<Batch> {
  const { data: row, error } = await supabase
    .from('batches')
    .insert({
      teacher_id: data.teacherId,
      name: data.name,
      grade: data.grade ?? '',
      section: data.section ?? '',
      subject: data.subject ?? '',
      student_ids: data.studentIds ?? [],
    })
    .select()
    .single();
  if (error) throw error;

  // Update teacher's batch_ids
  const { data: teacher } = await supabase.from('teachers').select('batch_ids').eq('id', data.teacherId).single();
  if (teacher) {
    const ids: string[] = teacher.batch_ids ?? [];
    await supabase.from('teachers').update({ batch_ids: [...ids, row.id] }).eq('id', data.teacherId);
  }

  return rowToBatch(row);
}

export async function updateBatch(batchId: string, data: Partial<Batch>): Promise<void> {
  const mapped: Record<string, unknown> = {};
  if (data.name !== undefined) mapped.name = data.name;
  if (data.grade !== undefined) mapped.grade = data.grade;
  if (data.section !== undefined) mapped.section = data.section;
  if (data.subject !== undefined) mapped.subject = data.subject;
  if (data.studentIds !== undefined) mapped.student_ids = data.studentIds;
  const { error } = await supabase.from('batches').update(mapped).eq('id', batchId);
  if (error) throw error;
}

export async function deleteBatch(batchId: string, teacherId: string): Promise<void> {
  await supabase.from('batches').delete().eq('id', batchId);
  // Remove from teacher
  const { data: teacher } = await supabase.from('teachers').select('batch_ids').eq('id', teacherId).single();
  if (teacher) {
    const ids: string[] = (teacher.batch_ids ?? []).filter((id: string) => id !== batchId);
    await supabase.from('teachers').update({ batch_ids: ids }).eq('id', teacherId);
  }
}

// ═══════════════════════════════════════════════════════════════
// STUDENTS
// ═══════════════════════════════════════════════════════════════

export function subscribeToStudentsByBatch(batchId: string, cb: (students: Student[]) => void) {
  const fetch = () =>
    supabase.from('students').select('*').eq('batch_id', batchId).order('name').then(({ data }) => {
      cb((data ?? []).map(rowToStudent));
    });

  fetch();

  const channel = supabase
    .channel(nextChannel('students-batch'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'students', filter: `batch_id=eq.${batchId}` }, () => fetch())
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

export function subscribeToStudentsByTeacher(_teacherId: string, batchIds: string[], cb: (students: Student[]) => void) {
  if (batchIds.length === 0) { cb([]); return () => {}; }

  const fetch = () =>
    supabase.from('students').select('*').in('batch_id', batchIds).then(({ data }) => {
      cb((data ?? []).map(rowToStudent));
    });

  fetch();

  const channel = supabase
    .channel(nextChannel('students-teacher'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => fetch())
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

export async function addStudent(data: Omit<Student, 'studentId' | 'createdAt'>): Promise<Student> {
  const { data: row, error } = await supabase
    .from('students')
    .insert({
      name: data.name,
      parent_email: data.parentEmail ?? '',
      batch_id: data.batchId,
      grade: data.grade ?? '',
      section: data.section ?? '',
      roll_number: data.rollNumber ?? '',
      institute: data.institute ?? '',
    })
    .select()
    .single();
  if (error) throw error;

  // Update batch's student_ids
  const { data: batch } = await supabase.from('batches').select('student_ids').eq('id', data.batchId).single();
  if (batch) {
    const ids: string[] = batch.student_ids ?? [];
    await supabase.from('batches').update({ student_ids: [...ids, row.id] }).eq('id', data.batchId);
  }

  return rowToStudent(row);
}

export async function updateStudent(studentId: string, data: Partial<Student>): Promise<void> {
  const mapped: Record<string, unknown> = {};
  if (data.name !== undefined) mapped.name = data.name;
  if (data.parentEmail !== undefined) mapped.parent_email = data.parentEmail;
  if (data.batchId !== undefined) mapped.batch_id = data.batchId;
  if (data.grade !== undefined) mapped.grade = data.grade;
  if (data.section !== undefined) mapped.section = data.section;
  if (data.rollNumber !== undefined) mapped.roll_number = data.rollNumber;
  if (data.institute !== undefined) mapped.institute = data.institute;
  const { error } = await supabase.from('students').update(mapped).eq('id', studentId);
  if (error) throw error;
}

export async function deleteStudent(studentId: string, batchId: string): Promise<void> {
  await supabase.from('students').delete().eq('id', studentId);
  // Update batch
  const { data: batch } = await supabase.from('batches').select('student_ids').eq('id', batchId).single();
  if (batch) {
    const ids: string[] = (batch.student_ids ?? []).filter((id: string) => id !== studentId);
    await supabase.from('batches').update({ student_ids: ids }).eq('id', batchId);
  }
}

// ═══════════════════════════════════════════════════════════════
// ATTENDANCE
// ═══════════════════════════════════════════════════════════════

/** Mark attendance for a full batch at once (bulk upsert) */
export async function markBatchAttendance(records: Omit<AttendanceRecord, 'id' | 'createdAt'>[]): Promise<void> {
  const rows = records.map((r) => ({
    student_id: r.studentId,
    batch_id: r.batchId,
    date: r.date,
    status: r.status,
    marked_by: r.markedBy,
  }));
  const { error } = await supabase.from('attendance').upsert(rows, { onConflict: 'student_id,date' });
  if (error) throw error;
}

export function subscribeToAttendanceByBatch(batchId: string, date: string, cb: (records: AttendanceRecord[]) => void) {
  const fetch = () =>
    supabase.from('attendance').select('*').eq('batch_id', batchId).eq('date', date).then(({ data }) => {
      cb((data ?? []).map(rowToAttendance));
    });

  fetch();

  const channel = supabase
    .channel(nextChannel('att-batch'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance' }, () => fetch())
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

export function subscribeToAttendanceByStudent(studentId: string, cb: (records: AttendanceRecord[]) => void) {
  const fetch = () =>
    supabase.from('attendance').select('*').eq('student_id', studentId).order('date', { ascending: false }).then(({ data }) => {
      cb((data ?? []).map(rowToAttendance));
    });

  fetch();

  const channel = supabase
    .channel(nextChannel('att-student'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance', filter: `student_id=eq.${studentId}` }, () => fetch())
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

// ═══════════════════════════════════════════════════════════════
// HOMEWORK
// ═══════════════════════════════════════════════════════════════

export async function assignHomework(data: Omit<Homework, 'homeworkId' | 'createdAt'>): Promise<Homework> {
  const { data: row, error } = await supabase
    .from('homework')
    .insert({
      batch_id: data.batchId,
      subject: data.subject,
      title: data.title,
      description: data.description,
      due_date: data.dueDate ?? '',
      created_by: data.createdBy,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToHomework(row);
}

export function subscribeToHomeworkByBatch(batchId: string, cb: (hw: Homework[]) => void) {
  const fetch = () =>
    supabase.from('homework').select('*').eq('batch_id', batchId).order('created_at', { ascending: false }).then(({ data }) => {
      cb((data ?? []).map(rowToHomework));
    });

  fetch();

  const channel = supabase
    .channel(nextChannel('hw-batch'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'homework', filter: `batch_id=eq.${batchId}` }, () => fetch())
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

export function subscribeToHomeworkByTeacher(teacherId: string, cb: (hw: Homework[]) => void) {
  const fetch = () =>
    supabase.from('homework').select('*').eq('created_by', teacherId).order('created_at', { ascending: false }).then(({ data }) => {
      cb((data ?? []).map(rowToHomework));
    });

  fetch();

  const channel = supabase
    .channel(nextChannel('hw-teacher'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'homework', filter: `created_by=eq.${teacherId}` }, () => fetch())
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

export async function deleteHomework(homeworkId: string): Promise<void> {
  const { error } = await supabase.from('homework').delete().eq('id', homeworkId);
  if (error) throw error;
}

// ═══════════════════════════════════════════════════════════════
// PERFORMANCE / TEST RESULTS
// ═══════════════════════════════════════════════════════════════

export async function addTestResult(data: Omit<TestResult, 'id' | 'createdAt'>): Promise<TestResult> {
  const { data: row, error } = await supabase
    .from('test_results')
    .insert({
      student_id: data.studentId,
      batch_id: data.batchId,
      subject: data.subject,
      test_name: data.testName,
      marks_obtained: data.marksObtained,
      total_marks: data.totalMarks,
      date: data.date,
      created_by: data.createdBy,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToTestResult(row);
}

/** Bulk-add results for all students in a test */
export async function addBulkTestResults(results: Omit<TestResult, 'id' | 'createdAt'>[]): Promise<void> {
  const rows = results.map((r) => ({
    student_id: r.studentId,
    batch_id: r.batchId,
    subject: r.subject,
    test_name: r.testName,
    marks_obtained: r.marksObtained,
    total_marks: r.totalMarks,
    date: r.date,
    created_by: r.createdBy,
  }));
  const { error } = await supabase.from('test_results').insert(rows);
  if (error) throw error;
}

export function subscribeToTestResultsByBatch(batchId: string, cb: (results: TestResult[]) => void) {
  const fetch = () =>
    supabase.from('test_results').select('*').eq('batch_id', batchId).order('date', { ascending: false }).then(({ data }) => {
      cb((data ?? []).map(rowToTestResult));
    });

  fetch();

  const channel = supabase
    .channel(nextChannel('tests-batch'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'test_results', filter: `batch_id=eq.${batchId}` }, () => fetch())
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

// ═══════════════════════════════════════════════════════════════
// NOTICES
// ═══════════════════════════════════════════════════════════════

export async function postNotice(data: Omit<Notice, 'noticeId' | 'createdAt'>): Promise<Notice> {
  const { data: row, error } = await supabase
    .from('notices')
    .insert({
      title: data.title,
      description: data.description,
      type: data.type,
      target_batch_ids: data.targetBatchIds,
      created_by: data.createdBy,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToNotice(row);
}

export function subscribeToNoticesByTeacher(teacherId: string, cb: (notices: Notice[]) => void) {
  const fetch = () =>
    supabase.from('notices').select('*').eq('created_by', teacherId).order('created_at', { ascending: false }).then(({ data }) => {
      cb((data ?? []).map(rowToNotice));
    });

  fetch();

  const channel = supabase
    .channel(nextChannel('notices-teacher'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notices', filter: `created_by=eq.${teacherId}` }, () => fetch())
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

export async function deleteNotice(noticeId: string): Promise<void> {
  const { error } = await supabase.from('notices').delete().eq('id', noticeId);
  if (error) throw error;
}

// ═══════════════════════════════════════════════════════════════
// FEE MANAGEMENT
// ═══════════════════════════════════════════════════════════════

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
    createdBy: r.created_by ?? '',
    createdAt: r.created_at ?? '',
  };
}

/** Create a fee record for a student */
export async function createFee(data: Omit<FeeRecord, 'feeId' | 'createdAt'>): Promise<FeeRecord> {
  const { data: row, error } = await supabase
    .from('fees')
    .insert({
      student_id: data.studentId,
      batch_id: data.batchId,
      title: data.title,
      amount: data.amount,
      paid_amount: data.paidAmount,
      due_date: data.dueDate,
      status: data.status,
      paid_date: data.paidDate || null,
      remarks: data.remarks ?? '',
      created_by: data.createdBy,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToFee(row);
}

/** Bulk-create fee records for all students in a batch */
export async function createBulkFees(fees: Omit<FeeRecord, 'feeId' | 'createdAt'>[]): Promise<void> {
  const rows = fees.map((f) => ({
    student_id: f.studentId,
    batch_id: f.batchId,
    title: f.title,
    amount: f.amount,
    paid_amount: f.paidAmount,
    due_date: f.dueDate,
    status: f.status,
    paid_date: f.paidDate || null,
    remarks: f.remarks ?? '',
    created_by: f.createdBy,
  }));
  const { error } = await supabase.from('fees').insert(rows);
  if (error) throw error;
}

/** Update a fee record (e.g. record partial/full payment) */
export async function updateFee(feeId: string, data: Partial<FeeRecord>): Promise<void> {
  const mapped: Record<string, unknown> = {};
  if (data.paidAmount !== undefined) mapped.paid_amount = data.paidAmount;
  if (data.status !== undefined) mapped.status = data.status;
  if (data.paidDate !== undefined) mapped.paid_date = data.paidDate || null;
  if (data.remarks !== undefined) mapped.remarks = data.remarks;
  if (data.amount !== undefined) mapped.amount = data.amount;
  if (data.title !== undefined) mapped.title = data.title;
  if (data.dueDate !== undefined) mapped.due_date = data.dueDate;
  const { error } = await supabase.from('fees').update(mapped).eq('id', feeId);
  if (error) throw error;
}

/** Delete a fee record */
export async function deleteFee(feeId: string): Promise<void> {
  const { error } = await supabase.from('fees').delete().eq('id', feeId);
  if (error) throw error;
}

/** Subscribe to all fees for a batch */
export function subscribeToFeesByBatch(batchId: string, cb: (fees: FeeRecord[]) => void) {
  const fetch = () =>
    supabase.from('fees').select('*').eq('batch_id', batchId).order('due_date', { ascending: false }).then(({ data }) => {
      cb((data ?? []).map(rowToFee));
    });

  fetch();

  const channel = supabase
    .channel(nextChannel('fees-batch'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'fees', filter: `batch_id=eq.${batchId}` }, () => fetch())
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}

/** Subscribe to all fees across all batches for a teacher */
export function subscribeToFeesByTeacher(teacherId: string, batchIds: string[], cb: (fees: FeeRecord[]) => void) {
  if (batchIds.length === 0) { cb([]); return () => {}; }

  const fetch = () =>
    supabase.from('fees').select('*').in('batch_id', batchIds).order('due_date', { ascending: false }).then(({ data }) => {
      cb((data ?? []).map(rowToFee));
    });

  fetch();

  const channel = supabase
    .channel(nextChannel('fees-teacher'))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'fees' }, () => fetch())
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
