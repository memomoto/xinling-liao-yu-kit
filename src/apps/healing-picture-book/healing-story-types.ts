/** 心灵绘本 — 共用类型（避免 config ↔ pages 循环依赖） */

export type StoryPage =
  | {
      id: string;
      kind: 'page';
      text: string;
      /** 插图 URL，有则显示图片；无则显示占位渐变 + emoji */
      image?: string;
      placeholderEmoji?: string;
      next: string;
    }
  | {
      id: string;
      kind: 'choice';
      text: string;
      image?: string;
      placeholderEmoji?: string;
      options: { label: string; nextId: string }[];
    }
  | {
      id: string;
      kind: 'ending';
      success: boolean;
      text: string;
      title?: string;
      image?: string;
      placeholderEmoji?: string;
    };

export interface StoryBook {
  title: string;
  subtitle?: string;
  startPageId: string;
  pages: Record<string, StoryPage>;
}
