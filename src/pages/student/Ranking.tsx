import { useStore } from '../../data/store';
import { useSession } from '../../lib/session';
import { useI18n } from '../../i18n';
import { computeGroupStats, gradesForStudent, periodAverage, rankGroups, rankStudents } from '../../lib/formulas';
import { StatTile } from '../../components/StatTile';
import { pct } from '../../lib/format';

export default function StudentRanking() {
  const { data } = useStore();
  const { user } = useSession();
  const { t } = useI18n();
  if (!user) return null;

  const student = data.students.find((s) => s.userId === user.id)!;
  const group = data.groups.find((g) => g.id === student.groupId)!;
  const groupStudentIds = data.students.filter((s) => s.groupId === group.id).map((s) => s.userId);
  const allStudentIds = data.students.map((s) => s.userId);

  const avgOf = (id: string) => periodAverage(gradesForStudent(id, data.grades, data.assessments), data.gradingConfig).average;

  const inGroup = rankStudents(groupStudentIds, avgOf);
  const overall = rankStudents(allStudentIds, avgOf);
  const myInGroup = inGroup.find((r) => r.studentId === user.id)!;
  const myOverall = overall.find((r) => r.studentId === user.id)!;

  const groupStats = data.groups.map((g) => computeGroupStats(g, data.students.filter((s) => s.groupId === g.id), data.grades, data.assessments, data.gradingConfig));
  const groupRanking = rankGroups(groupStats);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('student.rankingTitle')}</h1>
          <p className="lede">{t('student.rankingSub')}</p>
        </div>
      </div>

      <div className="grid cols-3" style={{ marginBottom: 16 }}>
        <StatTile label={t('student.myResult')} value={pct(myInGroup.average)} />
        <StatTile label={t('student.rankInGroup')} value={`${myInGroup.rank} / ${groupStudentIds.length}`} />
        <StatTile label={t('student.rankOverall')} value={`${myOverall.rank} / ${allStudentIds.length}`} />
      </div>

      <div className="card">
        <h3>{t('student.groupRanking')}</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th className="num">#</th>
                <th>{t('common.group')}</th>
                <th className="num">{t('student.avgScore')}</th>
                <th className="num">{t('student.completion')}</th>
              </tr>
            </thead>
            <tbody>
              {groupRanking.map((r) => {
                const stats = groupStats.find((s) => s.group.id === r.groupId)!;
                const isMine = r.groupId === group.id;
                return (
                  <tr key={r.groupId} style={isMine ? { background: 'var(--accent-soft)' } : undefined}>
                    <td className="num tabular">{r.rank}</td>
                    <td>{stats.group.name}{isMine ? t('student.myGroupTag') : ''}</td>
                    <td className="num tabular">{pct(r.average)}</td>
                    <td className="num tabular">{pct(stats.completionRate)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
