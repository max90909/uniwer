import { useAnimatedNumber } from '../lib/useAnimatedNumber';

interface Props {
  label: string;
  value?: string;
  sub?: string;
  tone?: 'positive' | 'negative' | 'neutral';
  /** When set, animates a count-up from 0 to this number instead of showing `value` statically. */
  numeric?: number;
  numericSuffix?: string;
  numericDecimals?: number;
}

export function StatTile({ label, value, sub, tone = 'neutral', numeric, numericSuffix = '', numericDecimals = 1 }: Props) {
  const animated = useAnimatedNumber(numeric ?? 0);
  const display = numeric !== undefined ? `${animated.toFixed(numericDecimals)}${numericSuffix}` : value;

  return (
    <div className="card stat-tile">
      <span className="label">{label}</span>
      <span className="value tabular">{display}</span>
      {sub && <span className={`sub ${tone !== 'neutral' ? tone : ''}`}>{sub}</span>}
    </div>
  );
}
