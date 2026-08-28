import { useId } from 'react';
import { useAnimatedNumber } from '../lib/useAnimatedNumber';
import { BANDS, clampPct, scoreBand, TONE_VAR, TONE_VAR_SOFT, type Tone } from '../lib/score';
import { useT } from '../i18n';

interface Props {
  value: number;
  size?: number;
  /** Caption under the number — usually what the score measures. */
  label?: string;
  /** Change vs. the start of the course; rendered as a signed pill under the label. */
  delta?: number;
  /** Force a colour instead of deriving it from the grade band. */
  tone?: Tone;
  /**
   * Ticks at the band boundaries. Off by default — detached from the arc they read
   * as stray marks, and the band pill plus <BandLegend> already give the scale.
   */
  showTicks?: boolean;
  /** Name of the grade band ("Хорошо") under the value. */
  showBand?: boolean;
}

/** Gap sits at the bottom, so the arc reads as a gauge rather than a closed ring. */
const SWEEP = 260;
const START = 90 + (360 - SWEEP) / 2;

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

/**
 * The primary way a percentage is shown in the app: a 260° gauge with a recessed
 * neumorphic track, a gradient sweep coloured by grade band, a marker riding the
 * end of the arc, and the number counting up in the middle.
 */
export function ScoreGauge({
  value,
  size = 190,
  label,
  delta,
  tone,
  showTicks = false,
  showBand = true,
}: Props) {
  const t = useT();
  const uid = useId().replace(/:/g, '');
  const target = clampPct(value);
  const animated = useAnimatedNumber(target);

  const band = scoreBand(target);
  const activeTone = tone ?? band.tone;

  // Ring thickness tracks the widget size instead of being a fixed number, so the
  // gauge stays balanced whether it renders at 140px in a card or 220px in a hero.
  const stroke = Math.max(9, Math.round(size * 0.075));
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - stroke) / 2 - (showTicks ? Math.round(size * 0.045) : 0);

  const circumference = 2 * Math.PI * r;
  const arc = circumference * (SWEEP / 360);
  const filled = arc * (animated / 100);

  const markerAngle = START + (animated / 100) * SWEEP;
  const marker = polar(cx, cy, r, markerAngle);

  return (
    <div className="gauge">
      <div className="gauge-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <defs>
          {/* var() resolves in CSS declarations but not in SVG presentation
              attributes, so the theme colours go through `style`. */}
          <linearGradient id={`g-${uid}`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" style={{ stopColor: TONE_VAR_SOFT[activeTone] }} />
            <stop offset="100%" style={{ stopColor: TONE_VAR[activeTone] }} />
          </linearGradient>
          <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation={stroke * 0.3}
              style={{ floodColor: TONE_VAR[activeTone], floodOpacity: 0.45 }}
            />
          </filter>
        </defs>

        <g transform={`rotate(${START} ${cx} ${cy})`}>
          <circle
            className="gauge-track"
            cx={cx}
            cy={cy}
            r={r}
            strokeWidth={stroke}
            strokeDasharray={`${arc} ${circumference}`}
            strokeLinecap="round"
          />
          <circle
            className="gauge-fill"
            cx={cx}
            cy={cy}
            r={r}
            strokeWidth={stroke}
            stroke={`url(#g-${uid})`}
            strokeDasharray={`${filled} ${circumference}`}
            strokeLinecap="round"
            filter={`url(#glow-${uid})`}
          />
        </g>

        {showTicks &&
          BANDS.filter((b) => b.min > 0).map((b) => {
            const a = START + (b.min / 100) * SWEEP;
            const outer = polar(cx, cy, r + stroke / 2 + Math.round(size * 0.035), a);
            const inner = polar(cx, cy, r + stroke / 2 + Math.round(size * 0.012), a);
            return (
              <line
                key={b.min}
                className={`gauge-tick${target >= b.min ? ' passed' : ''}`}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
              />
            );
          })}

        {animated > 0.5 && (
          <circle className="gauge-marker" cx={marker.x} cy={marker.y} r={stroke * 0.34} style={{ fill: TONE_VAR[activeTone] }} />
        )}
      </svg>

        <div className="gauge-center">
          <span className="gauge-value tabular" style={{ fontSize: size * 0.23 }}>
            {animated.toFixed(0)}
            <span className="gauge-unit">%</span>
          </span>
          {delta !== undefined && (
            <span className={`gauge-delta ${delta >= 0 ? 'positive' : 'negative'}`}>
              {delta >= 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(1)}%
            </span>
          )}
        </div>
      </div>

      {/* Band name and label sit *below* the ring, in the arc's bottom gap. Inside it
          they had only ~76% of the diameter to work with, which clipped long labels
          like "Удовлетворительно". Out here they can use the full card width. */}
      {(showBand || label) && (
        <div className="gauge-caption" style={{ marginTop: -size * 0.2 }}>
          {showBand && <span className={`gauge-band ${activeTone}`}>{t(band.key)}</span>}
          {label && <span className="gauge-label">{label}</span>}
        </div>
      )}
    </div>
  );
}
