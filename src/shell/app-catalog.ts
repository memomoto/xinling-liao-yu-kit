/**
 * 供新外壳做侧栏 / 九宫格导航：纯函数，仅从注册表推导，无侧边栏耦合。
 */

import type { OsApp } from '../apps/registry';
import { APP_REGISTRY } from '../apps/registry';

export type AppSummaryEntry = Pick<OsApp, 'id' | 'title' | 'icon' | 'defaultWidth' | 'defaultHeight'>;

/** 表格态列表（可按标题排序，便于预览） */
export function listRegisteredAppsSorted(): AppSummaryEntry[] {
  const rows = Object.values(APP_REGISTRY).map(({ id, title, icon, defaultWidth, defaultHeight }) => ({
    id,
    title,
    icon,
    defaultWidth,
    defaultHeight,
  }));
  return rows.sort((a, b) => String(a.title).localeCompare(String(b.title), undefined, { sensitivity: 'base' }));
}

/** id → 是否在注册表（含运行时博客窗） */
export function isRegisteredAppId(id: string): boolean {
  return Boolean(APP_REGISTRY[id]);
}
