import { useAnimatedNumber } from '../lib/useAnimatedNumber';
import { BANDS, clampPct, scoreTone, TONE_VAR, TONE_VAR_SOFT, type Tone } from '../lib/score';

interface Props {
  value: number;
  max?: number;
  /** Caption on the left of the meter's header row. */
  label?: string;
  /** Print the percentage on the right of the header row. */
  showValue?: boolean;
  /** Hairlines at the grade-band boundaries, turning the bar into a small scale. */
  ticks?: boolean;
  tone?: Tone;
  height?: number;
}

/**
 * Horizontal meter. Same colour language as <ScoreGauge> — gradient sweep tinted by
 * grade band, recessed track — so a percentage means the same thing whichever shape
 * it is drawn in.
 */
export function ProgressBar({ value, max = 100, label, showValue, ticks, tone, height = 12 }: Props) {
  const target = clampPct((value / max) * 100);
  const animated = useAnimatedNumber(target);
  const activeTone = tone ?? scoreTone(target);

  return (
    <div className="meter">
      {(label || showValue) && (
        <div className="meter-head">
          {label && <span className="meter-label">{label}</span>}
          {showValue && (
            <span className={`meter-value tabular ${activeTone}`}>{animated.toFixed(0)}%</span>
          )}
        </div>
      )}
      <div
        className="progress-bar"
        style={{ height }}
        role="progressbar"
        aria-valuenow={Math.round(target)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <span
          className="progress-fill"
          style={{
            width: `${animated}%`,
            backgroundImage: `linear-gradient(90deg, ${TONE_VAR_SOFT[activeTone]}, ${TONE_VAR[activeTone]})`,
          }}
        />
        {ticks &&
          BANDS.filter((b) => b.min > 0).map((b) => (
            <i key={b.min} className="progress-tick" style={{ left: `${b.min}%` }} />
          ))}
      </div>
    </div>
  );
}
