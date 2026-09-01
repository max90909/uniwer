// Генератор демонстрационных данных: 20 групп (3321…3340) по 25 учеников, курс на 9 месяцев.
// Детерминированный генератор (без Math.random) — при каждой пересборке даёт одни и те же данные,
// пока пользователь не начнёт редактировать их через интерфейс (тогда изменения живут в localStorage, см. store.ts).
// Когда реальные ученики заменят демо-данные, этот файл просто перестаёт использоваться —
// store.ts подключается к настоящему Supabase по той же структуре типов (см. types.ts).

import type {
  AssessmentType,
  Assessment,
  AttendanceRecord,
  AttendanceStatus,
  BehaviorEvent,
  BehaviorType,
  Book,
  Course,
  Grade,
  GradingConfig,
  Group,
  MaterialRecord,
  MonthRecord,
  Student,
  Teacher,
  TeacherGroup,
  Topic,
  UserRecord,
  WeekRecord,
} from '../types';

// ---------- детерминированный генератор случайных чисел (mulberry32) ----------
function mulberry32(seed: number) {
  let a = seed;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260827);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const round1 = (v: number) => Math.round(v * 10) / 10;

const FIRST_NAMES_M = ['Ахмед', 'Мурад', 'Тимур', 'Руслан', 'Артём', 'Данил', 'Игорь', 'Марат', 'Олег', 'Самир', 'Эмиль', 'Ярослав', 'Бек'];
const FIRST_NAMES_F = ['Айгуль', 'Дана', 'Камила', 'Лейла', 'Мадина', 'Наргиз', 'Полина', 'Сабина', 'Тамара', 'Улжан', 'Фатима', 'Жанна'];
const LAST_NAMES = ['Ахметов', 'Бекова', 'Валиев', 'Гареева', 'Джумаев', 'Ержанов', 'Жумабекова', 'Ибрагимов', 'Касымова', 'Ли', 'Мусаев', 'Нурланова', 'Омаров', 'Петров', 'Рахимова', 'Садыков', 'Турсунова', 'Файзиев', 'Хасенова', 'Цой', 'Шарипов', 'Юсупова'];

function personName(i: number): { full: string; gender: 'm' | 'f' } {
  const gender: 'm' | 'f' = i % 2 === 0 ? 'm' : 'f';
  const first = gender === 'm' ? pick(FIRST_NAMES_M) : pick(FIRST_NAMES_F);
  const last = pick(LAST_NAMES);
  return { full: `${first} ${last}`, gender };
}

// ---------- курс, темы, группы ----------
export const course: Course = { id: 'course-1', name: 'Английский язык · поток 2026', nameKey: 'course.name', totalMonths: 9 };

export const topics: Topic[] = [
  { id: 'topic-grammar', courseId: course.id, name: 'Грамматика', nameKey: 'topic.grammar' },
  { id: 'topic-vocab', courseId: course.id, name: 'Словарный запас', nameKey: 'topic.vocab' },
  { id: 'topic-reading', courseId: course.id, name: 'Чтение', nameKey: 'topic.reading' },
  { id: 'topic-listening', courseId: course.id, name: 'Аудирование', nameKey: 'topic.listening' },
  { id: 'topic-speaking', courseId: course.id, name: 'Разговорная практика', nameKey: 'topic.speaking' },
];

// Группы курса — номера 3321…3340, как в учебном расписании.
const GROUP_CODES = Array.from({ length: 20 }, (_, i) => String(3321 + i));
const GROUP_DEFS = GROUP_CODES.map((code) => ({ id: `group-${code}`, code }));

// Номер подставляется в перевод, поэтому «Группа 3321» / «Group 3321» /
// «3321 topary» собираются на лету, а не хранятся готовой строкой.
export const groups: Group[] = GROUP_DEFS.map((g) => ({
  id: g.id,
  courseId: course.id,
  name: g.code,
  nameKey: 'group.named',
  nameVars: { letter: g.code },
}));

// ---------- пользователи ----------
export const admin: UserRecord = {
  id: 'user-admin-1',
  email: 'admin@vedomost.demo',
  fullName: 'Администратор системы',
  role: 'admin',
  isActive: true,
};

