import { useEffect, useState } from 'react';
import { NavLink, useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useSession } from '../lib/session';
import { useI18n } from '../i18n';
import { LANG_LABEL, type Lang } from '../i18n/translations';
import { PageTransition } from './PageTransition';
import { MOBILE_QUERY, useMediaQuery } from '../lib/useMediaQuery';

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

/**
 * `subtle` — приглушённый вариант: переключатель почти не видно, пока на него не
 * навели. Язык меняют один раз, поэтому в интерфейсе он не должен спорить за
 * внимание с содержимым.
 */
export function LanguageSwitcher({ subtle = false }: { subtle?: boolean }) {
  const { lang, setLang } = useI18n();
  return (
    <div className={`lang-switch${subtle ? ' subtle' : ''}`} role="group" aria-label="Language">
      {(Object.keys(LANG_LABEL) as Lang[]).map((l) => (
        <button
          key={l}
          className={`lang-pill${lang === l ? ' active' : ''}`}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
        >
          {lang === l && (
            <motion.span
              className="lang-pill-bg"
              layoutId={subtle ? 'lang-pill-bg-subtle' : 'lang-pill-bg'}
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
  const outlet = useOutlet();

  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [menuOpen, setMenuOpen] = useState(false);

  // Переход на другую страницу закрывает шторку — иначе она осталась бы поверх
  // только что открытой страницы. То же при возврате на широкий экран.
  useEffect(() => setMenuOpen(false), [location.pathname]);
  useEffect(() => { if (!isMobile) setMenuOpen(false); }, [isMobile]);

  // Пока шторка открыта, страница под ней не должна прокручиваться.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [menuOpen]);

  // Esc закрывает шторку — привычно для любого оверлея.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  const title = t(NAV[role].find((i) => i.to === location.pathname)?.key ?? NAV[role][0].key);

  const sidebar = (
    <>
      <div className="brand">
        <span className="mark">{t('appName')}</span>
        <span className="role-tag">{t(`role.${role}`)}</span>
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
                {isActive && (
                  <motion.span
                    className="nav-active-bg"
                    layoutId="nav-active"
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
        <button className="btn ghost logout-btn" onClick={logout}>{t('common.signOut')}</button>
        <div className="sidebar-lang"><LanguageSwitcher subtle /></div>
      </div>
    </>
  );

  return (
    <motion.div
      className="app-shell"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    >
      {isMobile && (
        <header className="app-topbar">
          <button
            className="burger"
            onClick={() => setMenuOpen(true)}
            aria-label={t('common.openMenu')}
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
          <span className="topbar-title">{title}</span>
          <LanguageSwitcher subtle />
        </header>
      )}

      {!isMobile && <nav className="app-sidebar">{sidebar}</nav>}

      <AnimatePresence>
        {isMobile && menuOpen && (
          <>
            <motion.div
              className="drawer-backdrop"
              onClick={() => setMenuOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.nav
              className="app-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 38 }}
            >
              {sidebar}
            </motion.nav>
          </>
        )}
      </AnimatePresence>

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
