import { Link } from 'react-router-dom';
import { useStore } from '../../data/store';
import { useSession } from '../../lib/session';
import { useI18n } from '../../i18n';
import { computeGroupStats } from '../../lib/formulas';
import { StatTile } from '../../components/StatTile';
import { pct } from '../../lib/format';

export default function TeacherDashboard() {
  const { data } = useStore();
  const { user } = useSession();
  const { t } = useI18n();
  if (!user) return null;

  const myGroupIds = data.teacherGroups.filter((tg) => tg.teacherId === user.id).map((tg) => tg.groupId);
  const myGroups = data.groups.filter((g) => myGroupIds.includes(g.id));
  const totalStudents = data.students.filter((s) => myGroupIds.includes(s.groupId)).length;

  const stats = myGroups.map((g) => computeGroupStats(g, data.students.filter((s) => s.groupId === g.id), data.grades, data.assessments, data.gradingConfig));
  const avgAll = stats.length ? stats.reduce((s, g) => s + g.average, 0) / stats.length : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('student.greeting', { name: user.fullName.split(' ')[0] })}</h1>
          <p className="lede">{t('teacher.groupsCount', { count: myGroups.length, students: totalStudents })}</p>
        </div>
        <Link to="/teacher/grades" className="btn primary">{t('teacher.enterGradesBtn')}</Link>
      </div>

      <div className="grid cols-3" style={{ marginBottom: 16 }}>
        <StatTile label={t('teacher.avgByGroups')} value={pct(avgAll)} />
        <StatTile label={t('teacher.totalStudents')} value={String(totalStudents)} />
        <StatTile label={t('teacher.groupsInCharge')} value={String(myGroups.length)} />
      </div>

      <div className="grid cols-3">
        {stats.map((s) => (
          <div className="card" key={s.group.id}>
            <h3>{s.group.name}</h3>
            <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 6 }}>
              <dt>{t('teacher.avg')}</dt><dd className="mono tabular" style={{ margin: 0 }}>{pct(s.average)}</dd>
              <dt>{t('teacher.median')}</dt><dd className="mono tabular" style={{ margin: 0 }}>{pct(s.median)}</dd>
              <dt>{t('teacher.minMax')}</dt><dd className="mono tabular" style={{ margin: 0 }}>{s.min.toFixed(0)}% / {s.max.toFixed(0)}%</dd>
              <dt>{t('student.completion')}</dt><dd className="mono tabular" style={{ margin: 0 }}>{pct(s.completionRate)}</dd>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