// Курс ведёт один преподаватель — он же владеет всеми группами потока.
const TEACHER_NAMES = ['Tleuov Parahat'];
export const teacherUsers: UserRecord[] = TEACHER_NAMES.map((name, i) => ({
  id: `user-teacher-${i + 1}`,
  email: `teacher${i + 1}@vedomost.demo`,
  fullName: name,
  role: 'teacher',
  isActive: true,
}));
export const teachers: Teacher[] = teacherUsers.map((u) => ({ userId: u.id }));
export const teacherGroups: TeacherGroup[] = GROUP_DEFS.map((g) => ({
  teacherId: teacherUsers[0].id,
  groupId: g.id,
}));

interface StudentProfile {
  skillBase: number; // стартовый уровень 0..100
  growth: number; // суммарный прирост к концу курса
  volatility: number; // разброс результатов (стабильность)
  engagement: number; // влияет на посещаемость и поведение, 0..1
  topicBias: Record<string, number>;
}

export const studentUsers: UserRecord[] = [];
export const students: Student[] = [];
const studentProfiles = new Map<string, StudentProfile>();

let studentCounter = 1;
for (const g of GROUP_DEFS) {
  for (let n = 1; n <= 25; n++) {
    const { full } = personName(studentCounter);
    const id = `user-student-${studentCounter}`;
    studentUsers.push({
      id,
      email: `student${studentCounter}@vedomost.demo`,
      fullName: full,
      role: 'student',
      isActive: true,
    });
    students.push({
      userId: id,
      groupId: g.id,
      studentCode: `ST-${String(studentCounter).padStart(4, '0')}`,
      enrolledAt: '2026-01-12',
    });
    const bias: Record<string, number> = {};
    topics.forEach((t) => (bias[t.id] = (rand() - 0.5) * 24));
    studentProfiles.set(id, {
      skillBase: clamp(40 + rand() * 40, 30, 85),
      growth: rand() * 30 - 4, // большинство растёт, немного — топчется на месте
      volatility: 4 + rand() * 12,
      engagement: clamp(0.55 + rand() * 0.5, 0.4, 1),
      topicBias: bias,
    });
    studentCounter++;
  }
}

// ---------- месяцы и недели ----------
export const months: MonthRecord[] = [];
export const weeks: WeekRecord[] = [];
const MONTH_NAMES = ['Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь', 'Январь', 'Февраль', 'Март', 'Апрель', 'Май'];
const MONTH_KEYS = ['sep', 'oct', 'nov', 'dec', 'jan', 'feb', 'mar', 'apr', 'may'];
const START = new Date('2026-01-12T00:00:00Z');

let cursor = new Date(START);
for (let m = 1; m <= course.totalMonths; m++) {
  const monthId = `month-${m}`;
  months.push({
    id: monthId,
    courseId: course.id,
    index: m,
    name: MONTH_NAMES[(m - 1) % MONTH_NAMES.length],
    nameKey: `month.${MONTH_KEYS[(m - 1) % MONTH_KEYS.length]}`,
  });
  for (let w = 1; w <= 4; w++) {
    const startDate = new Date(cursor);
    const endDate = new Date(cursor);
    endDate.setUTCDate(endDate.getUTCDate() + 6);
    weeks.push({
      id: `week-${m}-${w}`,
      monthId,
      index: w,
      startDate: startDate.toISOString().slice(0, 10),
      endDate: endDate.toISOString().slice(0, 10),
    });
    cursor.setUTCDate(cursor.getUTCDate() + 7);
  }
}

// ---------- книги и материалы (по одной паре на неделю, общие для всех групп) ----------
const BOOK_TITLES: [string, string][] = [
  ['Grammar in Use', 'Raymond Murphy'],
  ['Reading Practice', 'Liz Soars'],
  ['English Vocabulary in Use', 'Michael McCarthy'],
  ['Listening Extra', 'Miles Craven'],
  ['Speak Now', 'Jack C. Richards'],
];
export const books: Book[] = [];
export const materials: MaterialRecord[] = [];
weeks.forEach((w, i) => {
  const [t1] = BOOK_TITLES[i % BOOK_TITLES.length];
  const [t2, a2] = BOOK_TITLES[(i + 2) % BOOK_TITLES.length];
  books.push({
    id: `book-${w.id}-1`,
    weekId: w.id,
    title: BOOK_TITLES[i % BOOK_TITLES.length][0],
    author: BOOK_TITLES[i % BOOK_TITLES.length][1],
    description: `Основной учебник недели ${w.index}`,
    descriptionKey: 'material.primaryBook',
    descriptionVars: { week: w.index },
    chapters: `Главы ${((i % 5) + 1)}–${((i % 5) + 2)}`,
    chaptersKey: 'material.chapterRange',
    chaptersVars: { from: (i % 5) + 1, to: (i % 5) + 2 },
    dueDate: w.endDate,
  });
  books.push({
    id: `book-${w.id}-2`,
    weekId: w.id,
    title: t2,
    author: a2,
    description: `Дополнительный источник недели ${w.index}`,
    descriptionKey: 'material.extraBook',
    descriptionVars: { week: w.index },
    chapters: `Глава ${((i % 4) + 1)}`,
    chaptersKey: 'material.chapterOne',
    chaptersVars: { n: (i % 4) + 1 },
    dueDate: w.endDate,
  });
  materials.push({
    id: `material-${w.id}-1`,
    weekId: w.id,
    title: t1 === 'Listening Extra' ? 'Аудиозапись к уроку' : 'Раздаточный материал (PDF)',
    titleKey: t1 === 'Listening Extra' ? 'material.audio' : 'material.handout',
    type: 'pdf',
    publishedAt: w.startDate,
  });
});

