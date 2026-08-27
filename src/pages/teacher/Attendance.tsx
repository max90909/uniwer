import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../../data/store';
import { useSession } from '../../lib/session';
import { useI18n } from '../../i18n';
import type { AttendanceStatus } from '../../types';
import { attendanceKey, formatDate, LOCALE_BY_LANG } from '../../lib/format';

const STATUSES: AttendanceStatus[] = ['present', 'late', 'absent', 'excused'];

export default function TeacherAttendance() {
  const { data, markAttendance } = useStore();
  const { user } = useSession();
  const { t, lang } = useI18n();
  const locale = LOCALE_BY_LANG[lang];
  const myGroupIds = data.teacherGroups.filter((tg) => tg.teacherId === user!.id).map((tg) => tg.groupId);
  const myGroups = data.groups.filter((g) => myGroupIds.includes(g.id));

  const [groupId, setGroupId] = useState(myGroups[0]?.id);
  const todayIso = new Date().toISOString().slice(0, 10);
  const defaultWeek = useMemo(() => data.weeks.find((w) => w.endDate >= todayIso)?.id ?? data.weeks[data.weeks.length - 1]?.id, []);
  const [weekId, setWeekId] = useState(defaultWeek);
  const week = data.weeks.find((w) => w.id === weekId)!;

  const roster = data.students.filter((s) => s.groupId === groupId).map((s) => data.allUsers.find((u) => u.id === s.userId)!);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});

  useEffect(() => {
    const initial: Record<string, AttendanceStatus> = {};
    roster.forEach((s) => {
      const rec = data.attendance.find((a) => a.groupId === groupId && a.date === week.endDate && a.studentId === s.id);
      initial[s.id] = rec?.status ?? 'present';
    });
    setStatuses(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId, weekId]);

  const [savedAt, setSavedAt] = useState<string | null>(null);
  const handleSave = () => {
    markAttendance(groupId, week.endDate, statuses, user!.id);
    setSavedAt(new Date().toLocaleTimeString(locale));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('teacher.attendanceTitle')}</h1>
          <p className="lede">{t('teacher.attendanceSub')}</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="grid cols-2">
          <div className="field">
            <label>{t('teacher.selectGroup')}</label>
            <select className="input" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
              {myGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label>{t('teacher.selectWeek')}</label>
            <select className="input" value={weekId} onChange={(e) => setWeekId(e.target.value)}>
              {data.weeks.map((w) => {
                const month = data.months.find((m) => m.id === w.monthId)!;
                return <option key={w.id} value={w.id}>{t('common.month')} {month.index}, {t('common.week').toLowerCase()} {w.index} · {formatDate(w.endDate, locale)}</option>;
              })}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead><tr><th className="num">#</th><th>{t('common.student')}</th><th>{t('common.status')}</th></tr></thead>
            <tbody>
              {roster.map((s, i) => (
                <tr key={s.id}>
                  <td className="num tabular">{i + 1}</td>
                  <td>{s.fullName}</td>
                  <td>
                    <select className="input" style={{ width: 200 }} value={statuses[s.id] ?? 'present'} onChange={(e) => setStatuses((prev) => ({ ...prev, [s.id]: e.target.value as AttendanceStatus }))}>
                      {STATUSES.map((st) => <option key={st} value={st}>{t(attendanceKey(st))}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
          <button className="btn primary" onClick={handleSave}>{t('teacher.saveAttendance')}</button>
          {savedAt && <span style={{ color: 'var(--positive)', fontSize: '0.85rem' }}>{t('common.savedAt', { time: savedAt })}</span>}
        </div>
      </div>
    </div>
  );
}
