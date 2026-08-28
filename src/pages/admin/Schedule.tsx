import { useState } from 'react';
import { useStore } from '../../data/store';
import { useI18n } from '../../i18n';
import { assessmentKey } from '../../lib/format';
import { useLabel } from '../../lib/label';

export default function AdminSchedule() {
  const { data, rescheduleWeek } = useStore();
  const { t } = useI18n();
  const label = useLabel();
  const [drafts, setDrafts] = useState<Record<string, { start: string; end: string }>>({});
  const [savedId, setSavedId] = useState<string | null>(null);

  const draftFor = (weekId: string, start: string, end: string) => drafts[weekId] ?? { start, end };

  const handleSave = (weekId: string, start: string, end: string) => {
    rescheduleWeek(weekId, start, end);
    setSavedId(weekId);
    setTimeout(() => setSavedId((cur) => (cur === weekId ? null : cur)), 2000);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('admin.scheduleTitle')}</h1>
          <p className="lede">{t('admin.scheduleSub')}</p>
        </div>
      </div>

      {data.months.map((month) => (
        <div className="card" key={month.id} style={{ marginBottom: 14 }}>
          <h3>{t('common.month')} {month.index} · {label(month)}</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t('common.week')}</th>
                  <th>{t('common.type')}</th>
                  <th>{t('common.start')}</th>
                  <th>{t('common.end')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.weeks.filter((w) => w.monthId === month.id).map((w) => {
                  const draft = draftFor(w.id, w.startDate, w.endDate);
                  const weekAssessments = data.assessments.filter((a) => a.weekId === w.id);
                  const typeLabel = weekAssessments.map((a) => t(assessmentKey(a.type))).join(' + ');
                  return (
                    <tr key={w.id}>
                      <td>{t('common.week')} {w.index}</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>{typeLabel}</td>
                      <td>
                        <input
                          type="date"
                          className="input"
                          style={{ width: 150 }}
                          value={draft.start}
                          onChange={(e) => setDrafts((prev) => ({ ...prev, [w.id]: { start: e.target.value, end: draft.end } }))}
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          className="input"
                          style={{ width: 150 }}
                          value={draft.end}
                          onChange={(e) => setDrafts((prev) => ({ ...prev, [w.id]: { start: draft.start, end: e.target.value } }))}
                        />
                      </td>
                      <td>
                        <button className="btn" onClick={() => handleSave(w.id, draft.start, draft.end)}>
                          {savedId === w.id ? '✓' : t('admin.rescheduleBtn')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
