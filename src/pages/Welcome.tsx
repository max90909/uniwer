import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useI18n } from '../i18n';
import { LanguageSwitcher } from '../components/Layout';
import { useStore } from '../data/store';
import { ScoreGauge } from '../components/ScoreGauge';
import { ProgressBar } from '../components/ProgressBar';
import { BandLegend } from '../components/BandLegend';
import { Item, Stagger } from '../components/Reveal';
import { prefersReducedMotion } from '../lib/useAnimatedNumber';

const FEATURES = [
  { icon: '📊', titleKey: 'welcome.f1Title', descKey: 'welcome.f1Desc' },
  { icon: '🏆', titleKey: 'welcome.f2Title', descKey: 'welcome.f2Desc' },
  { icon: '📅', titleKey: 'welcome.f3Title', descKey: 'welcome.f3Desc' },
  { icon: '🌐', titleKey: 'welcome.f4Title', descKey: 'welcome.f4Desc' },
  { icon: '👥', titleKey: 'welcome.f5Title', descKey: 'welcome.f5Desc' },
  { icon: '🔒', titleKey: 'welcome.f6Title', descKey: 'welcome.f6Desc' },
];

const STEPS = [
  { titleKey: 'welcome.step1Title', descKey: 'welcome.step1Desc' },
  { titleKey: 'welcome.step2Title', descKey: 'welcome.step2Desc' },
  { titleKey: 'welcome.step3Title', descKey: 'welcome.step3Desc' },
];

const ROLES = [
  { roleKey: 'role.student', descKey: 'welcome.roleStudentDesc', icon: '🎓' },
  { roleKey: 'role.teacher', descKey: 'welcome.roleTeacherDesc', icon: '📝' },
  { roleKey: 'role.admin', descKey: 'welcome.roleAdminDesc', icon: '⚙️' },
];

/** Values the hero gauge cycles through, chosen to cross every grade band. */
const DEMO_SCORES = [58, 74, 91, 83];

/** Topic meters in the preview card — fixed so the preview reads as real data. */
const DEMO_TOPICS = [
  { name: 'Grammar', value: 88 },
  { name: 'Listening', value: 72 },
  { name: 'Speaking', value: 61 },
];

export function Welcome() {
  const { t } = useI18n();
  const { data } = useStore();
  const [demoIdx, setDemoIdx] = useState(0);

  // The gauge is the thing this page is selling, so it keeps moving between bands
  // instead of sitting on one number — unless the reader asked for less motion.
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = setInterval(() => setDemoIdx((i) => (i + 1) % DEMO_SCORES.length), 2600);
    return () => clearInterval(id);
  }, []);

  const stats = [
    { value: data.groups.length, labelKey: 'welcome.statGroups' },
    { value: data.students.length, labelKey: 'welcome.statStudents' },
    { value: data.course.totalMonths, labelKey: 'welcome.statMonths' },
    { value: 3, labelKey: 'welcome.statLangs' },
  ];

  return (
    <div className="welcome-shell">
      <header className="welcome-nav">
        <span className="welcome-nav-brand">{t('appName')}</span>
        <div className="welcome-nav-actions">
          <LanguageSwitcher />
          <Link to="/login" className="btn primary">{t('welcome.cta')}</Link>
        </div>
      </header>

      <section className="welcome-hero">
        <Stagger className="welcome-hero-copy">
          <Item>
            <span className="welcome-badge">{t('appName')} · {t('welcome.badge')}</span>
          </Item>
          <Item><h1>{t('welcome.title')}</h1></Item>
          <Item><p className="lede">{t('welcome.subtitle')}</p></Item>
          <Item>
            <div className="welcome-cta-row">
              <Link to="/login" className="btn primary lg">{t('welcome.cta')}</Link>
              <a href="#how" className="btn lg">{t('welcome.secondaryCta')}</a>
            </div>
          </Item>
        </Stagger>

        <motion.div
          className="welcome-preview"
          initial={{ opacity: 0, y: 30, rotate: -1.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <div className="card preview-card">
            <span className="preview-title">{t('welcome.previewTitle')}</span>
            <ScoreGauge value={DEMO_SCORES[demoIdx]} size={200} delta={12.4} />
            <div className="preview-meters">
              {DEMO_TOPICS.map((tp) => (
                <ProgressBar key={tp.name} value={tp.value} label={tp.name} showValue ticks />
              ))}
            </div>
            <p className="preview-caption">{t('welcome.previewCaption')}</p>
            <BandLegend />
          </div>
        </motion.div>
      </section>

      <Stagger className="welcome-stats" whenVisible>
        {stats.map((s) => (
          <Item className="welcome-stat" key={s.labelKey} variant="scale">
            <span className="n tabular">{s.value}</span>
            <span className="k">{t(s.labelKey)}</span>
          </Item>
        ))}
      </Stagger>

      <section className="welcome-section">
        <motion.h2
          className="welcome-section-title"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {t('welcome.featuresTitle')}
        </motion.h2>
        <Stagger className="welcome-features" whenVisible>
          {FEATURES.map((f) => (
            <Item className="welcome-feature" key={f.titleKey}>
              <span className="icon">{f.icon}</span>
              <h3>{t(f.titleKey)}</h3>
              <p>{t(f.descKey)}</p>
            </Item>
          ))}
        </Stagger>
      </section>

      <section className="welcome-section" id="how">
        <motion.h2
          className="welcome-section-title"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {t('welcome.howTitle')}
        </motion.h2>
        <Stagger className="welcome-steps" whenVisible>
          {STEPS.map((s, i) => (
            <Item className="welcome-step" key={s.titleKey}>
              <span className="step-num">{i + 1}</span>
              <div>
                <h3>{t(s.titleKey)}</h3>
                <p>{t(s.descKey)}</p>
              </div>
            </Item>
          ))}
        </Stagger>
      </section>

      <section className="welcome-section">
        <motion.h2
          className="welcome-section-title"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {t('welcome.rolesTitle')}
        </motion.h2>
        <Stagger className="welcome-roles" whenVisible>
          {ROLES.map((r) => (
            <Item className="welcome-role" key={r.roleKey}>
              <span className="icon">{r.icon}</span>
              <h3>{t(r.roleKey)}</h3>
              <p>{t(r.descKey)}</p>
            </Item>
          ))}
        </Stagger>
      </section>

      <motion.section
        className="welcome-final"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      >
        <h2>{t('welcome.finalTitle')}</h2>
        <p>{t('welcome.finalDesc')}</p>
        <Link to="/login" className="btn primary lg">{t('welcome.cta')}</Link>
      </motion.section>

      <p className="welcome-footer">{t('welcome.footer')}</p>
    </div>
  );
}

export default Welcome;
