import { useState } from 'react';
import { useStore } from '../../data/store';
import { useSession } from '../../lib/session';
import { useI18n } from '../../i18n';
import { computeGroupStats, gradesForStudent, periodAverage, rankGroups, rankStudents } from '../../lib/formulas';
import { pct } from '../../lib/format';

export default function TeacherRankings() {
  const { data } = useStore();
  const { user } = useSession();
  const { t } = useI18n();
  const myGroupIds = data.teacherGroups.filter((tg) => tg.teacherId === user!.id).map((tg) => tg.groupId);
  const myGroups = data.groups.filter((g) => myGroupIds.includes(g.id));
  const [groupId, setGroupId] = useState(myGroups[0]?.id);

  const groupStudentIds = data.students.filter((s) => s.groupId === groupId).map((s) => s.userId);
  const avgOf = (id: string) => periodAverage(gradesForStudent(id, data.grades, data.assessments), data.gradingConfig).average;
  const ranking = rankStudents(groupStudentIds, avgOf);

  const allStats = data.groups.map((g) => computeGroupStats(g, data.students.filter((s) => s.groupId === g.id), data.grades, data.assessments, data.gradingConfig));
  const groupRanking = rankGroups(allStats);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('teacher.rankingsTitle')}</h1>
          <p className="lede">{t('teacher.rankingsSub')}</p>
        </div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <div className="pill-row" style={{ marginBottom: 12 }}>
            {myGroups.map((g) => (
              <button key={g.id} className={`btn${groupId === g.id ? ' btn-selected' : ''}`} onClick={() => setGroupId(g.id)}>
                {g.name}
              </button>
            ))}
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th className="num">#</th><th>{t('common.student')}</th><th className="num">{t('common.score')}</th></tr></thead>
              <tbody>
                {ranking.map((r) => (
                  <tr key={r.studentId}>
                    <td className="num tabular">{r.rank}</td>
                    <td>{data.allUsers.find((u) => u.id === r.studentId)?.fullName}</td>
                    <td className="num tabular">{pct(r.average)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3>{t('teacher.groupRankingTitle')}</h3>
          <div className="table-wrap">
            <table>
              <thead><tr><th className="num">#</th><th>{t('common.group')}</th><th className="num">{t('teacher.avg')}</th></tr></thead>
              <tbody>
                {groupRanking.map((r) => {
                  const stats = allStats.find((s) => s.group.id === r.groupId)!;
                  return (
                    <tr key={r.groupId} style={myGroupIds.includes(r.groupId) ? { background: 'var(--accent-soft)' } : undefined}>
                      <td className="num tabular">{r.rank}</td>
                      <td>{stats.group.name}</td>
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
