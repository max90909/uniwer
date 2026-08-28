import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useI18n } from '../i18n';
import { LanguageSwitcher } from '../components/Layout';
import { ScoreGauge } from '../components/ScoreGauge';
import { ProgressBar } from '../components/ProgressBar';
import { Item, Stagger } from '../components/Reveal';
import { prefersReducedMotion } from '../lib/useAnimatedNumber';

/**
 * Страница намеренно короткая: раньше здесь было шесть возможностей, четыре
 * счётчика, три шага и три роли — читателю приходилось пролистывать всё это,
 * чтобы дойти до кнопки входа. Осталось одно предложение о сути, живой пример
 * интерфейса и три главных возможности.
 */
const FEATURES = [
  { icon: '📊', titleKey: 'welcome.f1Title', descKey: 'welcome.f1Desc' },
  { icon: '🏆', titleKey: 'welcome.f2Title', descKey: 'welcome.f2Desc' },
  { icon: '📅', titleKey: 'welcome.f3Title', descKey: 'welcome.f3Desc' },
];

/** Значения, по которым ходит гейдж в примере — проходят через разные уровни. */
const DEMO_SCORES = [58, 74, 91, 83];

const DEMO_TOPICS = [
  { key: 'topic.grammar', value: 88 },
  { key: 'topic.listening', value: 72 },
];

export function Welcome() {
  const { t } = useI18n();
  const [demoIdx, setDemoIdx] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = setInterval(() => setDemoIdx((i) => (i + 1) % DEMO_SCORES.length), 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="welcome-shell">
      <header className="welcome-nav">
        <span className="welcome-nav-brand">{t('appName')}</span>
        <div className="welcome-nav-actions">
          <LanguageSwitcher subtle />
          <Link to="/login" className="btn primary">{t('welcome.cta')}</Link>
        </div>
      </header>

      <section className="welcome-hero">
        <Stagger className="welcome-hero-copy">
          <Item>
            <span className="welcome-badge">{t('welcome.badge')}</span>
          </Item>
          <Item><h1>{t('welcome.title')}</h1></Item>
          <Item><p className="lede">{t('welcome.subtitle')}</p></Item>
          <Item>
            <div className="welcome-cta-row">
              <Link to="/login" className="btn primary lg">{t('welcome.cta')}</Link>
            </div>
          </Item>
        </Stagger>

        <motion.div
          className="welcome-preview"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <div className="card preview-card">
            <span className="preview-title">{t('welcome.previewTitle')}</span>
            <ScoreGauge value={DEMO_SCORES[demoIdx]} size={186} />
            <div className="preview-meters">
              {DEMO_TOPICS.map((tp) => (
                <ProgressBar key={tp.key} value={tp.value} label={t(tp.key)} showValue />
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <Stagger className="welcome-features" whenVisible>
        {FEATURES.map((f) => (
          <Item className="welcome-feature" key={f.titleKey}>
            <span className="icon">{f.icon}</span>
            <h3>{t(f.titleKey)}</h3>
            <p>{t(f.descKey)}</p>
          </Item>
        ))}
      </Stagger>

      <motion.section
        className="welcome-final"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2>{t('welcome.finalTitle')}</h2>
        <Link to="/login" className="btn primary lg">{t('welcome.cta')}</Link>
      </motion.section>

      <p className="welcome-footer">{t('welcome.footer')}</p>
    </div>
  );
}

export default Welcome;
