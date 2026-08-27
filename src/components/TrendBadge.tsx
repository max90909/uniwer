import type { Trend } from '../lib/formulas';
import { trendKey } from '../lib/format';
import { useT } from '../i18n';

const ARROW: Record<Trend, string> = { up: '↑', down: '↓', flat: '→' };

export function TrendBadge({ trend }: { trend: Trend }) {
  const t = useT();
  const tone = trend === 'up' ? 'positive' : trend === 'down' ? 'negative' : 'neutral';
  return (
    <span className={`badge ${tone}`}>
      {ARROW[trend]} {t(trendKey(trend))}
    </span>
  );
}
