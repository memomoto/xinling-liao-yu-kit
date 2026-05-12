/** 与独立 HTML 页一致：同域时可延续已有进度 */
export const RESILIENCE_STORAGE_KEY = 'resilience_practice_v2';

export interface ResilienceStore {
  days: Record<string, Record<string, boolean>>;
  drafts: Record<string, string>;
}

export function loadResilienceStore(): ResilienceStore {
  if (typeof window === 'undefined') return { days: {}, drafts: {} };
  try {
    const raw = localStorage.getItem(RESILIENCE_STORAGE_KEY);
    if (!raw) return { days: {}, drafts: {} };
    const o = JSON.parse(raw) as Partial<ResilienceStore>;
    if (!o || typeof o !== 'object') return { days: {}, drafts: {} };
    return {
      days: typeof o.days === 'object' && o.days ? o.days : {},
      drafts: typeof o.drafts === 'object' && o.drafts ? o.drafts : {},
    };
  } catch {
    return { days: {}, drafts: {} };
  }
}

export function saveResilienceStore(state: ResilienceStore): void {
  try {
    localStorage.setItem(RESILIENCE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function isoDate(dt: Date): string {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function weekDatesContaining(d: Date): string[] {
  const day = d.getDay();
  const monOffset = day === 0 ? -6 : 1 - day;
  const mon = new Date(d.getFullYear(), d.getMonth(), d.getDate() + monOffset);
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const x = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i);
    dates.push(isoDate(x));
  }
  return dates;
}

export function dayHadAnyPractice(store: ResilienceStore, ymd: string): boolean {
  const rec = store.days[ymd];
  return Boolean(rec && typeof rec === 'object' && Object.keys(rec).length > 0);
}

export function streakCount(store: ResilienceStore): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const todayY = isoDate(d);
  if (!dayHadAnyPractice(store, todayY)) d.setDate(d.getDate() - 1);
  let streak = 0;
  const cursor = new Date(d.getTime());
  for (let g = 0; g < 366; g++) {
    const ymd = isoDate(cursor);
    if (!dayHadAnyPractice(store, ymd)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
