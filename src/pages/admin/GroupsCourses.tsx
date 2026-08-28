import { useState } from 'react';
import { useStore } from '../../data/store';
import { useI18n } from '../../i18n';
import { computeGroupStats } from '../../lib/formulas';
import { pct } from '../../lib/format';
import { useLabel } from '../../lib/label';

export default function AdminGroupsCourses() {
  const { data, addGroup, addStudents } = useStore();
  const { t } = useI18n();

  const [newGroupName, setNewGroupName] = useState('');
  const [targetGroupId, setTargetGroupId] = useState(data.groups[0]?.id);
  const [namesText, setNamesText] = useState('');
  const label = useLabel();

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;
    const group = addGroup(newGroupName.trim());
    setTargetGroupId(group.id);
    setNewGroupName('');
  };

  const handleAddStudents = () => {
    const names = namesText.split('\n').map((n) => n.trim()).filter(Boolean);
    if (!names.length || !targetGroupId) return;
    addStudents(targetGroupId, names);
    setNamesText('');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('admin.groupsCoursesTitle')}</h1>
          <p className="lede">{t('admin.groupsCoursesSub', { course: label(data.course), months: data.course.totalMonths, weeks: data.weeks.length })}</p>
        </div>
      </div>

      <div className="grid cols-3" style={{ marginBottom: 16 }}>
        {data.groups.map((g) => {
          const teachers = data.teacherGroups.filter((tg) => tg.groupId === g.id).map((tg) => data.teacherUsers.find((t2) => t2.id === tg.teacherId)?.fullName);
          const groupStudents = data.students.filter((s) => s.groupId === g.id);
          const stats = computeGroupStats(g, groupStudents, data.grades, data.assessments, data.gradingConfig);
          return (
            <div className="card" key={g.id}>
              <h3>{label(g)}</h3>
              <dl style={{ margin: 0, display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 6 }}>
                <dt>{t('admin.students')}</dt><dd className="mono tabular" style={{ margin: 0 }}>{groupStudents.length}</dd>
                <dt>{t('admin.teachersLabel')}</dt><dd style={{ margin: 0, textAlign: 'right' }}>{teachers.join(', ') || '—'}</dd>
                <dt>{t('teacher.avg')}</dt><dd className="mono tabular" style={{ margin: 0 }}>{pct(stats.average)}</dd>
                <dt>{t('student.completion')}</dt><dd className="mono tabular" style={{ margin: 0 }}>{pct(stats.completionRate)}</dd>
              </dl>
            </div>
          );
        })}
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h3>{t('admin.newGroup')}</h3>
          <div className="field">
            <label>{t('admin.groupName')}</label>
            <input className="input" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Группа D" />
          </div>
          <button className="btn primary" style={{ marginTop: 12 }} onClick={handleCreateGroup}>{t('admin.createGroup')}</button>
        </div>

        <div className="card">
          <h3>{t('admin.addStudentsToGroup')}</h3>
          <div className="field" style={{ marginBottom: 10 }}>
            <label>{t('common.group')}</label>
            <select className="input" value={targetGroupId} onChange={(e) => setTargetGroupId(e.target.value)}>
              {data.groups.map((g) => <option key={g.id} value={g.id}>{label(g)}</option>)}
            </select>
          </div>
          <div className="field">
            <label>{t('admin.addStudents')}</label>
            <textarea className="input" rows={5} value={namesText} onChange={(e) => setNamesText(e.target.value)} placeholder={t('admin.namesPlaceholder')} />
          </div>
          <button className="btn primary" style={{ marginTop: 12 }} onClick={handleAddStudents}>{t('admin.addStudentsBtn')}</button>
        </div>
      </div>
    </div>
  );
}
