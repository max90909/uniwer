import { useMemo, useState } from 'react';
import { useStore } from '../../data/store';
import { useSession } from '../../lib/session';
import { useI18n } from '../../i18n';
import { gradesForStudent, periodAverage } from '../../lib/formulas';
import { assessmentKey, formatDate, LOCALE_BY_LANG, pct } from '../../lib/format';
import { StatTile } from '../../components/StatTile';
import { useLabel } from '../../lib/label';

type Filter = 'all' | 'weekly' | 'control' | 'final';

export default function StudentResults() {
  const { data } = useStore();
  const { user } = useSession();
  const { t, lang } = useI18n();
  const label = useLabel();
  const [filter, setFilter] = useState<Filter>('all');
  if (!user) return null;
  const locale = LOCALE_BY_LANG[lang];

  const entries = useMemo(() => gradesForStudent(user.id, data.grades, data.assessments), [user.id, data.grades, data.assessments]);
  const avg = periodAverage(entries, data.gradingConfig);
  const filtered = filter === 'all' ? entries : entries.filter((e) => e.assessment.type === filter);
  const sorted = [...filtered].reverse();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('student.resultsTitle')}</h1>
          <p className="lede">{t('student.resultsSub')}</p>
        </div>
      </div>

      <div className="grid cols-4" style={{ marginBottom: 16 }}>
        <StatTile label={t('student.avgScore')} value={pct(avg.average)} />
        <StatTile label={t('student.weeklyTests')} value={pct(avg.weekly)} />
        <StatTile label={t('student.controlTests')} value={pct(avg.control)} />
        <StatTile label={t('student.finalTests')} value={pct(avg.final)} />
      </div>

      <div className="pill-row" style={{ marginBottom: 12 }}>
        {(['all', 'weekly', 'control', 'final'] as Filter[]).map((f) => (
          <button key={f} className={`btn${filter === f ? ' btn-selected' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? t('common.all') : t(assessmentKey(f))}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t('common.date')}</th>
              <th>{t('common.type')}</th>
              <th>{t('common.topic')}</th>
              <th className="num">{t('common.score')}</th>
              <th className="num">{t('common.percent')}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(({ grade, assessment }) => (
              <tr key={grade.id}>
                <td>{formatDate(assessment.administeredOn, locale)}</td>
                <td>{t(assessmentKey(assessment.type))}</td>
                <td>{label(data.topics.find((tp) => tp.id === assessment.topicId))}</td>
                <td className="num tabular">{grade.scoreCorrect} / {grade.scoreTotal}</td>
                <td className="num tabular">{pct(grade.scorePercent)}</td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-note">{t('student.noResultsFilter')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
