import { useStore } from '../../data/store';
import { useI18n } from '../../i18n';

function pctInput(value: number, onChange: (v: number) => void) {
  return (
    <input
      className="input score-input"
      type="number"
      min={0}
      max={100}
      value={Math.round(value * 100)}
      onChange={(e) => onChange(Number(e.target.value) / 100)}
    />
  );
}

export default function AdminSettings() {
  const { data, updateGradingConfig, resetDemoData } = useStore();
  const { t } = useI18n();
  const cfg = data.gradingConfig;
  const weightSum = Math.round((cfg.weeklyWeight + cfg.controlWeight + cfg.finalWeight) * 100);
  const indexSum = Math.round((cfg.indexWeights.knowledge + cfg.indexWeights.stability + cfg.indexWeights.progress + cfg.indexWeights.control) * 100);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t('admin.settingsTitle')}</h1>
          <p className="lede">{t('admin.settingsSub')}</p>
        </div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h3>{t('admin.avgFormulaTitle')}</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>avg = w1·weekly + w2·control + w3·final</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{t('student.weeklyTests')}</span>{pctInput(cfg.weeklyWeight, (v) => updateGradingConfig({ weeklyWeight: v }))}%
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{t('student.controlTests')}</span>{pctInput(cfg.controlWeight, (v) => updateGradingConfig({ controlWeight: v }))}%
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{t('student.finalTests')}</span>{pctInput(cfg.finalWeight, (v) => updateGradingConfig({ finalWeight: v }))}%
            </div>
          </div>
          <p className={`badge ${weightSum === 100 ? 'positive' : 'warning'}`} style={{ marginTop: 12 }}>{t('admin.sum', { value: weightSum })}</p>
        </div>

        <div className="card">
          <h3>{t('admin.indexFormulaTitle')}</h3>
          <p style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>index = k1·knowledge + k2·stability + k3·progress + k4·control</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{t('student.overallIndex')}</span>{pctInput(cfg.indexWeights.knowledge, (v) => updateGradingConfig({ indexWeights: { knowledge: v } }))}%
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Stability</span>{pctInput(cfg.indexWeights.stability, (v) => updateGradingConfig({ indexWeights: { stability: v } }))}%
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{t('student.progress')}</span>{pctInput(cfg.indexWeights.progress, (v) => updateGradingConfig({ indexWeights: { progress: v } }))}%
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{t('student.controlTests')}</span>{pctInput(cfg.indexWeights.control, (v) => updateGradingConfig({ indexWeights: { control: v } }))}%
            </div>
          </div>
          <p className={`badge ${indexSum === 100 ? 'positive' : 'warning'}`} style={{ marginTop: 12 }}>{t('admin.sum', { value: indexSum })}</p>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>{t('admin.attendanceBehaviorTitle')}</h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>{t('admin.attendanceBehaviorNote')}</p>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
          <input type="checkbox" checked={cfg.includeAttendanceInIndex} onChange={(e) => updateGradingConfig({ includeAttendanceInIndex: e.target.checked })} />
          {t('admin.includeAttendance')}
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <input type="checkbox" checked={cfg.includeBehaviorInIndex} onChange={(e) => updateGradingConfig({ includeBehaviorInIndex: e.target.checked })} />
          {t('admin.includeBehavior')}
        </label>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>{t('admin.demoDataTitle')}</h3>
        <p style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>{t('admin.demoDataNote')}</p>
        <button className="btn" onClick={() => { if (confirm(t('admin.resetConfirm'))) resetDemoData(); }}>
          {t('admin.resetDemo')}
        </button>
      </div>
    </div>
  );
}
