// Слой данных приложения. На этом этапе — demo-хранилище поверх seed.ts, сохраняемое в localStorage
// браузера (это обычное React-приложение, запускается локально через `npm run dev` — localStorage здесь
// абсолютно уместен, в отличие от превью в чате). Когда будет готов реальный Supabase-проект,
// этот файл — единственное место, которое нужно заменить: весь остальной код работает через
// хук useStore() и типы из types.ts, не зная, откуда на самом деле берутся данные.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { buildSeed, SEED_VERSION, type SeedBundle } from './seed';
import type { AttendanceStatus, BehaviorEvent, BehaviorType, Book, Grade, GradingConfig, Group, Student } from '../types';

const STORAGE_KEY = 'vedomost-demo-v1';

/** В снимок кладётся версия сидов, чтобы устаревшие данные не жили вечно. */
interface StoredSnapshot {
  version: number;
  data: SeedBundle;
}

function loadInitial(): SeedBundle {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredSnapshot>;
      // Снимок старой версии (или вовсе без неё) выбрасываем: иначе правки
      // сидов не доходят до тех, кто уже открывал стенд.
      if (parsed?.version === SEED_VERSION && parsed.data) return parsed.data;
    }
  } catch {
    // повреждённые данные в localStorage — просто пересоздаём демо-набор
  }
  return buildSeed();
}

interface StoreApi {
  data: SeedBundle;
  recordGrades: (assessmentId: string, entries: { studentId: string; scoreCorrect: number }[], actorId: string) => void;
  markAttendance: (groupId: string, date: string, statuses: Record<string, AttendanceStatus>, actorId: string) => void;
  addBehaviorEvent: (studentId: string, type: BehaviorType, comment: string, actorId: string, date: string) => void;
  updateGradingConfig: (patch: Partial<Omit<GradingConfig, 'indexWeights'>> & { indexWeights?: Partial<GradingConfig['indexWeights']> }) => void;
  addBook: (weekId: string, book: Omit<Book, 'id' | 'weekId'>) => void;
  addGroup: (name: string) => Group;
  addStudents: (groupId: string, fullNames: string[]) => void;
  rescheduleWeek: (weekId: string, startDate: string, endDate: string) => void;
  resetDemoData: () => void;
}

