/** 书房投影幕布：手绘签名持久化（同源 localStorage，可被其它模块写入） */

import { STORAGE_KEYS } from '@/lib/storage-keys';

export const STUDY_ROOM_DRAWING_STORAGE_KEY = STORAGE_KEYS.STUDY_ROOM_DRAWING;

export const STUDY_ROOM_DRAWING_UPDATED_EVENT = 'healing-study-room-drawing-updated' as const;

export function loadStudyRoomDrawing(): string | null {
  try {
    const v = localStorage.getItem(STUDY_ROOM_DRAWING_STORAGE_KEY);
    if (!v || !v.startsWith('data:image')) return null;
    return v;
  } catch {
    return null;
  }
}

export function saveStudyRoomDrawing(dataUrl: string): void {
  try {
    localStorage.setItem(STUDY_ROOM_DRAWING_STORAGE_KEY, dataUrl);
    window.dispatchEvent(new CustomEvent(STUDY_ROOM_DRAWING_UPDATED_EVENT));
  } catch {
    /* quota or disabled */
  }
}

export function clearStudyRoomDrawing(): void {
  try {
    localStorage.removeItem(STUDY_ROOM_DRAWING_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(STUDY_ROOM_DRAWING_UPDATED_EVENT));
  } catch {
    /* ignore */
  }
}
