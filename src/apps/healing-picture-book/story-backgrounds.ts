/**
 * 各剧情节点对应的插画（public/assets/healing/story/）
 * 单页可再在 xiaoci-pages 里写 image 覆盖此处。
 */
export const STORY_PAGE_BACKGROUNDS: Record<string, string> = {
  // 开篇 · 木屋与「怪物」
  open1: '/assets/healing/story/art-09-cottage-door.png',
  open2: '/assets/healing/story/art-09-cottage-door.png',
  open3: '/assets/healing/story/art-09-cottage-door.png',
  open4: '/assets/healing/story/art-09-cottage-door.png',
  open5: '/assets/healing/story/art-09-cottage-door.png',
  open6: '/assets/healing/story/art-08-box-tears.png',

  c1: '/assets/healing/story/art-08-box-tears.png',

  // 分支一：缩紧、上学、路边
  b1p1: '/assets/healing/story/art-08-box-tears.png',
  b1p2: '/assets/healing/story/art-08-box-tears.png',
  b1p3: '/assets/healing/story/art-01-trash-spill.png',
  c2: '/assets/healing/story/art-01-trash-spill.png',
  end_b1_c2_fail: '/assets/healing/story/art-08-box-tears.png',
  b1_ok: '/assets/healing/story/art-07-monster-flowers.png',

  // 分支二：画画、野花
  b2p1: '/assets/healing/story/art-03-paint-sad.png',
  b2p2: '/assets/healing/story/art-03-paint-sad.png',
  b2p3: '/assets/healing/story/art-04-paint-hope.png',
  c3: '/assets/healing/story/art-02-window-joy.png',
  end_b2_fail: '/assets/healing/story/art-06-trash-discard.png',
  b2_ok: '/assets/healing/story/art-07-monster-flowers.png',

  // 分支三：敲门、张奶奶
  b3p1: '/assets/healing/story/art-09-cottage-door.png',
  b3p2: '/assets/healing/story/art-09-cottage-door.png',
  c4: '/assets/healing/story/art-02-window-joy.png',
  end_b3_fail: '/assets/healing/story/art-08-box-tears.png',
  b3_ok: '/assets/healing/story/art-04-paint-hope.png',

  // 核心剧情与结局
  core1: '/assets/healing/story/art-02-window-joy.png',
  core2: '/assets/healing/story/art-02-window-joy.png',
  core3: '/assets/healing/story/art-02-window-joy.png',
  c_final: '/assets/healing/story/art-07-monster-flowers.png',
  end_good: '/assets/healing/story/art-02-window-joy.png',
  end_bad: '/assets/healing/story/art-08-box-tears.png',
};

export function resolveStoryBackground(pageId: string, explicitImage?: string): string | undefined {
  if (explicitImage) return explicitImage;
  return STORY_PAGE_BACKGROUNDS[pageId];
}
