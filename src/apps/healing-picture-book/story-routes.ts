/**
 * 两个主题组合 → 对应哪一本绘本
 * 新增绘本：在此注册 pairKey，并在 healing-stories.config 的 ALL_STORY_BOOKS 里加入数据
 */
export type StoryBookId = 'xiaoci';

const ROUTES: Record<string, StoryBookId> = {
  // 《小刺的柔软铠甲》— 原生家庭 × CPTSD（顺序无关）
  'cptsd+family': 'xiaoci',
};

export function pairKey(a: string, b: string): string {
  return [a, b].sort().join('+');
}

export function resolveStoryBookId(themeA: string, themeB: string): StoryBookId | null {
  const key = pairKey(themeA, themeB);
  return ROUTES[key] ?? null;
}
