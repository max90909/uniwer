import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../../data/store';
import { useSession } from '../../lib/session';
import { useI18n } from '../../i18n';
import { assessmentKey, formatDate, LOCALE_BY_LANG } from '../../lib/format';
import { useLabel } from '../../lib/label';

export default function TeacherEnterGrades() {
  const { data, recordGrades } = useStore();
  const { user } = useSession();
  const { t, lang } = useI18n();
  const label = useLabel();
  const locale = LOCALE_BY_LANG[lang];
  const myGroupIds = data.teacherGroups.filter((tg) => tg.teacherId === user!.id).map((tg) => tg.groupId);
  const myGroups = data.groups.filter((g) => myGroupIds.includes(g.id));

  const [groupId, setGroupId] = useState(myGroups[0]?.id);
  const todayIso = new Date().toISOString().slice(0, 10);

  const groupWeeks = data.weeks;
  const defaultWeek = useMemo(() => {
    const dueOrNext = groupWeeks.find((w) => w.endDate >= todayIso) ?? groupWeeks[groupWeeks.length - 1];
    return dueOrNext?.id;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);
  const [weekId, setWeekId] = useState(defaultWeek);
  useEffect(() => setWeekId(defaultWeek), [defaultWeek]);

  const weekAssessments = data.assessments.filter((a) => a.groupId === groupId && a.weekId === weekId);
  const [assessmentId, setAssessmentId] = useState(weekAssessments[0]?.id);
  useEffect(() => setAssessmentId(weekAssessments[0]?.id), [groupId, weekId]);

  const assessment = data.assessments.find((a) => a.id === assessmentId);
  const roster = data.students.filter((s) => s.groupId === groupId).map((s) => data.allUsers.find((u) => u.id === s.userId)!);

  const [scores, setScores] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!assessment) return setScores({});
    const initial: Record<string, string> = {};
    roster.forEach((s) => {
      const g = data.grades.find((gr) => gr.assessmentId === assessment.id && gr.studentId === s.id);
      initial[s.id] = g ? String(g.scoreCorrect) : '';
    });
    setScores(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId]);

  const [savedAt, setSavedAt] = useState<string | null>(null);

  if (!assessment) {
    return (
      <div>
        <div className="page-header"><h1>{t('teacher.enterGradesTitle')}</h1></div>
        <p className="empty-note">{t('teacher.noAssessment')}</p>
      </div>
    );
  }

  const filledCount = Object.values(scores).filter((v) => v !== '').length;

  const handleSave = () => {
    const entries = roster
      .filter((s) => scores[s.id] !== '' && scores[s.id] !== undefined)
      .map((s) => ({ studentId: s.id, scoreCorrect: Math.max(0, Math.min(assessment.maxScore, Number(scores[s.id]))) }));
    recordGrades(assessment.id, entries, user!.id);
    setSavedAt(new Date().toLocaleTimeString(locale));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('teacher.enterGradesTitle')}</h1>
          <p className="lede">{t('teacher.enterGradesSub')}</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="grid cols-3">
          <div className="field">
            <label>{t('teacher.selectGroup')}</label>
            <select className="input" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
              {myGroups.map((g) => (
                <option key={g.id} value={g.id}>{label(g)}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>{t('teacher.selectWeek')}</label>
            <select className="input" value={weekId} onChange={(e) => setWeekId(e.target.value)}>
              {groupWeeks.map((w) => {
                const month = data.months.find((m) => m.id === w.monthId)!;
                return (
                  <option key={w.id} value={w.id}>
                    {t('common.month')} {month.index}, {t('common.week').toLowerCase()} {w.index} · {formatDate(w.endDate, locale)}
                  </option>
                );
              })}
            </select>
          </div>
          <div className="field">
            <label>{t('teacher.selectTest')}</label>
            <select className="input" value={assessmentId} onChange={(e) => setAssessmentId(e.target.value)}>
              {weekAssessments.map((a) => (
                <option key={a.id} value={a.id}>
                  {t(assessmentKey(a.type))}{a.topicId ? ` · ${label(data.topics.find((tp) => tp.id === a.topicId))}` : ''} ({a.maxScore})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ marginBottom: 0 }}>
            {t(assessmentKey(assessment.type))}
            {assessment.topicId ? ` · ${label(data.topics.find((tp) => tp.id === assessment.topicId))}` : ''} · {assessment.maxScore}
          </h3>
          <span className="mono" style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>{t('teacher.filled', { filled: filledCount, total: roster.length })}</span>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="num">#</th>
                <th>{t('common.student')}</th>
                <th className="num">{t('common.score')} ({assessment.maxScore})</th>
                <th className="num">%</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((s, i) => {
                const raw = scores[s.id] ?? '';
                const num = raw === '' ? null : Number(raw);
                const percent = num !== null ? Math.round((num / assessment.maxScore) * 1000) / 10 : null;
                return (
                  <tr key={s.id}>
                    <td className="num tabular">{i + 1}</td>
                    <td>{s.fullName}</td>
                    <td className="num">
                      <input
                        className="input score-input"
                        type="number"
                        min={0}
                        max={assessment.maxScore}
                        value={raw}
                        onChange={(e) => setScores((prev) => ({ ...prev, [s.id]: e.target.value }))}
                      />
                    </td>
                    <td className="num tabular">{percent !== null ? `${percent.toFixed(1)}%` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
          <button className="btn primary" onClick={handleSave}>{t('teacher.saveSheet')}</button>
          {savedAt && <span style={{ color: 'var(--positive)', fontSize: '0.85rem' }}>{t('common.savedAt', { time: savedAt })}</span>}
        </div>
      </div>
    </div>
  );
}
