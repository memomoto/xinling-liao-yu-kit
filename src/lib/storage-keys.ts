/**
 * 全局 localStorage 键名与启动迁移；业务键保持与历史一致，避免已存数据失效。
 */

export const STORAGE_VERSION = 1;

export const STORAGE_KEYS = {
  APP_VERSION: 'xinling-kit:storage-version',
  THEME: 'xinling-kit:theme',
  STUDY_ROOM_DRAWING: 'healing-study-room-drawing-v1',
  XIAONUAN_MAIL: 'xinling-xiaonuan-mail-v1',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export function storageGet<T>(key: StorageKey, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function storageSet<T>(key: StorageKey, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('[storage] 写入失败:', key, e);
  }
}

export function storageRemove(key: StorageKey): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function readVersion(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.APP_VERSION);
    if (raw === null) return 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

/** 启动时执行一次：将来可按版本做键名迁移 */
export function runStorageMigration(): void {
  const saved = readVersion();
  if (saved >= STORAGE_VERSION) return;

  try {
    localStorage.setItem(STORAGE_KEYS.APP_VERSION, String(STORAGE_VERSION));
  } catch {
    /* ignore */
  }
  console.info(`[storage] 存储版本已更新为 v${STORAGE_VERSION}`);
}

export type ThemeName = 'dark' | 'paper';

/** 从本地恢复 `document.documentElement.dataset.theme` */
export function initThemeFromStorage(): void {
  let theme: ThemeName = 'dark';
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.THEME);
    if (raw != null) {
      const v = raw.startsWith('"') ? (JSON.parse(raw) as string) : raw;
      if (v === 'paper' || v === 'dark') theme = v;
    }
  } catch {
    /* ignore */
  }
  document.documentElement.dataset.theme = theme;
}

export function persistTheme(theme: ThemeName): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch {
    /* ignore */
  }
  document.documentElement.dataset.theme = theme;
}
