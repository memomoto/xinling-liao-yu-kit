/**
 * 疗愈花园与其它应用间的松耦合通信（CustomEvent）。
 * 仅派发事件，由各应用各自 import，避免环形依赖。
 */
export const ZHI_YU_HUA_YUAN_EVENT = 'moe:healing-garden-grow-v1';

export type ZhiYuHuaYuanGrowDetail =
  /** 复原力练习里任意一项「完成」同一天只计一次 */
  | { source: 'fu_yuan_li_wan_cheng'; day: string }
  /** 科普：当天每打开一篇文章计一次养分，至多 3 次/天（防刷列表） */
  | { source: 'kepu_yue_du'; articleId: string }
  /** 5-4-3-2-1 着陆 / 蓝屏急救包等「回到当下」练习：同一天只计一次养分 */
  | { source: 'zhuo_lu_wan_cheng'; day: string }
  /** 自愈档案「读取下一章」：同一天只计一次养分（意象：日记种子） */
  | { source: 'zi_yu_dang_an_jin_du'; day: string };

export function faSongHuaYuanGrow(detail: ZhiYuHuaYuanGrowDetail): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ZHI_YU_HUA_YUAN_EVENT, { detail }));
}

/** 存档已写入（同源 tab 内需手动派发，才能让 React 视图同步） */
export const ZHI_YU_HUA_YUAN_STORE_GAI_LE = 'moe:healing-garden-store-changed-v1';

export function faBuHuaYuanCunchuYiGengLe(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(ZHI_YU_HUA_YUAN_STORE_GAI_LE));
}
