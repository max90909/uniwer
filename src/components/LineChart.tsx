import { useI18n } from '../i18n';

interface Point {
  label: string;
  value: number;
}

// Catmull-Rom -> cubic Bezier smoothing, so the line reads as a soft curve
// instead of sharp straight segments between weekly/monthly points.
function smoothPath(xs: number[], ys: number[]) {
  if (xs.length < 2) return '';
  if (xs.length === 2) return `M ${xs[0]} ${ys[0]} L ${xs[1]} ${ys[1]}`;
  let d = `M ${xs[0]} ${ys[0]}`;
  for (let i = 0; i < xs.length - 1; i++) {
    const x0 = xs[i - 1] ?? xs[i];
    const y0 = ys[i - 1] ?? ys[i];
    const x1 = xs[i];
    const y1 = ys[i];
    const x2 = xs[i + 1];
    const y2 = ys[i + 1];
    const x3 = xs[i + 2] ?? x2;
    const y3 = ys[i + 2] ?? y2;
    const cp1x = x1 + (x2 - x0) / 6;
    const cp1y = y1 + (y2 - y0) / 6;
    const cp2x = x2 - (x3 - x1) / 6;
    const cp2y = y2 - (y3 - y1) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
  }
  return d;
}

export function LineChart({ points, height = 180 }: { points: Point[]; height?: number }) {
  const { t } = useI18n();
  if (points.length === 0) return <div className="empty-note">{t('common.noData')}</div>;

  const gradId = 'chart-fill-' + Math.round(points.reduce((a, p) => a + p.value, 0) * 7 + points.length);
  const width = 640;
  const padTop = 26;
  const padBottom = 28;
  const padLeft = 10;
  const padRight = 14;
  const innerH = height - padTop - padBottom;
  const innerW = width - padLeft - padRight;

  const max = Math.max(100, ...points.map((p) => p.value));
  const min = Math.min(0, ...points.map((p) => p.value));
  const span = max - min || 1;

  const x = (i: number) => padLeft + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => padTop + innerH - ((v - min) / span) * innerH;

  const xs = points.map((_, i) => x(i));
  const ys = points.map((p) => y(p.value));

  const linePath = smoothPath(xs, ys);
  const areaPath = `${linePath} L ${xs[xs.length - 1]} ${padTop + innerH} L ${xs[0]} ${padTop + innerH} Z`;

  const gridLines = [0, 25, 50, 75, 100].filter((g) => g >= min && g <= max);
  const lastIdx = points.length - 1;
  const showEvery = points.length <= 6 ? 1 : Math.ceil(points.length / 6);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label={t('student.monthlyChart')}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="chart-grad-a" />
          <stop offset="100%" className="chart-grad-b" />
        </linearGradient>
        <filter id="chart-glow" x="-40%" y="-40%" width="180%" height="180%">
          {/* style, not attributes: var() does not resolve in SVG presentation attributes */}
          <feDropShadow dx="0" dy="2" stdDeviation="3" style={{ floodColor: 'var(--accent)', floodOpacity: 0.35 }} />
        </filter>
      </defs>

      {gridLines.map((g) => (
        <line key={g} x1={padLeft} x2={width - padRight} y1={y(g)} y2={y(g)} className="chart-grid" />
      ))}

      <path d={areaPath} className="chart-area" fill={`url(#${gradId})`} />
      <path d={linePath} className="chart-line" filter="url(#chart-glow)" />

      {points.map((p, i) => {
        if (i !== lastIdx && i !== 0 && i % showEvery !== 0) return null;
        const isEnd = i === lastIdx;
        return (
          <g key={i}>
            {isEnd && <circle cx={x(i)} cy={y(p.value)} r={8} className="chart-dot-halo" />}
            <circle cx={x(i)} cy={y(p.value)} r={isEnd ? 5.5 : 3.5} className={`chart-dot${isEnd ? ' end' : ''}`} />
          </g>
        );
      })}

      {points.map((p, i) =>
        i === lastIdx ? (
          <text key="v" x={x(i)} y={y(p.value) - 14} textAnchor="end" className="chart-value-label">
            {p.value.toFixed(1)}%
          </text>
        ) : null
      )}

      {points.map((p, i) =>
        i === 0 || i === lastIdx || points.length <= 6 ? (
          <text key={`l-${i}`} x={x(i)} y={height - 8} textAnchor="middle" className="chart-axis-label">
            {p.label}
          </text>
        ) : null
      )}
    </svg>
  );
}
