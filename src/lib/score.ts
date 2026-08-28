/**
 * Grade bands — one source of truth for "what colour is this percentage".
 *
 * Every percentage on screen (radial gauges, bars, badges, table cells) reads its
 * colour from here, so a 62% never shows up green in one card and amber in the next.
 * Bands are ordered high → low; `scoreBand` returns the first one the value clears.
 */

export type Tone = 'positive' | 'good' | 'accent' | 'warning' | 'negative';

export interface Band {
  /** Inclusive lower bound of the band, in percent. */
  min: number;
  tone: Tone;
  /** i18n key for the human label ("Отлично", "Good", …). */
  key: string;
}

/**
 * The ramp must read as ascending at a glance: red → amber → teal → green.
 * The brand accent is *also* the negative red, so using it for "good" made a 73%
 * look more alarming than a 64% — hence the separate teal step in the middle.
 */
export const BANDS: Band[] = [
  { min: 85, tone: 'positive', key: 'band.excellent' },
  { min: 70, tone: 'good', key: 'band.good' },
  { min: 55, tone: 'warning', key: 'band.fair' },
  { min: 0, tone: 'negative', key: 'band.weak' },
];

export function scoreBand(value: number): Band {
  return BANDS.find((b) => value >= b.min) ?? BANDS[BANDS.length - 1];
}

export function scoreTone(value: number): Tone {
  return scoreBand(value).tone;
}

/** CSS custom property holding the colour for a tone. */
export const TONE_VAR: Record<Tone, string> = {
  positive: 'var(--positive)',
  good: 'var(--good)',
  accent: 'var(--accent)',
  warning: 'var(--warning)',
  negative: 'var(--negative)',
};

/** Lighter end of the tone's gradient, used as the arc/bar sweep start. */
export const TONE_VAR_SOFT: Record<Tone, string> = {
  positive: 'var(--positive-lift)',
  good: 'var(--good-lift)',
  accent: 'var(--accent-lift)',
  warning: 'var(--warning-lift)',
  negative: 'var(--negative-lift)',
};

export const clampPct = (v: number) => Math.max(0, Math.min(100, Number.isFinite(v) ? v : 0));
