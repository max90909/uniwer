export function ProgressBar({ value, max = 100 }: { value: number; max?: number }) {
  const width = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="progress-bar" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <span style={{ width: `${width}%` }} />
    </div>
  );
}
