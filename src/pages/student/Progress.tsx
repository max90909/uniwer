import { useMemo } from 'react';
import { useStore } from '../../data/store';
import { useSession } from '../../lib/session';
import { useI18n } from '../../i18n';
import { gradesForStudent, periodAverage, progressScore } from '../../lib/formulas';
import { LineChart } from '../../components/LineChart';
import { StatTile } from '../../components/StatTile';
import { ScoreGauge } from '../../components/ScoreGauge';
import { ProgressBar } from '../../components/ProgressBar';
import { BandLegend } from '../../components/BandLegend';
import { Item, Stagger } from '../../components/Reveal';
import { pct, signedPct } from '../../lib/format';

export default function StudentProgress() {
  const { data } = useStore();
  const { user } = useSession();
  const { t } = useI18n();
  if (!user) return null;

  const entries = useMemo(() => gradesForStudent(user.id, data.grades, data.assessments), [user.id, data.grades, data.assessments]);
  const progress = progressScore(entries);

  const monthlyPoints = data.months
    .map((month) => {
      const monthWeeks = data.weeks.filter((w) => w.monthId === month.id);
      if (monthWeeks.length === 0) return null;
      const from = monthWeeks[0].startDate;
      const to = monthWeeks[monthWeeks.length - 1].endDate;
      const scoped = entries.filter((e) => e.assessment.administeredOn >= from && e.assessment.administeredOn <= to);
      if (scoped.length === 0) return null;
      const avg = periodAverage(scoped, data.gradingConfig);
      return { label: `${month.index}`, value: avg.average, best: Math.max(...scoped.map((e) => e.grade.scorePercent)), worst: Math.min(...scoped.map((e) => e.grade.scorePercent)) };
    })
    .filter(Boolean) as { label: string; value: number; best: number; worst: number }[];

  const best = monthlyPoints.length ? Math.max(...monthlyPoints.map((p) => p.best)) : 0;
  const worst = monthlyPoints.length ? Math.min(...monthlyPoints.map((p) => p.worst)) : 0;

  return (
    <div>
      <div className="card hero-card" style={{ marginBottom: 16 }}>
        <ScoreGauge value={progress.current} label={t('student.currentResultLabel')} delta={progress.delta} size={200} />
        <div className="hero-text">
          <h1>{t('student.progressTitle')}</h1>
          <p className="lede">{t('student.progressSub')}</p>
          <div className="hero-meta">
            <span className="item">
              <span className="k">{t('student.startResult')}</span>
              <span className="v">{pct(progress.start)}</span>
            </span>
            <span className="item">
              <span className="k">{t('student.progress')}</span>
              <span className="v" style={{ color: progress.delta >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                {signedPct(progress.delta)}
              </span>
            </span>
          </div>
          <BandLegend />
        </div>
      </div>

      <Stagger className="grid cols-3" style={{ marginBottom: 16 }}>
        <Item><StatTile label={t('student.startResult')} value={pct(progress.start)} /></Item>
        <Item>
          <StatTile
            label={t('student.progress')}
            value={signedPct(progress.delta)}
            tone={progress.delta >= 0 ? 'positive' : 'negative'}
          />
        </Item>
        <Item><StatTile label={t('student.bestWorst')} value={`${best.toFixed(0)}% / ${worst.toFixed(0)}%`} /></Item>
      </Stagger>

      <div className="card" style={{ marginBottom: 16 }}>
        <h3>{t('student.monthlyChart')}</h3>
        <div className="chart-wrap">
          <LineChart points={monthlyPoints.map((p) => ({ label: p.label, value: p.value }))} />
        </div>
      </div>

      {monthlyPoints.length > 0 && (
        <div className="card">
          <h3>{t('student.monthlyBreakdown')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 12 }}>
            {monthlyPoints.map((p) => (
              <ProgressBar key={p.label} value={p.value} label={p.label} showValue ticks />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
