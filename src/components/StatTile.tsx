interface Props {
  label: string;
  value: string;
  sub?: string;
  tone?: 'positive' | 'negative' | 'neutral';
}

export function StatTile({ label, value, sub, tone = 'neutral' }: Props) {
  return (
    <div className="card stat-tile">
      <span className="label">{label}</span>
      <span className="value tabular">{value}</span>
      {sub && <span className={`sub ${tone !== 'neutral' ? tone : ''}`}>{sub}</span>}
    </div>
  );
}