// ---------- темы недель по кругу ----------
function topicForWeek(globalWeekIndex: number): Topic {
  return topics[globalWeekIndex % topics.length];
}

// ---------- тесты и оценки ----------
export const assessments: Assessment[] = [];
export const grades: Grade[] = [];

const totalWeeks = weeks.length;
let gradeCounter = 1;
// Оценки вносятся только за уже прошедшие тесты — как и в реальной работе, будущие недели
// стоят в программе, но баллов по ним ещё нет, пока преподаватель их не проведёт и не внесёт.
const todayIso = new Date().toISOString().slice(0, 10);

groups.forEach((g) => {
  const groupStudents = students.filter((s) => s.groupId === g.id);
  weeks.forEach((w, wi) => {
    const monthIndex = months.findIndex((m) => m.id === w.monthId);
    const isLastWeekOfMonth = w.index === 4;
    const progressFraction = wi / (totalWeeks - 1);
    const topic = topicForWeek(wi);

    const weeklyAssessment: Assessment = {
      id: `assess-${g.id}-${w.id}-weekly`,
      weekId: w.id,
      groupId: g.id,
      topicId: topic.id,
      type: 'weekly' as AssessmentType,
      maxScore: 25,
      administeredOn: w.endDate,
    };
    assessments.push(weeklyAssessment);

    const monthAssessments: Assessment[] = [weeklyAssessment];

    if (isLastWeekOfMonth) {
      const isFinal = monthIndex === months.length - 1;
      const controlAssessment: Assessment = {
        id: `assess-${g.id}-${w.id}-${isFinal ? 'final' : 'control'}`,
        weekId: w.id,
        groupId: g.id,
        topicId: null,
        type: isFinal ? 'final' : 'control',
        maxScore: isFinal ? 100 : 50,
        administeredOn: w.endDate,
      };
      assessments.push(controlAssessment);
      monthAssessments.push(controlAssessment);
    }

    monthAssessments.forEach((assessment) => {
      if (assessment.administeredOn > todayIso) return; // тест ещё впереди — баллов пока нет
      groupStudents.forEach((s) => {
        const profile = studentProfiles.get(s.userId)!;
        const topicSkew = assessment.topicId ? profile.topicBias[assessment.topicId] ?? 0 : 0;
        const noise = (rand() - 0.5) * 2 * profile.volatility;
        const basePercent = profile.skillBase + profile.growth * progressFraction + topicSkew + noise;
        const percent = clamp(basePercent, 22, 99);
        const scoreCorrect = Math.round((percent / 100) * assessment.maxScore);
        const scorePercent = round1((scoreCorrect / assessment.maxScore) * 100);
        grades.push({
          id: `grade-${gradeCounter++}`,
          assessmentId: assessment.id,
          studentId: s.userId,
          scoreCorrect,
          scoreTotal: assessment.maxScore,
          scorePercent,
          enteredBy: teacherGroups.find((tg) => tg.groupId === g.id)!.teacherId,
          enteredAt: assessment.administeredOn,
          updatedAt: assessment.administeredOn,
        });
      });
    });
  });
});

