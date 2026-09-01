// Формулы оценивания — прямая реализация раздела 07/08/09 проектного документа.
// Ничего здесь не привязано к demo-данным: те же функции будут работать и над реальными
// данными из Supabase, если на вход подать те же массивы объектов из types.ts.

import type {
  Assessment,
  AttendanceRecord,
  BehaviorEvent,
  Grade,
  GradingConfig,
  Group,
  Student,
  Topic,
} from '../types';

export const round1 = (v: number) => Math.round(v * 10) / 10;

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  return Math.sqrt(mean(values.map((v) => (v - m) ** 2)));
}

export interface GradeWithAssessment {
  grade: Grade;
  assessment: Assessment;
}

/**
 * Индексы по массивам оценок и тестов.
 *
 * Раньше `gradesForStudent` на каждый вызов строила Map всех тестов и
 * прогоняла фильтр по всем оценкам. В рейтинге это повторяется на каждого
 * ученика, поэтому стоимость была «ученики × оценки»: на потоке из 500 человек
 * и ~18 000 оценок это миллионы операций на одну страницу.
 *
 * Ключ — сам массив: store при любой правке кладёт новый массив (`[...prev]`),
 * поэтому изменение данных автоматически делает индекс невалидным. WeakMap не
 * держит массивы в памяти после того, как на них не осталось ссылок.
 */
const gradesByStudentCache = new WeakMap<Grade[], Map<string, Grade[]>>();
const assessmentsByIdCache = new WeakMap<Assessment[], Map<string, Assessment>>();

function gradesByStudent(grades: Grade[]): Map<string, Grade[]> {
  let index = gradesByStudentCache.get(grades);
  if (!index) {
    index = new Map();
    for (const g of grades) {
      const list = index.get(g.studentId);
      if (list) list.push(g);
      else index.set(g.studentId, [g]);
    }
    gradesByStudentCache.set(grades, index);
  }
  return index;
}

function assessmentsById(assessments: Assessment[]): Map<string, Assessment> {
  let index = assessmentsByIdCache.get(assessments);
  if (!index) {
    index = new Map(assessments.map((a) => [a.id, a]));
    assessmentsByIdCache.set(assessments, index);
  }
  return index;
}

/**
 * Сколько оценок выставлено по каждой группе.
 *
 * Считалось так: для каждой оценки — линейный поиск её теста среди всех тестов,
 * и всё это заново на каждую группу. На потоке из 20 групп выходило порядка
 * сотен миллионов сравнений и почти две секунды блокировки потока. Теперь один
 * проход по оценкам на весь набор данных.
 *
 * Кэш вложенный, потому что результат зависит и от оценок, и от тестов: если
 * ключом взять только оценки, правка расписания оставила бы старые числа.
 */
const gradeCountByGroupCache = new WeakMap<Grade[], WeakMap<Assessment[], Map<string, number>>>();

function gradeCountByGroup(grades: Grade[], assessments: Assessment[]): Map<string, number> {
  let byAssessments = gradeCountByGroupCache.get(grades);
  if (!byAssessments) {
    byAssessments = new WeakMap();
    gradeCountByGroupCache.set(grades, byAssessments);
  }
  let index = byAssessments.get(assessments);
  if (!index) {
    const byId = assessmentsById(assessments);
    index = new Map();
    for (const g of grades) {
      const groupId = byId.get(g.assessmentId)?.groupId;
      if (groupId) index.set(groupId, (index.get(groupId) ?? 0) + 1);
    }
    byAssessments.set(assessments, index);
  }
  return index;
}

export function gradesForStudent(studentId: string, grades: Grade[], assessments: Assessment[]): GradeWithAssessment[] {
  const byId = assessmentsById(assessments);
  const mine = gradesByStudent(grades).get(studentId);
  if (!mine) return [];
  return mine
    .map((grade) => ({ grade, assessment: byId.get(grade.assessmentId)! }))
    .filter((g) => g.assessment)
    .sort((a, b) => a.assessment.administeredOn.localeCompare(b.assessment.administeredOn));
}

