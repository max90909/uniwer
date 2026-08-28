import { useState } from 'react';
import { useStore } from '../../data/store';
import { useSession } from '../../lib/session';
import { useI18n } from '../../i18n';
import { attendancePercent, gradesForStudent, periodAverage } from '../../lib/formulas';
import { pct } from '../../lib/format';
import { useLabel } from '../../lib/label';

export default function TeacherGroups() {
  const { data } = useStore();
  const { user } = useSession();
  const { t } = useI18n();
  const label = useLabel();
  const myGroupIds = data.teacherGroups.filter((tg) => tg.teacherId === user!.id).map((tg) => tg.groupId);
  const myGroups = data.groups.filter((g) => myGroupIds.includes(g.id));
  const [activeGroupId, setActiveGroupId] = useState(myGroups[0]?.id);
  const activeGroup = myGroups.find((g) => g.id === activeGroupId) ?? myGroups[0];

  const roster = data.students
    .filter((s) => s.groupId === activeGroup?.id)
    .map((s) => {
      const u = data.allUsers.find((au) => au.id === s.userId)!;
      const entries = gradesForStudent(s.userId, data.grades, data.assessments);
      const avg = periodAverage(entries, data.gradingConfig);
      const att = attendancePercent(data.attendance.filter((a) => a.studentId === s.userId));
      return { student: s, user: u, avg: avg.average, attendance: att.percent };
    })
    .sort((a, b) => b.avg - a.avg);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('teacher.groupsTitle')}</h1>
          <p className="lede">{t('teacher.groupsSub')}</p>
        </div>
      </div>

      <div className="pill-row" style={{ marginBottom: 14 }}>
        {myGroups.map((g) => (
          <button key={g.id} className={`btn${activeGroup?.id === g.id ? ' btn-selected' : ''}`} onClick={() => setActiveGroupId(g.id)}>
            {label(g)}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th className="num">#</th>
              <th>{t('common.student')}</th>
              <th className="mono">{t('common.code')}</th>
              <th className="num">{t('teacher.avg')}</th>
              <th className="num">{t('student.attendanceLabel')}</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((r, i) => (
              <tr key={r.student.userId}>
                <td className="num tabular">{i + 1}</td>
                <td>{r.user.fullName}</td>
                <td className="mono">{r.student.studentCode}</td>
                <td className="num tabular">{pct(r.avg)}</td>
                <td className="num tabular">{pct(r.attendance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
