-- ══════════════════════════════════════════════════════════════
-- ClassPulse + ParentPulse — Supabase PostgreSQL Schema
-- ══════════════════════════════════════════════════════════════
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query).
--
-- IMPORTANT: After running this, also enable Realtime for each table:
--   Dashboard → Database → Replication → Enable for all tables below.
-- ══════════════════════════════════════════════════════════════

-- ─── Teachers ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teachers (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name        TEXT NOT NULL DEFAULT '',
  email       TEXT UNIQUE NOT NULL,
  phone       TEXT DEFAULT '',
  institute   TEXT DEFAULT '',
  batch_ids   TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── Batches ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS batches (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id  UUID REFERENCES teachers(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  grade       TEXT DEFAULT '',
  section     TEXT DEFAULT '',
  subject     TEXT DEFAULT '',
  student_ids TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── Students ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  parent_email  TEXT NOT NULL DEFAULT '',
  batch_id      UUID REFERENCES batches(id) ON DELETE CASCADE,
  grade         TEXT DEFAULT '',
  section       TEXT DEFAULT '',
  roll_number   TEXT DEFAULT '',
  institute     TEXT DEFAULT '',
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ─── Attendance ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id  UUID REFERENCES students(id) ON DELETE CASCADE,
  batch_id    UUID REFERENCES batches(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  status      TEXT CHECK (status IN ('present', 'absent', 'holiday')) NOT NULL,
  marked_by   TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (student_id, date)
);

-- ─── Homework ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS homework (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id    UUID REFERENCES batches(id) ON DELETE CASCADE,
  subject     TEXT NOT NULL DEFAULT '',
  title       TEXT NOT NULL,
  description TEXT DEFAULT '',
  due_date    TEXT DEFAULT '',
  created_by  TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── Test Results / Performance ──────────────────────────────
CREATE TABLE IF NOT EXISTS test_results (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id      UUID REFERENCES students(id) ON DELETE CASCADE,
  batch_id        UUID REFERENCES batches(id) ON DELETE CASCADE,
  subject         TEXT NOT NULL,
  test_name       TEXT NOT NULL,
  marks_obtained  NUMERIC NOT NULL DEFAULT 0,
  total_marks     NUMERIC NOT NULL DEFAULT 0,
  date            DATE NOT NULL,
  created_by      TEXT DEFAULT '',
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─── Notices ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notices (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title            TEXT NOT NULL,
  description      TEXT DEFAULT '',
  type             TEXT CHECK (type IN ('general', 'urgent', 'event', 'holiday', 'exam', 'alert')) NOT NULL DEFAULT 'general',
  target_batch_ids TEXT[] DEFAULT '{}',
  created_by       TEXT DEFAULT '',
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ══════════════════════════════════════════════════════════════
-- Row Level Security — allow all for authenticated users
-- ══════════════════════════════════════════════════════════════

ALTER TABLE teachers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches       ENABLE ROW LEVEL SECURITY;
ALTER TABLE students      ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance    ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework      ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_results  ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices       ENABLE ROW LEVEL SECURITY;

-- Authenticated users can do everything (fine for a class-management app)
CREATE POLICY "auth_all" ON teachers      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON batches       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON students      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON attendance    FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON homework      FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON test_results  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON notices       FOR ALL USING (true) WITH CHECK (true);

-- ══════════════════════════════════════════════════════════════
-- Enable Realtime (publication)
-- ══════════════════════════════════════════════════════════════

-- Supabase uses the `supabase_realtime` publication.
-- Add all tables so clients can subscribe to changes.
ALTER PUBLICATION supabase_realtime ADD TABLE teachers;
ALTER PUBLICATION supabase_realtime ADD TABLE batches;
ALTER PUBLICATION supabase_realtime ADD TABLE students;
ALTER PUBLICATION supabase_realtime ADD TABLE attendance;
ALTER PUBLICATION supabase_realtime ADD TABLE homework;
ALTER PUBLICATION supabase_realtime ADD TABLE test_results;
ALTER PUBLICATION supabase_realtime ADD TABLE notices;

-- ─── Fees ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fees (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id  UUID REFERENCES students(id) ON DELETE CASCADE,
  batch_id    UUID REFERENCES batches(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT 'Tuition Fee',
  amount      NUMERIC NOT NULL DEFAULT 0,
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  due_date    DATE NOT NULL,
  status      TEXT CHECK (status IN ('paid', 'pending', 'overdue', 'partial')) NOT NULL DEFAULT 'pending',
  paid_date   DATE,
  remarks     TEXT DEFAULT '',
  created_by  TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth_all" ON fees FOR ALL USING (true) WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE fees;
