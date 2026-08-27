import type { Trend } from './formulas';

export const pct = (v: number) => `${v.toFixed(1)}%`;

export const signedPct = (v: number) => `${v > 0 ? '+' : ''}${v.toFixed(1)}%`;

export const formatDate = (iso: string, locale: string = 'ru-RU') =>
  new Date(iso).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });

export const LOCALE_BY_LANG: Record<string, string> = { ru: 'ru-RU', en: 'en-US', tk: 'ru-RU' };

export const trendKey = (t: Trend) => `trend.${t}`;
export const assessmentKey = (type: string) => `assessment.${type}`;
export const attendanceKey = (status: string) => `attendance.${status}`;
export const behaviorKey = (type: string) => `behavior.${type}`;