const StoreContext = createContext<StoreApi | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<SeedBundle>(loadInitial);

  useEffect(() => {
    try {
      const snapshot: StoredSnapshot = { version: SEED_VERSION, data };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // тихо игнорируем — например, приватный режим браузера без доступа к localStorage
    }
  }, [data]);

  const recordGrades = useCallback<StoreApi['recordGrades']>((assessmentId, entries, actorId) => {
    setData((prev) => {
      const assessment = prev.assessments.find((a) => a.id === assessmentId);
      if (!assessment) return prev;
      const now = new Date().toISOString();
      const nextGrades: Grade[] = [...prev.grades];

      entries.forEach(({ studentId, scoreCorrect }) => {
        const scorePercent = Math.round((scoreCorrect / assessment.maxScore) * 1000) / 10;
        const existingIdx = nextGrades.findIndex((g) => g.assessmentId === assessmentId && g.studentId === studentId);
        if (existingIdx >= 0) {
          nextGrades[existingIdx] = {
            ...nextGrades[existingIdx],
            scoreCorrect,
            scorePercent,
            updatedAt: now,
          };
        } else {
          nextGrades.push({
            id: `grade-${assessmentId}-${studentId}`,
            assessmentId,
            studentId,
            scoreCorrect,
            scoreTotal: assessment.maxScore,
            scorePercent,
            enteredBy: actorId,
            enteredAt: now,
            updatedAt: now,
          });
        }
      });

      return { ...prev, grades: nextGrades };
    });
  }, []);

  const markAttendance = useCallback<StoreApi['markAttendance']>((groupId, date, statuses, actorId) => {
    setData((prev) => {
      const next = [...prev.attendance];
      Object.entries(statuses).forEach(([studentId, status]) => {
        const idx = next.findIndex((r) => r.groupId === groupId && r.date === date && r.studentId === studentId);
        if (idx >= 0) {
          next[idx] = { ...next[idx], status, markedBy: actorId };
        } else {
          next.push({ id: `attendance-manual-${groupId}-${date}-${studentId}`, studentId, groupId, date, status, markedBy: actorId });
        }
      });
      return { ...prev, attendance: next };
    });
  }, []);

  const addBehaviorEvent = useCallback<StoreApi['addBehaviorEvent']>((studentId, type, comment, actorId, date) => {
    setData((prev) => {
      const event: BehaviorEvent = {
        id: `behavior-manual-${Date.now()}-${studentId}`,
        studentId,
        date,
        type,
        comment,
        createdBy: actorId,
        visibleToStudent: true,
      };
      return { ...prev, behaviorEvents: [event, ...prev.behaviorEvents] };
    });
  }, []);

  const updateGradingConfig = useCallback<StoreApi['updateGradingConfig']>((patch) => {
    setData((prev) => ({
      ...prev,
      gradingConfig: {
        ...prev.gradingConfig,
        ...patch,
        indexWeights: { ...prev.gradingConfig.indexWeights, ...(patch.indexWeights ?? {}) },
      },
    }));
  }, []);

  const addBook = useCallback<StoreApi['addBook']>((weekId, book) => {
    setData((prev) => ({
      ...prev,
      books: [...prev.books, { ...book, id: `book-manual-${Date.now()}`, weekId }],
    }));
  }, []);

  const addGroup = useCallback<StoreApi['addGroup']>((name) => {
    const newGroup: Group = { id: `group-manual-${Date.now()}`, courseId: data.course.id, name };
    setData((prev) => ({ ...prev, groups: [...prev.groups, newGroup] }));
    return newGroup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.course.id]);

  const addStudents = useCallback<StoreApi['addStudents']>((groupId, fullNames) => {
    setData((prev) => {
      const startIndex = prev.students.length + 1;
      const newUsers = fullNames.map((fullName, i) => {
        const seq = startIndex + i;
        const id = `user-student-manual-${Date.now()}-${seq}`;
        return {
          id,
          email: `student${seq}@vedomost.demo`,
          fullName,
          role: 'student' as const,
          isActive: true,
        };
      });
      const newStudents: Student[] = newUsers.map((u, i) => ({
        userId: u.id,
        groupId,
        studentCode: `ST-${String(startIndex + i).padStart(4, '0')}`,
        enrolledAt: new Date().toISOString().slice(0, 10),
      }));
      return {
        ...prev,
        allUsers: [...prev.allUsers, ...newUsers],
        studentUsers: [...prev.studentUsers, ...newUsers],
        students: [...prev.students, ...newStudents],
      };
    });
  }, []);

  const rescheduleWeek = useCallback<StoreApi['rescheduleWeek']>((weekId, startDate, endDate) => {
    setData((prev) => ({
      ...prev,
      weeks: prev.weeks.map((w) => (w.id === weekId ? { ...w, startDate, endDate } : w)),
      assessments: prev.assessments.map((a) => (a.weekId === weekId ? { ...a, administeredOn: endDate } : a)),
      books: prev.books.map((b) => (b.weekId === weekId ? { ...b, dueDate: endDate } : b)),
      materials: prev.materials.map((m) => (m.weekId === weekId ? { ...m, publishedAt: startDate } : m)),
    }));
  }, []);

  const resetDemoData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setData(buildSeed());
  }, []);

  const value = useMemo<StoreApi>(
    () => ({ data, recordGrades, markAttendance, addBehaviorEvent, updateGradingConfig, addBook, addGroup, addStudents, rescheduleWeek, resetDemoData }),
    [data, recordGrades, markAttendance, addBehaviorEvent, updateGradingConfig, addBook, addGroup, addStudents, rescheduleWeek, resetDemoData]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore должен вызываться внутри <StoreProvider>');
  return ctx;
}
