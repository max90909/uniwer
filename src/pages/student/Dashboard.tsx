import { useMemo } from 'react';
import { useStore } from '../../data/store';
import { useSession } from '../../lib/session';
import { useI18n } from '../../i18n';
import { StatTile } from '../../components/StatTile';
import { ProgressBar } from '../../components/ProgressBar';
import { TrendBadge } from '../../components/TrendBadge';
import {
  attendancePercent,
  computeGroupStats,
  gradesForStudent,
  periodAverage,
  progressScore,
  rankStudents,
  topicSummaries,
} from '../../lib/formulas';
import { assessmentKey, formatDate, LOCALE_BY_LANG, pct, signedPct } from '../../lib/format';

export default function StudentDashboard() {
  const { data } = useStore();
  const { user } = useSession();
  const { t, lang } = useI18n();
  if (!user) return null;

  const student = data.students.find((s) => s.userId === user.id)!;
  const group = data.groups.find((g) => g.id === student.groupId)!;
  const groupStudentIds = data.students.filter((s) => s.groupId === group.id).map((s) => s.userId);

  const entries = useMemo(() => gradesForStudent(user.id, data.grades, data.assessments), [user.id, data.grades, data.assessments]);
  const avg = periodAverage(entries, data.gradingConfig);
  const progress = progressScore(entries);
  const topics = topicSummaries(entries, data.topics);
  const weakest = [...topics].filter((tp) => tp.latest !== null).sort((a, b) => (a.latest ?? 0) - (b.latest ?? 0))[0];
  const strongest = [...topics].filter((tp) => tp.latest !== null).sort((a, b) => (b.latest ?? 0) - (a.latest ?? 0))[0];

  const ranking = rankStudents(groupStudentIds, (id) => periodAverage(gradesForStudent(id, data.grades, data.assessments), data.gradingConfig).average);
  const myRank = ranking.find((r) => r.studentId === user.id)!;
  const groupStats = computeGroupStats(group, data.students.filter((s) => s.groupId === group.id), data.grades, data.assessments, data.gradingConfig);

  const myAttendance = attendancePercent(data.attendance.filter((a) => a.studentId === user.id));

  const todayIso = new Date().toISOString().slice(0, 10);
  const upcoming = data.assessments
    .filter((a) => a.groupId === group.id && a.administeredOn >= todayIso)
    .sort((a, b) => a.administeredOn.localeCompare(b.administeredOn))[0];

  const recent = [...entries].slice(-5).reverse();
  const locale = LOCALE_BY_LANG[lang];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('student.greeting', { name: user.fullName.split(' ')[0] })}</h1>
          <p className="lede">{group.name} · {data.course.name}</p>
        </div>
      </div>

      <div className="grid cols-4" style={{ marginBottom: 16 }}>
        <StatTile label={t('student.currentResult')} value={pct(avg.average)} />
        <StatTile
          label={t('student.progressSinceStart')}
          value={signedPct(progress.delta)}
          sub={`${progress.start.toFixed(0)}% → ${progress.current.toFixed(0)}%`}
          tone={progress.delta >= 0 ? 'positive' : 'negative'}
        />
        <StatTile label={t('student.rankInGroup')} value={`${myRank.rank} / ${groupStudentIds.length}`} sub={t('student.avgGroupLabel', { value: pct(groupStats.average) })} />
        <StatTile label={t('student.attendanceLabel')} value={pct(myAttendance.percent)} sub={t('student.attendanceSub', { present: myAttendance.present, absent: myAttendance.absent })} />
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h3>{t('student.upcomingTest')}</h3>
          {upcoming ? (
            <>
              <p style={{ margin: '4px 0' }}>
                {t(assessmentKey(upcoming.type))}
                {upcoming.topicId ? ` · ${data.topics.find((tp) => tp.id === upcoming.topicId)?.name}` : ''}
              </p>
              <p className="mono" style={{ color: 'var(--muted)' }}>{formatDate(upcoming.administeredOn, locale)}</p>
            </>
          ) : (
            <p className="empty-note">{t('student.allTestsDone')}</p>
          )}
        </div>

        <div className="card">
          <h3>{t('student.topicsCard')}</h3>
          {strongest && weakest ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{t('student.strongest')}: <b>{strongest.topic.name}</b></span>
                <span className="badge positive tabular">{pct(strongest.latest ?? 0)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{t('student.weakest')}: <b>{weakest.topic.name}</b></span>
                <span className="badge warning tabular">{pct(weakest.latest ?? 0)}</span>
              </div>
            </div>
          ) : (
            <p className="empty-note">{t('student.notEnoughData')}</p>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>{t('student.recentResults')}</h3>
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
              {recent.map(({ grade, assessment }) => (
                <tr key={grade.id}>
                  <td>{formatDate(assessment.administeredOn, locale)}</td>
                  <td>{t(assessmentKey(assessment.type))}</td>
                  <td>{data.topics.find((tp) => tp.id === assessment.topicId)?.name ?? '—'}</td>
                  <td className="num tabular">{grade.scoreCorrect} / {grade.scoreTotal}</td>
                  <td className="num tabular">{pct(grade.scorePercent)}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-note">{t('student.noResultsYet')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid cols-3" style={{ marginTop: 16 }}>
        {topics.map((tp) => (
          <div className="card" key={tp.topic.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{ marginBottom: 0 }}>{tp.topic.name}</h3>
              <TrendBadge trend={tp.trend} />
            </div>
            <div style={{ margin: '10px 0 6px' }}>
              <ProgressBar value={tp.latest ?? 0} />
            </div>
            <span className="mono" style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
              {tp.latest !== null ? pct(tp.latest) : t('common.noData')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