/** Средний балл ученика за период, взвешенный по типам тестов (раздел 07). */
export function periodAverage(
  entries: GradeWithAssessment[],
  config: GradingConfig,
  range?: { from?: string; to?: string }
): { average: number; weekly: number; control: number; final: number } {
  const scoped = range
    ? entries.filter(
        (e) => (!range.from || e.assessment.administeredOn >= range.from) && (!range.to || e.assessment.administeredOn <= range.to)
      )
    : entries;

  const byType = (type: Assessment['type']) => scoped.filter((e) => e.assessment.type === type).map((e) => e.grade.scorePercent);

  const weeklyAvg = mean(byType('weekly'));
  const controlAvg = mean(byType('control'));
  const finalAvg = mean(byType('final'));

  const parts: { value: number; weight: number }[] = [];
  if (byType('weekly').length) parts.push({ value: weeklyAvg, weight: config.weeklyWeight });
  if (byType('control').length) parts.push({ value: controlAvg, weight: config.controlWeight });
  if (byType('final').length) parts.push({ value: finalAvg, weight: config.finalWeight });

  const weightSum = parts.reduce((s, p) => s + p.weight, 0) || 1;
  const average = parts.reduce((s, p) => s + (p.value * p.weight) / weightSum, 0);

  return { average: round1(average), weekly: round1(weeklyAvg), control: round1(controlAvg), final: round1(finalAvg) };
}

/** История результатов по теме — раздел 06. */
export function topicHistory(entries: GradeWithAssessment[], topicId: string) {
  return entries
    .filter((e) => e.assessment.topicId === topicId)
    .map((e) => ({ date: e.assessment.administeredOn, percent: e.grade.scorePercent }));
}

export type Trend = 'up' | 'down' | 'flat';

export function classifyTrend(series: number[]): Trend {
  if (series.length < 2) return 'flat';
  const half = Math.max(1, Math.floor(series.length / 2));
  const first = mean(series.slice(0, half));
  const second = mean(series.slice(series.length - half));
  const delta = second - first;
  if (delta >= 5) return 'up';
  if (delta <= -5) return 'down';
  return 'flat';
}

export interface TopicSummaryRow {
  topic: Topic;
  latest: number | null;
  history: { date: string; percent: number }[];
  trend: Trend;
}

export function topicSummaries(entries: GradeWithAssessment[], topics: Topic[]): TopicSummaryRow[] {
  return topics.map((topic) => {
    const history = topicHistory(entries, topic.id);
    return {
      topic,
      latest: history.length ? history[history.length - 1].percent : null,
      history,
      trend: classifyTrend(history.map((h) => h.percent)),
    };
  });
}

/** Стабильность и прогресс — компоненты общего индекса, раздел 07. */
export function stabilityScore(entries: GradeWithAssessment[]): number {
  const values = entries.map((e) => e.grade.scorePercent);
  if (values.length < 2) return 100;
  const sd = stddev(values);
  // нормируем: разброс 0 → 100 баллов стабильности, разброс 40+ п.п. → 0
  return round1(clampScore(100 - (sd / 40) * 100));
}

export function progressScore(entries: GradeWithAssessment[]): { delta: number; score: number; start: number; current: number } {
  if (entries.length < 2) return { delta: 0, score: 50, start: 0, current: 0 };
  const half = Math.max(1, Math.floor(entries.length / 4));
  const start = mean(entries.slice(0, half).map((e) => e.grade.scorePercent));
  const current = mean(entries.slice(-half).map((e) => e.grade.scorePercent));
  const delta = round1(current - start);
  // прирост -20..+40 п.п. нормируем в шкалу 0..100
  const score = clampScore(((delta + 20) / 60) * 100);
  return { delta, score: round1(score), start: round1(start), current: round1(current) };
}

function clampScore(v: number) {
  return Math.max(0, Math.min(100, v));
}

