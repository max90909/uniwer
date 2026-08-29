import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSession } from '../lib/session';
import { useI18n } from '../i18n';
import { LanguageSwitcher } from '../components/Layout';
import { ACCOUNTS } from '../data/accounts';
import { Item, Stagger } from '../components/Reveal';
import { AmbientBackground } from '../components/AmbientBackground';

/** Глаз для показа пароля; перечёркнут, когда пароль уже виден. */
function EyeIcon({ closed }: { closed: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.7" />
      {closed && <path d="m4 20 16-16" />}
    </svg>
  );
}

export function Login() {
  const { signIn } = useSession();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [reveal, setReveal] = useState(false);
  const [error, setError] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (signIn(login, password)) {
      navigate('/', { replace: true });
    } else {
      setError(true);
    }
  }

  // Печать в любом поле снимает сообщение об ошибке — иначе оно висит,
  // пока пользователь исправляет опечатку, и выглядит как новая ошибка.
  const clearOnType = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    if (error) setError(false);
  };

  // Заполненность формы: 0 → 1 → 2. Ведёт полоску под заголовком и «готовность»
  // кнопки, чтобы ввод логина и пароля читался как продвижение по шагам.
  const filled = (login.trim() ? 1 : 0) + (password ? 1 : 0);
  const ready = filled === 2;

  return (
    <div className="auth">
      <AmbientBackground />
      <motion.aside
        className="auth-brand"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Stagger className="auth-brand-inner">
          <Item>
            <Link to="/" className="auth-back">← {t('login.back')}</Link>
          </Item>
          <Item><h1>{t('appName')}</h1></Item>
          <Item><p>{t('login.brandLede')}</p></Item>
          <Item>
            <ul className="auth-points">
              <li>{t('login.point1')}</li>
              <li>{t('login.point2')}</li>
              <li>{t('login.point3')}</li>
            </ul>
          </Item>
        </Stagger>
      </motion.aside>

      <div className="auth-panel">
        <motion.form
          className="auth-form"
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <h2>{t('login.formTitle')}</h2>
          <p className="auth-sub">{t('login.formSub')}</p>

          <div className="auth-progress" aria-hidden="true">
            <motion.span
              className="auth-progress-fill"
              animate={{ width: `${(filled / 2) * 100}%` }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          <div className="field">
            <label htmlFor="auth-login">{t('login.username')}</label>
            <input
              id="auth-login"
              className="input"
              value={login}
              onChange={(e) => clearOnType(setLogin)(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
            />
          </div>

          {/* Кнопка показа пароля лежит рядом с полем, а не внутри <label>:
              иначе её текст попадает в доступное имя поля и скринридер читает
              «Пароль Показать пароль». */}
          <div className="field">
            <label htmlFor="auth-password">{t('login.password')}</label>
            <span className="input-wrap">
              <input
                id="auth-password"
                className="input"
                type={reveal ? 'text' : 'password'}
                value={password}
                onChange={(e) => clearOnType(setPassword)(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="reveal-btn"
                onClick={() => setReveal((v) => !v)}
                aria-label={t(reveal ? 'login.hidePassword' : 'login.showPassword')}
                aria-pressed={reveal}
              >
                <EyeIcon closed={reveal} />
              </button>
            </span>
          </div>

          {error && (
            <motion.p
              className="auth-error"
              role="alert"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
            >
              {t('login.error')}
            </motion.p>
          )}

          <button type="submit" className={`btn primary lg auth-submit${ready ? ' ready' : ''}`}>
            {t('login.submit')}
          </button>

          <details className="auth-hint">
            <summary>{t('login.hintTitle')}</summary>
            <table className="auth-hint-table">
              <tbody>
                {ACCOUNTS.map((a) => (
                  <tr key={a.login}>
                    <td>{t(`role.${a.role}`)}</td>
                    <td className="mono">{a.login}</td>
                    <td className="mono">{a.password}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>

          <div className="auth-foot">
            <LanguageSwitcher subtle />
          </div>
        </motion.form>
      </div>
    </div>
  );
}