// ---------- посещаемость (одна отметка на неделю на ученика) ----------
export const attendance: AttendanceRecord[] = [];
let attendanceCounter = 1;
groups.forEach((g) => {
  const groupStudents = students.filter((s) => s.groupId === g.id);
  const teacherId = teacherGroups.find((tg) => tg.groupId === g.id)!.teacherId;
  weeks
    .filter((w) => w.endDate <= todayIso)
    .forEach((w) => {
    groupStudents.forEach((s) => {
      const profile = studentProfiles.get(s.userId)!;
      const roll = rand();
      let status: AttendanceStatus = 'present';
      if (roll > profile.engagement + 0.35) status = 'absent';
      else if (roll > profile.engagement) status = 'late';
      attendance.push({
        id: `attendance-${attendanceCounter++}`,
        studentId: s.userId,
        groupId: g.id,
        date: w.endDate,
        status,
        markedBy: teacherId,
      });
    });
  });
});

// ---------- журнал поведения (редкие события) ----------
const NEGATIVE_TYPES: BehaviorType[] = ['sleeping', 'late', 'phone', 'talking', 'no_homework', 'discipline'];
const POSITIVE_TYPES: BehaviorType[] = ['active', 'good_work'];
const COMMENTS: Record<string, string> = {
  sleeping: 'Уснул во время второй половины занятия.',
  late: 'Опоздал больше чем на 10 минут.',
  phone: 'Использовал телефон во время объяснения темы.',
  talking: 'Разговаривал с соседом, отвлекал группу.',
  no_homework: 'Не выполнил домашнее задание.',
  discipline: 'Нарушил дисциплину на занятии.',
  active: 'Активно участвовал в обсуждении, задавал вопросы.',
  good_work: 'Отлично справился с заданием у доски.',
};

export const behaviorEvents: BehaviorEvent[] = [];
let behaviorCounter = 1;
const pastWeeks = weeks.filter((w) => w.endDate <= todayIso);
students.forEach((s) => {
  if (pastWeeks.length === 0) return;
  const profile = studentProfiles.get(s.userId)!;
  const teacherId = teacherGroups.find((tg) => tg.groupId === s.groupId)!.teacherId;
  const negativeCount = Math.round((1 - profile.engagement) * 5);
  const positiveCount = Math.round(profile.engagement * 3);
  for (let i = 0; i < negativeCount; i++) {
    const type = pick(NEGATIVE_TYPES);
    const week = pick(pastWeeks);
    behaviorEvents.push({
      id: `behavior-${behaviorCounter++}`,
      studentId: s.userId,
      date: week.endDate,
      type,
      comment: COMMENTS[type],
      createdBy: teacherId,
      visibleToStudent: true,
    });
  }
  for (let i = 0; i < positiveCount; i++) {
    const type = pick(POSITIVE_TYPES);
    const week = pick(pastWeeks);
    behaviorEvents.push({
      id: `behavior-${behaviorCounter++}`,
      studentId: s.userId,
      date: week.endDate,
      type,
      comment: COMMENTS[type],
      createdBy: teacherId,
      visibleToStudent: true,
    });
  }
});

// ---------- конфигурация формул (редактируется администратором) ----------
export const gradingConfig: GradingConfig = {
  courseId: course.id,
  weeklyWeight: 0.4,
  controlWeight: 0.3,
  finalWeight: 0.3,
  indexWeights: { knowledge: 0.4, stability: 0.2, progress: 0.2, control: 0.2 },
  includeAttendanceInIndex: false,
  includeBehaviorInIndex: false,
};

export const allUsers: UserRecord[] = [admin, ...teacherUsers, ...studentUsers];

export interface SeedBundle {
  course: Course;
  topics: Topic[];
  groups: Group[];
  admin: UserRecord;
  teacherUsers: UserRecord[];
  teachers: Teacher[];
  teacherGroups: TeacherGroup[];
  studentUsers: UserRecord[];
  students: Student[];
  months: MonthRecord[];
  weeks: WeekRecord[];
  books: Book[];
  materials: MaterialRecord[];
  assessments: Assessment[];
  grades: Grade[];
  attendance: AttendanceRecord[];
  behaviorEvents: BehaviorEvent[];
  gradingConfig: GradingConfig;
  allUsers: UserRecord[];
}

export function buildSeed(): SeedBundle {
  return {
    course,
    topics,
    groups,
    admin,
    teacherUsers,
    teachers,
    teacherGroups,
    studentUsers,
    students,
    months,
    weeks,
    books,
    materials,
    assessments,
    grades,
    attendance,
    behaviorEvents,
    gradingConfig,
    allUsers,
  };
}