export function attendancePercent(records: AttendanceRecord[]): { percent: number; present: number; absent: number; late: number; excused: number } {
  const present = records.filter((r) => r.status === 'present').length;
  const late = records.filter((r) => r.status === 'late').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const excused = records.filter((r) => r.status === 'excused').length;
  const attended = present + late;
  const total = records.length || 1;
  return { percent: round1((attended / total) * 100), present, absent, late, excused };
}

export interface StudentIndex {
  knowledge: number;
  stability: number;
  progress: number;
  control: number;
  attendance?: number;
  index: number;
}

export function studentIndex(
  entries: GradeWithAssessment[],
  config: GradingConfig,
  attendance: AttendanceRecord[],
  behavior: BehaviorEvent[]
): StudentIndex {
  const avg = periodAverage(entries, config);
  const knowledge = avg.average;
  const stability = stabilityScore(entries);
  const progress = progressScore(entries).score;
  const control = avg.control || avg.final || avg.weekly;
  const w = config.indexWeights;

  let weightSum = w.knowledge + w.stability + w.progress + w.control;
  let index = (knowledge * w.knowledge + stability * w.stability + progress * w.progress + control * w.control) / weightSum;

  const att = attendancePercent(attendance);
  if (config.includeAttendanceInIndex) {
    const attWeight = 0.15;
    index = (index * weightSum + att.percent * attWeight) / (weightSum + attWeight);
    weightSum += attWeight;
  }
  if (config.includeBehaviorInIndex) {
    const positive = behavior.filter((b) => b.type === 'active' || b.type === 'good_work').length;
    const negative = behavior.length - positive;
    const behaviorScore = clampScore(70 + positive * 5 - negative * 4);
    const behWeight = 0.1;
    index = (index * weightSum + behaviorScore * behWeight) / (weightSum + behWeight);
  }

  return { knowledge: round1(knowledge), stability, progress, control: round1(control), attendance: att.percent, index: round1(index) };
}

export interface GroupStats {
  group: Group;
  average: number;
  max: number;
  min: number;
  median: number;
  studentCount: number;
  completionRate: number;
}

export function computeGroupStats(
  group: Group,
  groupStudents: Student[],
  grades: Grade[],
  assessments: Assessment[],
  config: GradingConfig
): GroupStats {
  const studentAverages = groupStudents.map((s) => {
    const entries = gradesForStudent(s.userId, grades, assessments);
    return periodAverage(entries, config).average;
  });
  const todayIso = new Date().toISOString().slice(0, 10);
  const dueAssessmentCount = assessments.filter((a) => a.groupId === group.id && a.administeredOn <= todayIso).length;
  const expectedGrades = dueAssessmentCount * groupStudents.length;
  const actualGrades = gradeCountByGroup(grades, assessments).get(group.id) ?? 0;

  return {
    group,
    average: round1(mean(studentAverages)),
    max: round1(Math.max(0, ...studentAverages)),
    min: round1(studentAverages.length ? Math.min(...studentAverages) : 0),
    median: round1(median(studentAverages)),
    studentCount: groupStudents.length,
    completionRate: expectedGrades ? round1((actualGrades / expectedGrades) * 100) : 100,
  };
}

export interface RankedStudent {
  studentId: string;
  average: number;
  rank: number;
}

export function rankStudents(studentIds: string[], averageOf: (id: string) => number): RankedStudent[] {
  return studentIds
    .map((studentId) => ({ studentId, average: averageOf(studentId) }))
    .sort((a, b) => b.average - a.average)
    .map((row, i) => ({ ...row, rank: i + 1 }));
}

export interface RankedGroup {
  groupId: string;
  average: number;
  rank: number;
}

export function rankGroups(stats: GroupStats[]): RankedGroup[] {
  return [...stats]
    .sort((a, b) => b.average - a.average)
    .map((s, i) => ({ groupId: s.group.id, average: s.average, rank: i + 1 }));
}
