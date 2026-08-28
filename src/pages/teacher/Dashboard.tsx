import { Link } from 'react-router-dom';
import { useStore } from '../../data/store';
import { useSession } from '../../lib/session';
import { useI18n } from '../../i18n';
import { computeGroupStats } from '../../lib/formulas';
import { StatTile } from '../../components/StatTile';
import { ScoreGauge } from '../../components/ScoreGauge';
import { ProgressBar } from '../../components/ProgressBar';
import { BandLegend } from '../../components/BandLegend';
import { Item, Stagger } from '../../components/Reveal';
import { pct } from '../../lib/format';
import { useLabel } from '../../lib/label';

export default function TeacherDashboard() {
  const { data } = useStore();
  const { user } = useSession();
  const { t } = useI18n();
  const label = useLabel();
  if (!user) return null;

  const myGroupIds = data.teacherGroups.filter((tg) => tg.teacherId === user.id).map((tg) => tg.groupId);
  const myGroups = data.groups.filter((g) => myGroupIds.includes(g.id));
  const totalStudents = data.students.filter((s) => myGroupIds.includes(s.groupId)).length;

  const stats = myGroups.map((g) => computeGroupStats(g, data.students.filter((s) => s.groupId === g.id), data.grades, data.assessments, data.gradingConfig));
  const avgAll = stats.length ? stats.reduce((s, g) => s + g.average, 0) / stats.length : 0;

  return (
    <div>
      <div className="card hero-card" style={{ marginBottom: 16 }}>
        <ScoreGauge value={avgAll} label={t('teacher.avgByGroups')} size={200} />
        <div className="hero-text">
          <h1>{t('student.greeting', { name: user.fullName.split(' ')[0] })}</h1>
          <p className="lede">{t('teacher.groupsCount', { count: myGroups.length, students: totalStudents })}</p>
          <div className="hero-meta">
            <span className="item">
              <span className="k">{t('teacher.totalStudents')}</span>
              <span className="v tabular">{totalStudents}</span>
            </span>
            <span className="item">
              <span className="k">{t('teacher.groupsInCharge')}</span>
              <span className="v tabular">{myGroups.length}</span>
            </span>
          </div>
          <BandLegend />
        </div>
        <Link to="/teacher/grades" className="btn primary lg">{t('teacher.enterGradesBtn')}</Link>
      </div>

      <Stagger className="grid cols-2" style={{ marginBottom: 16 }}>
        <Item><StatTile label={t('teacher.totalStudents')} value={String(totalStudents)} /></Item>
        <Item><StatTile label={t('teacher.groupsInCharge')} value={String(myGroups.length)} /></Item>
      </Stagger>

      <Stagger className="grid cols-3">
        {stats.map((s) => (
          <Item key={s.group.id}>
            <div className="card" style={{ height: '100%' }}>
              <h3>{label(s.group)}</h3>
              <div style={{ margin: '14px 0 16px' }}>
                <ProgressBar value={s.average} label={t('teacher.avg')} showValue ticks />
              </div>
              <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 6, fontSize: '0.86rem' }}>
                <dt style={{ color: 'var(--muted)' }}>{t('teacher.median')}</dt>
                <dd className="mono tabular" style={{ margin: 0 }}>{pct(s.median)}</dd>
                <dt style={{ color: 'var(--muted)' }}>{t('teacher.minMax')}</dt>
                <dd className="mono tabular" style={{ margin: 0 }}>{s.min.toFixed(0)}% / {s.max.toFixed(0)}%</dd>
                <dt style={{ color: 'var(--muted)' }}>{t('student.completion')}</dt>
                <dd className="mono tabular" style={{ margin: 0 }}>{pct(s.completionRate)}</dd>
              </dl>
            </div>
          </Item>
        ))}
      </Stagger>
    </div>
  );
}
