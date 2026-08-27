import { useStore } from '../../data/store';
import { useSession } from '../../lib/session';
import { useI18n } from '../../i18n';
import { attendancePercent } from '../../lib/formulas';
import { attendanceKey, behaviorKey, formatDate, LOCALE_BY_LANG, pct } from '../../lib/format';
import { BEHAVIOR_TONE } from '../../types';

export default function StudentAttendance() {
  const { data } = useStore();
  const { user } = useSession();
  const { t, lang } = useI18n();
  if (!user) return null;
  const locale = LOCALE_BY_LANG[lang];

  const records = [...data.attendance.filter((a) => a.studentId === user.id)].sort((a, b) => b.date.localeCompare(a.date));
  const stats = attendancePercent(records);
  const behavior = data.behaviorEvents.filter((b) => b.studentId === user.id && b.visibleToStudent).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('student.attendanceTitle')}</h1>
          <p className="lede">{t('student.attendanceSub2')}</p>
        </div>
      </div>

      <div className="grid cols-4" style={{ marginBottom: 16 }}>
        <div className="card stat-tile"><span className="label">{t('student.attendanceLabel')}</span><span className="value tabular">{pct(stats.percent)}</span></div>
        <div className="card stat-tile"><span className="label">{t('attendance.present')}</span><span className="value tabular">{stats.present}</span></div>
        <div className="card stat-tile"><span className="label">{t('attendance.late')}</span><span className="value tabular">{stats.late}</span></div>
        <div className="card stat-tile"><span className="label">{t('attendance.absent')}</span><span className="value tabular">{stats.absent}</span></div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h3>{t('student.weeklyHistory')}</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>{t('common.date')}</th><th>{t('common.status')}</th></tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td>{formatDate(r.date, locale)}</td>
                    <td>
                      <span className={`badge ${r.status === 'present' ? 'positive' : r.status === 'absent' ? 'negative' : 'warning'}`}>
                        {t(attendanceKey(r.status))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>{t('student.behaviorJournal')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {behavior.map((b) => (
              <div key={b.id} style={{ borderBottom: '1px solid var(--line)', paddingBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className={`badge ${BEHAVIOR_TONE[b.type]}`}>{t(behaviorKey(b.type))}</span>
                  <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--faint)' }}>{formatDate(b.date, locale)}</span>
                </div>
                <p style={{ margin: '6px 0 0', fontSize: '0.86rem', color: 'var(--muted)' }}>{b.comment}</p>
              </div>
            ))}
            {behavior.length === 0 && <p className="empty-note">{t('student.noRecords')}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
