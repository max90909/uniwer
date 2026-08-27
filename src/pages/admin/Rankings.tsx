import { useStore } from '../../data/store';
import { useI18n } from '../../i18n';
import { computeGroupStats, gradesForStudent, periodAverage, rankGroups, rankStudents } from '../../lib/formulas';
import { pct } from '../../lib/format';

export default function AdminRankings() {
  const { data } = useStore();
  const { t } = useI18n();
  const stats = data.groups.map((g) => computeGroupStats(g, data.students.filter((s) => s.groupId === g.id), data.grades, data.assessments, data.gradingConfig));
  const groupRanking = rankGroups(stats);

  const avgOf = (id: string) => periodAverage(gradesForStudent(id, data.grades, data.assessments), data.gradingConfig).average;
  const allStudentIds = data.students.map((s) => s.userId);
  const topStudents = rankStudents(allStudentIds, avgOf).slice(0, 10);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('admin.rankingGroupsTitle')}</h1>
          <p className="lede">{t('admin.rankingGroupsSub')}</p>
        </div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h3>{t('nav.groups')}</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th className="num">#</th><th>{t('common.group')}</th><th className="num">{t('teacher.avg')}</th><th className="num">{t('teacher.median')}</th><th className="num">{t('teacher.minMax')}</th><th className="num">{t('student.completion')}</th></tr></thead>
              <tbody>
                {groupRanking.map((r) => {
                  const s = stats.find((st) => st.group.id === r.groupId)!;
                  return (
                    <tr key={r.groupId}>
                      <td className="num tabular">{r.rank}</td>
                      <td>{s.group.name}</td>
                      <td className="num tabular">{pct(s.average)}</td>
                      <td className="num tabular">{pct(s.median)}</td>
                      <td className="num tabular">{s.min.toFixed(0)}/{s.max.toFixed(0)}%</td>
                      <td className="num tabular">{pct(s.completionRate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>{t('admin.topStudents')}</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th className="num">#</th><th>{t('common.student')}</th><th>{t('common.group')}</th><th className="num">{t('common.score')}</th></tr></thead>
              <tbody>
                {topStudents.map((r) => {
                  const student = data.students.find((s) => s.userId === r.studentId)!;
                  const group = data.groups.find((g) => g.id === student.groupId)!;
                  const user = data.allUsers.find((u) => u.id === r.studentId)!;
                  return (
                    <tr key={r.studentId}>
                      <td className="num tabular">{r.rank}</td>
                      <td>{user.fullName}</td>
                      <td>{group.name}</td>
                      <td className="num tabular">{pct(r.average)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
