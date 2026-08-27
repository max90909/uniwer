import { NavLink, Outlet } from 'react-router-dom';
import { useSession } from '../lib/session';
import { useI18n } from '../i18n';
import { LANG_LABEL, type Lang } from '../i18n/translations';

interface NavItem {
  to: string;
  key: string;
}

const NAV: Record<'student' | 'teacher' | 'admin', NavItem[]> = {
  student: [
    { to: '/student', key: 'nav.home' },
    { to: '/student/materials', key: 'nav.learning' },
    { to: '/student/results', key: 'nav.results' },
    { to: '/student/progress', key: 'nav.progress' },
    { to: '/student/ranking', key: 'nav.ranking' },
    { to: '/student/attendance', key: 'nav.attendance' },
    { to: '/student/profile', key: 'nav.profile' },
  ],
  teacher: [
    { to: '/teacher', key: 'nav.home' },
    { to: '/teacher/groups', key: 'nav.groups' },
    { to: '/teacher/grades', key: 'nav.enterGrades' },
    { to: '/teacher/materials', key: 'nav.materials' },
    { to: '/teacher/attendance', key: 'nav.attendance' },
    { to: '/teacher/behavior', key: 'nav.behavior' },
    { to: '/teacher/rankings', key: 'nav.rankings' },
    { to: '/teacher/statistics', key: 'nav.statistics' },
  ],
  admin: [
    { to: '/admin', key: 'nav.users' },
    { to: '/admin/groups', key: 'nav.groupsCourses' },
    { to: '/admin/schedule', key: 'nav.schedule' },
    { to: '/admin/settings', key: 'nav.settings' },
    { to: '/admin/rankings', key: 'nav.rankings' },
  ],
};

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="lang-switch" role="group" aria-label="Language">
      {(Object.keys(LANG_LABEL) as Lang[]).map((l) => (
        <button key={l} className={`lang-pill${lang === l ? ' active' : ''}`} onClick={() => setLang(l)}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function Layout({ role }: { role: 'student' | 'teacher' | 'admin' }) {
  const { user, logout } = useSession();
  const { t } = useI18n();

  return (
    <div className="app-shell">
      <nav className="app-sidebar">
        <div className="brand">
          <span className="mark">{t('appName')}</span>
        </div>
        <span className="role-tag" style={{ padding: '0 10px 10px' }}>
          {t(`role.${role}`)}
        </span>
        <div style={{ padding: '0 10px 14px' }}>
          <LanguageSwitcher />
        </div>
        {NAV[role].map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === `/${role}`} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            {t(item.key)}
          </NavLink>
        ))}
        <div className="sidebar-footer">
          <div className="current-user">
            <div className="name">{user?.fullName}</div>
            <div className="email">{user?.email}</div>
          </div>
          <button className="btn ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={logout}>
            {t('common.changeUser')}
          </button>
        </div>
      </nav>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
