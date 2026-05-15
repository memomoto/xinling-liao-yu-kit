/** 与主站一致的 localStorage 键，便于同域迁移时沿用固定项 */
export const MOE_DOCK_PINNED_APP_IDS_KEY = 'moe:dockPinnedAppIds:v1';

export function readPinnedDockAppIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MOE_DOCK_PINNED_APP_IDS_KEY);
    if (!raw) return [];
    const p = JSON.parse(raw) as unknown;
    return Array.isArray(p) ? p.filter((id): id is string => typeof id === 'string' && id.length > 0) : [];
  } catch {
    return [];
  }
}

export function writePinnedDockAppIds(ids: string[]): void {
  try {
    localStorage.setItem(MOE_DOCK_PINNED_APP_IDS_KEY, JSON.stringify(ids));
  } catch {
    /* 隐私模式等 */
  }
}
