-- Ведомость — начальная схема (соответствует разделу 03 проектного документа).
-- Применяется на реальном Supabase-проекте, когда придёт время подключить настоящий backend
-- вместо demo-хранилища из src/data/seed.ts. RLS-политики — в 0002_rls.sql.

create extension if not exists "pgcrypto";

create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text not null,
  role text not null check (role in ('student', 'teacher', 'admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  total_months int not null default 9
);

create table groups (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  name text not null
);

create table teachers (
  user_id uuid primary key references users(id) on delete cascade,
  bio text
);

create table teacher_groups (
  teacher_id uuid not null references teachers(user_id) on delete cascade,
  group_id uuid not null references groups(id) on delete cascade,
  primary key (teacher_id, group_id)
);

create table students (
  user_id uuid primary key references users(id) on delete cascade,
  group_id uuid not null references groups(id) on delete restrict,
  student_code text unique not null,
  enrolled_at date not null default current_date
);

create table months (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  index int not null,
  name text not null,
  unique (course_id, index)
);

create table weeks (
  id uuid primary key default gen_random_uuid(),
  month_id uuid not null references months(id) on delete cascade,
  index int not null,
  start_date date not null,
  end_date date not null,
  unique (month_id, index)
);

create table topics (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  name text not null
);

create table books (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references weeks(id) on delete cascade,
  title text not null,
  author text,
  description text,
  storage_path text,
  chapters text,
  due_date date
);

create table materials (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references weeks(id) on delete cascade,
  title text not null,
  type text not null default 'pdf',
  storage_path text,
  published_at date not null default current_date
);

create table assessments (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references weeks(id) on delete cascade,
  group_id uuid not null references groups(id) on delete cascade,
  topic_id uuid references topics(id),
  type text not null check (type in ('weekly', 'control', 'final')),
  max_score numeric not null default 25,
  administered_on date not null
);

create table grades (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references assessments(id) on delete cascade,
  student_id uuid not null references students(user_id) on delete cascade,
  score_correct numeric not null,
  score_total numeric not null,
  score_percent numeric generated always as (round(score_correct / nullif(score_total, 0) * 100, 1)) stored,
  entered_by uuid not null references users(id),
  entered_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assessment_id, student_id)
);

create table attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(user_id) on delete cascade,
  group_id uuid not null references groups(id) on delete cascade,
  date date not null,
  status text not null check (status in ('present', 'absent', 'late', 'excused')),
  marked_by uuid not null references users(id),
  note text,
  unique (student_id, date)
);

create table behavior_events (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(user_id) on delete cascade,
  date date not null,
  type text not null,
  comment text,
  created_by uuid not null references users(id),
  visible_to_student boolean not null default true
);

create table grading_config (
  course_id uuid primary key references courses(id) on delete cascade,
  weekly_weight numeric not null default 0.4,
  control_weight numeric not null default 0.3,
  final_weight numeric not null default 0.3,
  index_weights jsonb not null default '{"knowledge":0.4,"stability":0.2,"progress":0.2,"control":0.2}',
  include_attendance_in_index boolean not null default false,
  include_behavior_in_index boolean not null default false
);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references users(id),
  action text not null,
  entity text not null,
  entity_id uuid not null,
  occurred_at timestamptz not null default now(),
  meta jsonb
);

create index on grades (student_id);
create index on grades (assessment_id);
create index on attendance (student_id);
create index on assessments (group_id, week_id);
