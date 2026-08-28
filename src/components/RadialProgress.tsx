import { useId } from 'react';
import { useAnimatedNumber } from '../lib/useAnimatedNumber';
import { clampPct, scoreTone, TONE_VAR, TONE_VAR_SOFT, type Tone } from '../lib/score';

interface Props {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  /** Defaults to the grade band's colour; pass a tone to override. */
  tone?: Tone;
}

/**
 * Compact closed ring — the small sibling of <ScoreGauge>, for places that need a
 * percentage inline (list rows, tiles) rather than as the focus of a card.
 */
export function RadialProgress({ value, size = 108, strokeWidth, label, tone }: Props) {
  const uid = useId().replace(/:/g, '');
  const target = clampPct(value);
  const animated = useAnimatedNumber(target);
  const activeTone = tone ?? scoreTone(target);

  const stroke = strokeWidth ?? Math.max(7, Math.round(size * 0.085));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - animated / 100);

  return (
    <div className="radial" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <defs>
          {/* `style` rather than stopColor — var() does not resolve in SVG
              presentation attributes. */}
          <linearGradient id={`r-${uid}`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" style={{ stopColor: TONE_VAR_SOFT[activeTone] }} />
            <stop offset="100%" style={{ stopColor: TONE_VAR[activeTone] }} />
          </linearGradient>
        </defs>
        <circle className="radial-track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} />
        <circle
          className="radial-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          stroke={`url(#r-${uid})`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="radial-center">
        <span className="radial-value tabular" style={{ fontSize: size * 0.23 }}>
          {animated.toFixed(0)}%
        </span>
        {label && <span className="radial-label">{label}</span>}
      </div>
    </div>
  );
}
