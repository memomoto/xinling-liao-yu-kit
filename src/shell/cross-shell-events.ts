/**
 * 应用中已有 CustomEvent 约定；新外壳若需程序化打开路由/面板，应保持事件名一致。
 */
/** 程序化切换侧栏应用时使用此事件名 */
export const HEALING_OPEN_APP_EVENT = 'healing-kit-open-app' as const;
/**
 * Mac 窗口内疗愈工具箱：切换左侧选中模块（不经过 `openWindow`，避免整块重挂载）。
 */
export const HEALING_TOOLBOX_SELECT_MODULE_EVENT = 'healing-kit-toolbox-select-module' as const;

export type OpenWindowDetail =
  | string
  | {
      id: string;
      title?: string;
      icon?: string;
    };
