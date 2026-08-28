import { useState } from 'react';
import { useStore } from '../../data/store';
import { useSession } from '../../lib/session';
import { useI18n } from '../../i18n';
import type { BehaviorType } from '../../types';
import { BEHAVIOR_TONE } from '../../types';
import { behaviorKey, formatDate, LOCALE_BY_LANG } from '../../lib/format';
import { useLabel } from '../../lib/label';

const TYPES = Object.keys(BEHAVIOR_TONE) as BehaviorType[];

export default function TeacherBehavior() {
  const { data, addBehaviorEvent } = useStore();
  const { user } = useSession();
  const { t, lang } = useI18n();
  const label = useLabel();
  const locale = LOCALE_BY_LANG[lang];
  const myGroupIds = data.teacherGroups.filter((tg) => tg.teacherId === user!.id).map((tg) => tg.groupId);
  const myGroups = data.groups.filter((g) => myGroupIds.includes(g.id));

  const [groupId, setGroupId] = useState(myGroups[0]?.id);
  const roster = data.students.filter((s) => s.groupId === groupId).map((s) => data.allUsers.find((u) => u.id === s.userId)!);
  const [studentId, setStudentId] = useState(roster[0]?.id);
  const [type, setType] = useState<BehaviorType>('active');
  const [comment, setComment] = useState('');

  const events = data.behaviorEvents
    .filter((e) => roster.some((r) => r.id === e.studentId))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 20);

  const handleAdd = () => {
    if (!studentId) return;
    addBehaviorEvent(studentId, type, comment || t(behaviorKey(type)), user!.id, new Date().toISOString().slice(0, 10));
    setComment('');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('teacher.behaviorTitle')}</h1>
          <p className="lede">{t('teacher.behaviorSub')}</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="grid cols-3" style={{ marginBottom: 12 }}>
          <div className="field">
            <label>{t('teacher.selectGroup')}</label>
            <select className="input" value={groupId} onChange={(e) => { setGroupId(e.target.value); setStudentId(undefined as any); }}>
              {myGroups.map((g) => <option key={g.id} value={g.id}>{label(g)}</option>)}
            </select>
          </div>
          <div className="field">
            <label>{t('common.student')}</label>
            <select className="input" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              {roster.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
            </select>
          </div>
          <div className="field">
            <label>{t('teacher.eventType')}</label>
            <select className="input" value={type} onChange={(e) => setType(e.target.value as BehaviorType)}>
              {TYPES.map((tp) => <option key={tp} value={tp}>{t(behaviorKey(tp))}</option>)}
            </select>
          </div>
        </div>
        <div className="field">
          <label>{t('teacher.comment')}</label>
          <input className="input" value={comment} onChange={(e) => setComment(e.target.value)} />
        </div>
        <button className="btn primary" style={{ marginTop: 12 }} onClick={handleAdd}>{t('teacher.addRecord')}</button>
      </div>

      <div className="card">
        <h3>{t('teacher.recentRecords')}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {events.map((e) => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--line)', paddingBottom: 8 }}>
              <div>
                <span className={`badge ${BEHAVIOR_TONE[e.type]}`}>{t(behaviorKey(e.type))}</span>
                <span style={{ marginLeft: 10, fontSize: '0.85rem' }}>{data.allUsers.find((u) => u.id === e.studentId)?.fullName}</span>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: 'var(--muted)' }}>{e.comment}</p>
              </div>
              <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--faint)', whiteSpace: 'nowrap' }}>{formatDate(e.date, locale)}</span>
            </div>
          ))}
          {events.length === 0 && <p className="empty-note">{t('student.noRecords')}</p>}
        </div>
      </div>
    </div>
  );
}
