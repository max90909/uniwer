// Доменная модель — соответствует схеме из проектного документа «Ведомость» (раздел 03).
// Названия полей намеренно совпадают с именами таблиц/колонок в supabase/migrations/0001_init.sql,
// чтобы позже store.ts можно было переключить с demo-данных на реальный Supabase почти без изменений выше по стеку.

export type Role = 'student' | 'teacher' | 'admin';

export interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
}

export interface Course {
  id: string;
  name: string;
  totalMonths: number;
}

export interface Group {
  id: string;
  courseId: string;
  name: string;
}

export interface TeacherGroup {
  teacherId: string;
  groupId: string;
}

export interface Student {
  userId: string;
  groupId: string;
  studentCode: string;
  enrolledAt: string;
}

export interface Teacher {
  userId: string;
  bio?: string;
}

export interface MonthRecord {
  id: string;
  courseId: string;
  index: number;
  name: string;
}

export interface WeekRecord {
  id: string;
  monthId: string;
  index: number;
  startDate: string;
  endDate: string;
}

export interface Book {
  id: string;
  weekId: string;
  title: string;
  author: string;
  description: string;
  chapters: string;
  dueDate: string;
}

export interface MaterialRecord {
  id: string;
  weekId: string;
  title: string;
  type: string;
  publishedAt: string;
}

export interface Topic {
  id: string;
  courseId: string;
  name: string;
}

export type AssessmentType = 'weekly' | 'control' | 'final';

export interface Assessment {
  id: string;
  weekId: string;
  groupId: string;
  topicId: string | null;
  type: AssessmentType;
  maxScore: number;
  administeredOn: string;
}

export interface Grade {
  id: string;
  assessmentId: string;
  studentId: string;
  scoreCorrect: number;
  scoreTotal: number;
  scorePercent: number;
  enteredBy: string;
  enteredAt: string;
  updatedAt: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  groupId: string;
  date: string;
  status: AttendanceStatus;
  markedBy: string;
  note?: string;
}

export type BehaviorType =
  | 'sleeping'
  | 'late'
  | 'phone'
  | 'talking'
  | 'no_homework'
  | 'discipline'
  | 'active'
  | 'good_work'
  | 'custom';

export interface BehaviorEvent {
  id: string;
  studentId: string;
  date: string;
  type: BehaviorType;
  comment: string;
  createdBy: string;
  visibleToStudent: boolean;
}

export interface GradingConfig {
  courseId: string;
  weeklyWeight: number;
  controlWeight: number;
  finalWeight: number;
  indexWeights: {
    knowledge: number;
    stability: number;
    progress: number;
    control: number;
  };
  includeAttendanceInIndex: boolean;
  includeBehaviorInIndex: boolean;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  action: string;
  entity: string;
  entityId: string;
  occurredAt: string;
  meta?: Record<string, unknown>;
}

export const BEHAVIOR_TONE: Record<BehaviorType, 'positive' | 'negative'> = {
  sleeping: 'negative',
  late: 'negative',
  phone: 'negative',
  talking: 'negative',
  no_homework: 'negative',
  discipline: 'negative',
  active: 'positive',
  good_work: 'positive',
  custom: 'positive',
};
