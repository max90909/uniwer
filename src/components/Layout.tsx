import { NavLink, useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useSession } from '../lib/session';
import { useI18n } from '../i18n';
import { LANG_LABEL, type Lang } from '../i18n/translations';
import { PageTransition } from './PageTransition';

interface NavItem {
  to: string;
  key: string;
  icon: string;
}

const NAV: Record<'student' | 'teacher' | 'admin', NavItem[]> = {
  student: [
    { to: '/student', key: 'nav.home', icon: '◈' },
    { to: '/student/materials', key: 'nav.learning', icon: '▤' },
    { to: '/student/results', key: 'nav.results', icon: '✓' },
    { to: '/student/progress', key: 'nav.progress', icon: '◑' },
    { to: '/student/ranking', key: 'nav.ranking', icon: '▲' },
    { to: '/student/attendance', key: 'nav.attendance', icon: '◫' },
    { to: '/student/profile', key: 'nav.profile', icon: '◯' },
  ],
  teacher: [
    { to: '/teacher', key: 'nav.home', icon: '◈' },
    { to: '/teacher/groups', key: 'nav.groups', icon: '▤' },
    { to: '/teacher/grades', key: 'nav.enterGrades', icon: '✎' },
    { to: '/teacher/materials', key: 'nav.materials', icon: '▦' },
    { to: '/teacher/attendance', key: 'nav.attendance', icon: '◫' },
    { to: '/teacher/behavior', key: 'nav.behavior', icon: '◇' },
    { to: '/teacher/rankings', key: 'nav.rankings', icon: '▲' },
    { to: '/teacher/statistics', key: 'nav.statistics', icon: '◑' },
  ],
  admin: [
    { to: '/admin', key: 'nav.users', icon: '◯' },
    { to: '/admin/groups', key: 'nav.groupsCourses', icon: '▤' },
    { to: '/admin/schedule', key: 'nav.schedule', icon: '◫' },
    { to: '/admin/settings', key: 'nav.settings', icon: '⚙' },
    { to: '/admin/rankings', key: 'nav.rankings', icon: '▲' },
  ],
};

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="lang-switch" role="group" aria-label="Language">
      {(Object.keys(LANG_LABEL) as Lang[]).map((l) => (
        <button key={l} className={`lang-pill${lang === l ? ' active' : ''}`} onClick={() => setLang(l)}>
          {/* The active pill glides between languages instead of blinking on/off. */}
          {lang === l && (
            <motion.span
              className="lang-pill-bg"
              layoutId="lang-pill-bg"
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            />
          )}
          <span className="lang-pill-text">{l.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}

export function Layout({ role }: { role: 'student' | 'teacher' | 'admin' }) {
  const { user, logout } = useSession();
  const { t } = useI18n();
  const location = useLocation();
  // `useOutlet()` resolves the matched child to a concrete element. <Outlet/> would
  // read the router context at render time, so the copy AnimatePresence holds back
  // for the exit animation would render the *incoming* page — showing the new
  // content fading out and in at once. Capturing the element pins the old page.
  const outlet = useOutlet();

  return (
    <motion.div
      className="app-shell"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    >
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

        <div className="nav-list">
          {NAV[role].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === `/${role}`}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {({ isActive }) => (
                <>
                  {/* One shared indicator slides down the sidebar between items. */}
                  {isActive && (
                    <motion.span
                      className="nav-active-bg"
                      layoutId="nav-active-bg"
                      transition={{ type: 'spring', stiffness: 400, damping: 36 }}
                    />
                  )}
                  <span className="nav-icon" aria-hidden="true">{item.icon}</span>
                  <span className="nav-text">{t(item.key)}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="current-user">
            <span className="avatar" aria-hidden="true">{initials(user?.fullName ?? '')}</span>
            <span className="current-user-text">
              <span className="name">{user?.fullName}</span>
              <span className="email">{user?.email}</span>
            </span>
          </div>
          <button className="btn ghost" style={{ width: '100%', justifyContent: 'center' }} onClick={logout}>
            {t('common.changeUser')}
          </button>
        </div>
      </nav>

      <main className="app-main">
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>{outlet}</PageTransition>
        </AnimatePresence>
      </main>
    </motion.div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}
