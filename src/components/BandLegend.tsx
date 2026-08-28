import { BANDS } from '../lib/score';
import { useT } from '../i18n';

/**
 * Explains what the gauge colours mean. Shown once per page near the primary
 * score, so the colour coding is legible without the reader guessing thresholds.
 */
export function BandLegend() {
  const t = useT();
  return (
    <div className="band-legend">
      {BANDS.map((b, i) => {
        const upper = i === 0 ? 100 : BANDS[i - 1].min;
        return (
          <span className="band-item" key={b.key}>
            <i className={`dot ${b.tone}`} />
            {t(b.key)} <span className="tabular" style={{ color: 'var(--faint)' }}>{b.min}–{upper}%</span>
          </span>
        );
      })}
    </div>
  );
}
