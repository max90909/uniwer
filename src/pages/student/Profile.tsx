import { useStore } from '../../data/store';
import { useSession } from '../../lib/session';
import { useI18n } from '../../i18n';
import { attendancePercent, gradesForStudent, periodAverage, progressScore, rankStudents, studentIndex } from '../../lib/formulas';
import { pct, signedPct } from '../../lib/format';
import { useLabel } from '../../lib/label';

export default function StudentProfile() {
  const { data } = useStore();
  const { user } = useSession();
  const { t } = useI18n();
  const label = useLabel();
  if (!user) return null;

  const student = data.students.find((s) => s.userId === user.id)!;
  const group = data.groups.find((g) => g.id === student.groupId)!;
  const groupStudentIds = data.students.filter((s) => s.groupId === group.id).map((s) => s.userId);
  const allStudentIds = data.students.map((s) => s.userId);

  const entries = gradesForStudent(user.id, data.grades, data.assessments);
  const avg = periodAverage(entries, data.gradingConfig);
  const progress = progressScore(entries);
  const attendance = attendancePercent(data.attendance.filter((a) => a.studentId === user.id));
  const behavior = data.behaviorEvents.filter((b) => b.studentId === user.id);
  const index = studentIndex(entries, data.gradingConfig, data.attendance.filter((a) => a.studentId === user.id), behavior);

  const avgOf = (id: string) => periodAverage(gradesForStudent(id, data.grades, data.assessments), data.gradingConfig).average;
  const inGroup = rankStudents(groupStudentIds, avgOf).find((r) => r.studentId === user.id)!;
  const overall = rankStudents(allStudentIds, avgOf).find((r) => r.studentId === user.id)!;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('student.profileTitle')}</h1>
          <p className="lede">{t('student.profileSub')}</p>
        </div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h3>{t('student.personalData')}</h3>
          <dl className="kv kv-labelled">
            <dt>{t('student.fullName')}</dt><dd>{user.fullName}</dd>
            <dt>{t('student.email')}</dt><dd>{user.email}</dd>
            <dt>{t('student.studentCode')}</dt><dd className="mono">{student.studentCode}</dd>
            <dt>{t('common.group')}</dt><dd>{label(group)}</dd>
            <dt>{t('student.course')}</dt><dd>{label(data.course)}</dd>
          </dl>
        </div>

        <div className="card">
          <h3>{t('student.summaryReport')}</h3>
          <dl className="kv">
            <dt>{t('student.overallResult')}</dt><dd className="mono tabular">{pct(avg.average)}</dd>
            <dt>{t('student.weeklyTests')}</dt><dd className="mono tabular">{pct(avg.weekly)}</dd>
            <dt>{t('student.controlTests')}</dt><dd className="mono tabular">{pct(avg.control)}</dd>
            <dt>{t('student.finalTests')}</dt><dd className="mono tabular">{pct(avg.final)}</dd>
            <dt>{t('student.attendanceLabel')}</dt><dd className="mono tabular">{pct(attendance.percent)}</dd>
            <dt>{t('student.rankInGroup')}</dt><dd className="mono tabular">{inGroup.rank} / {groupStudentIds.length}</dd>
            <dt>{t('student.rankOverall')}</dt><dd className="mono tabular">{overall.rank} / {allStudentIds.length}</dd>
            <dt>{t('student.progress')}</dt><dd className="mono tabular">{signedPct(progress.delta)}</dd>
            <dt className="strong">{t('student.overallIndex')}</dt><dd className="mono tabular strong">{index.index.toFixed(1)}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}
