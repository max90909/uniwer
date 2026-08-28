import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../data/store';
import { useSession } from '../lib/session';
import { useI18n } from '../i18n';
import { LanguageSwitcher } from '../components/Layout';
import { Item, Stagger } from '../components/Reveal';

type Role = 'admin' | 'teacher' | 'student';
const ROLES: Role[] = ['student', 'teacher', 'admin'];

interface Pick {
  id: string;
  name: string;
  meta: string;
}

export function Login() {
  const { data } = useStore();
  const { login } = useSession();
  const { t } = useI18n();

  const [role, setRole] = useState<Role>('student');
  const [groupId, setGroupId] = useState<string>('all');
  const [query, setQuery] = useState('');

  const picks: Pick[] = useMemo(() => {
    if (role === 'admin') {
      return [{ id: data.admin.id, name: data.admin.fullName, meta: data.admin.email }];
    }
    if (role === 'teacher') {
      return data.teacherUsers.map((tu) => ({
        id: tu.id,
        name: tu.fullName,
        meta: data.teacherGroups
          .filter((tg) => tg.teacherId === tu.id)
          .map((tg) => data.groups.find((g) => g.id === tg.groupId)?.name)
          .filter(Boolean)
          .join(', '),
      }));
    }
    return data.students
      .filter((s) => groupId === 'all' || s.groupId === groupId)
      .map((s) => {
        const u = data.allUsers.find((au) => au.id === s.userId);
        const group = data.groups.find((g) => g.id === s.groupId);
        return u ? { id: u.id, name: u.fullName, meta: group?.name ?? u.email } : null;
      })
      .filter(Boolean) as Pick[];
  }, [role, groupId, data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? picks.filter((p) => p.name.toLowerCase().includes(q)) : picks;
  }, [picks, query]);

  return (
    <div className="login-shell">
      <div className="login-card">
        <aside className="login-aside">
          <div>
            <Link to="/" className="login-back">← {t('login.back')}</Link>
            <h1>{t('appName')}</h1>
            <p className="login-aside-lede">{t('login.subtitle')}</p>
          </div>
          <div className="login-note">{t('login.demoNote')}</div>
          <LanguageSwitcher />
        </aside>

        <div className="login-main">
          <span className="login-step-label">{t('login.pickRole')}</span>
          <div className="role-tabs" role="tablist">
            {ROLES.map((r) => (
              <button
                key={r}
                role="tab"
                aria-selected={role === r}
                className={`role-tab${role === r ? ' active' : ''}`}
                onClick={() => {
                  setRole(r);
                  setQuery('');
                }}
              >
                {/* The pill slides between tabs rather than cutting, so the eye
                    follows the selection instead of re-finding it. */}
                {role === r && (
                  <motion.span className="role-tab-pill" layoutId="role-tab-pill" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
                )}
                <span className="role-tab-text">{t(`role.${r}`)}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            >
              {role === 'student' && (
                <div className="login-filters">
                  <select className="input" value={groupId} onChange={(e) => setGroupId(e.target.value)} aria-label={t('login.allGroups')}>
                    <option value="all">{t('login.allGroups')}</option>
                    {data.groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                  <input
                    className="input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('login.searchPlaceholder')}
                    aria-label={t('login.searchPlaceholder')}
                  />
                </div>
              )}

              <div className="login-count">{t('login.countFound', { count: filtered.length })}</div>

              {filtered.length === 0 ? (
                <p className="empty-note">{t('login.nothingFound')}</p>
              ) : (
                <Stagger className="user-grid login-user-grid">
                  {filtered.map((p) => (
                    <Item key={p.id}>
                      <button className="user-chip" onClick={() => login(p.id)}>
                        <span className="avatar" aria-hidden="true">{initials(p.name)}</span>
                        <span className="user-chip-text">
                          <span className="name">{p.name}</span>
                          <span className="meta">{p.meta}</span>
                        </span>
                      </button>
                    </Item>
                  ))}
                </Stagger>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}
