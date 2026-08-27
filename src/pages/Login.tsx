import { useStore } from '../data/store';
import { useSession } from '../lib/session';
import { useI18n } from '../i18n';
import { LanguageSwitcher } from '../components/Layout';

export function Login() {
  const { data } = useStore();
  const { login } = useSession();
  const { t } = useI18n();

  const studentsByGroup = data.groups.map((g) => ({
    group: g,
    students: data.students.filter((s) => s.groupId === g.id).map((s) => data.allUsers.find((u) => u.id === s.userId)!),
  }));

  return (
    <div className="login-shell">
      <div className="login-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <h1>{t('appName')}</h1>
          <LanguageSwitcher />
        </div>
        <p style={{ color: 'var(--muted)', maxWidth: '60ch' }}>{t('login.subtitle')}</p>

        <div className="role-section">
          <h3>{t('login.admins')}</h3>
          <div className="user-grid">
            <button className="user-chip" onClick={() => login(data.admin.id)}>
              <div className="name">{data.admin.fullName}</div>
              <div className="meta">{data.admin.email}</div>
            </button>
          </div>
        </div>

        <div className="role-section">
          <h3>{t('login.teachers')}</h3>
          <div className="user-grid">
            {data.teacherUsers.map((tu) => {
              const myGroups = data.teacherGroups.filter((tg) => tg.teacherId === tu.id).map((tg) => data.groups.find((g) => g.id === tg.groupId)?.name);
              return (
                <button key={tu.id} className="user-chip" onClick={() => login(tu.id)}>
                  <div className="name">{tu.fullName}</div>
                  <div className="meta">{myGroups.join(', ')}</div>
                </button>
              );
            })}
          </div>
        </div>

        {studentsByGroup.map(({ group, students }) => (
          <div className="role-section" key={group.id}>
            <h3>{t('login.studentsIn', { group: group.name })}</h3>
            <div className="user-grid" style={{ maxHeight: 190, overflowY: 'auto' }}>
              {students.map((s) => (
                <button key={s.id} className="user-chip" onClick={() => login(s.id)}>
                  <div className="name">{s.fullName}</div>
                  <div className="meta">{s.email}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
