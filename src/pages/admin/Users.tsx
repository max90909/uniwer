import { useState } from 'react';
import { useStore } from '../../data/store';
import { useI18n } from '../../i18n';
import type { Role } from '../../types';

export default function AdminUsers() {
  const { data } = useStore();
  const { t } = useI18n();
  const [filter, setFilter] = useState<Role | 'all'>('all');

  const rows = data.allUsers
    .filter((u) => filter === 'all' || u.role === filter)
    .map((u) => {
      let group = '—';
      if (u.role === 'student') {
        const s = data.students.find((st) => st.userId === u.id);
        group = data.groups.find((g) => g.id === s?.groupId)?.name ?? '—';
      } else if (u.role === 'teacher') {
        group = data.teacherGroups.filter((tg) => tg.teacherId === u.id).map((tg) => data.groups.find((g) => g.id === tg.groupId)?.name).join(', ') || '—';
      }
      return { user: u, group };
    });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('admin.usersTitle')}</h1>
          <p className="lede">{t('admin.usersSub', { total: data.allUsers.length, students: data.students.length, teachers: data.teacherUsers.length })}</p>
        </div>
      </div>

      <div className="pill-row" style={{ marginBottom: 14 }}>
        {(['all', 'admin', 'teacher', 'student'] as const).map((f) => (
          <button key={f} className={`btn${filter === f ? ' btn-selected' : ''}`} onClick={() => setFilter(f)}>
            {f === 'all' ? t('common.all') : t(`role.${f}`)}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead><tr><th>{t('student.fullName')}</th><th>{t('student.email')}</th><th>{t('common.role')}</th><th>{t('common.group')}</th></tr></thead>
          <tbody>
            {rows.map(({ user, group }) => (
              <tr key={user.id}>
                <td>{user.fullName}</td>
                <td className="mono">{user.email}</td>
                <td><span className="badge neutral">{t(`role.${user.role}`)}</span></td>
                <td>{group}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
