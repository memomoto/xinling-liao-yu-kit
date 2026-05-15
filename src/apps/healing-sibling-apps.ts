/**
 * 疗愈书房书架「姊妹应用」id 列表（顺序即书脊顺序）。
 * 与 `APP_REGISTRY` 中的枢纽 / 独立窗 id 对齐。
 */

export const HEALING_TOOLBOX_SIBLING_APP_IDS = [
  'mindSpaceHub',
  'dailyRepairHub',
  'selfKnowledgeHub',
  'healingPlayHub',
  'emotionReleaseStation',
  'siteReadme',
] as const;

export type HealingToolboxSiblingAppId = (typeof HEALING_TOOLBOX_SIBLING_APP_IDS)[number];
