import { useState } from 'react';
import { useStore } from '../../data/store';
import { useSession } from '../../lib/session';
import { useI18n } from '../../i18n';
import { computeGroupStats, gradesForStudent, periodAverage } from '../../lib/formulas';
import { LineChart } from '../../components/LineChart';
import { StatTile } from '../../components/StatTile';
import { pct } from '../../lib/format';

export default function TeacherStatistics() {
  const { data } = useStore();
  const { user } = useSession();
  const { t } = useI18n();
  const myGroupIds = data.teacherGroups.filter((tg) => tg.teacherId === user!.id).map((tg) => tg.groupId);
  const myGroups = data.groups.filter((g) => myGroupIds.includes(g.id));
  const [groupId, setGroupId] = useState(myGroups[0]?.id);
  const group = myGroups.find((g) => g.id === groupId)!;
  const groupStudents = data.students.filter((s) => s.groupId === groupId);

  const stats = computeGroupStats(group, groupStudents, data.grades, data.assessments, data.gradingConfig);

  const topicAverages = data.topics.map((topic) => {
    const percents: number[] = [];
    groupStudents.forEach((s) => {
      const entries = gradesForStudent(s.userId, data.grades, data.assessments).filter((e) => e.assessment.topicId === topic.id);
      if (entries.length) percents.push(entries[entries.length - 1].grade.scorePercent);
    });
    return { topic, average: percents.length ? percents.reduce((a, b) => a + b, 0) / percents.length : null };
  });

  const monthlyPoints = data.months
    .map((m) => {
      const monthWeeks = data.weeks.filter((w) => w.monthId === m.id);
      const from = monthWeeks[0]?.startDate;
      const to = monthWeeks[monthWeeks.length - 1]?.endDate;
      const percents = groupStudents
        .map((s) => {
          const entries = gradesForStudent(s.userId, data.grades, data.assessments).filter((e) => e.assessment.administeredOn >= from && e.assessment.administeredOn <= to);
          return entries.length ? periodAverage(entries, data.gradingConfig).average : null;
        })
        .filter((v): v is number => v !== null);
      if (!percents.length) return null;
      return { label: `${m.index}`, value: percents.reduce((a, b) => a + b, 0) / percents.length };
    })
    .filter(Boolean) as { label: string; value: number }[];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('teacher.statisticsTitle')}</h1>
          <p className="lede">{t('teacher.statisticsSub')}</p>
        </div>
      </div>

      <div className="pill-row" style={{ marginBottom: 14 }}>
        {myGroups.map((g) => (
          <button key={g.id} className={`btn${groupId === g.id ? ' btn-selected' : ''}`} onClick={() => setGroupId(g.id)}>
            {g.name}
          </button>
        ))}
      </div>

      <div className="grid cols-4" style={{ marginBottom: 16 }}>
        <StatTile label={t('teacher.avg')} value={pct(stats.average)} />
        <StatTile label={t('teacher.median')} value={pct(stats.median)} />
        <StatTile label={t('teacher.minMax')} value={`${stats.min.toFixed(0)}% / ${stats.max.toFixed(0)}%`} />
        <StatTile label={t('student.completion')} value={pct(stats.completionRate)} />
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h3>{t('teacher.monthlyDynamics')}</h3>
          <div className="chart-wrap">
            <LineChart points={monthlyPoints} />
          </div>
        </div>
        <div className="card">
          <h3>{t('teacher.avgByTopic')}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topicAverages.map(({ topic, average }) => (
              <div key={topic.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{topic.name}</span>
                <span className="mono tabular">{average !== null ? pct(average) : '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
