/**
 * 将来若加装饰贴图，请放到 `public/` 并把下方路径换掉（均为 null = 仅占位）。
 * 建议意象：柔和提灯、灯塔、浅水救生圈 — 见用户文档「危机支持页」方向。
 */
export const GROUNDING_ASSET_REPLACE = {
  cornerDecor: null as string | null,
  stepBgNoise: null as string | null,
  /** 图标仍由 registry 配置；可把柔和版 ico/png 放进 public 后改 registry */
  dockIconSuggested: '/assets/icons/app-icons/about-me.png',
} as const;
