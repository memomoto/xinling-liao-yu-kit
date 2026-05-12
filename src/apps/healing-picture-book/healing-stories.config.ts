/**
 * 心灵绘本 — 入口配置；剧情节点见 xiaoci-pages.ts
 */

import type { StoryBook } from './healing-story-types';
import { XIAOCI_PAGES } from './xiaoci-pages';

export type { StoryPage, StoryBook } from './healing-story-types';

export const STORY_BOOK: StoryBook = {
  title: '《小刺的柔软铠甲》',
  subtitle: '绘本游戏故事',
  startPageId: 'open1',
  pages: XIAOCI_PAGES,
};

/** 所有已上线绘本（按 id 取） */
export const ALL_STORY_BOOKS: Record<'xiaoci', StoryBook> = {
  xiaoci: STORY_BOOK,
};

export function getStoryBook(id: keyof typeof ALL_STORY_BOOKS): StoryBook {
  return ALL_STORY_BOOKS[id];
}
