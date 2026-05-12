/**
 * 应用中已有 CustomEvent 约定；新外壳若需程序化打开路由/面板，应保持事件名一致。
 */
/** 程序化切换侧栏应用时使用此事件名 */
export const HEALING_OPEN_APP_EVENT = 'healing-kit-open-app' as const;

export type OpenWindowDetail =
  | string
  | {
      id: string;
      title?: string;
      icon?: string;
    };
