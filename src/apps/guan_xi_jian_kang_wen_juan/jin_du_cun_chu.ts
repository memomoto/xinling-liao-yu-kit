/** 与同目录独立 HTML 可共用进度（同源时） */
export const REL_HEALTH_QUIZ_KEY = 'relationship_health_quiz_v1';

export type QuizPersist = {
  answers: (number | null)[];
  currentIdx: number;
  phase: 'quiz' | 'result';
};

const TOTAL = 16;

export function emptyAnswers(): (number | null)[] {
  return Array.from({ length: TOTAL }, () => null);
}

export function loadQuizPersist(): QuizPersist | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(REL_HEALTH_QUIZ_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<QuizPersist>;
    if (!o || typeof o !== 'object') return null;
    if (!Array.isArray(o.answers) || o.answers.length !== TOTAL) return null;
    const answers = o.answers.map((a) =>
      typeof a === 'number' && a >= 0 && a <= 3 ? a : null,
    ) as (number | null)[];
    const currentIdx =
      typeof o.currentIdx === 'number' &&
      o.currentIdx >= 0 &&
      o.currentIdx < TOTAL &&
      Number.isFinite(o.currentIdx)
        ? o.currentIdx
        : 0;
    const phase = o.phase === 'result' ? 'result' : 'quiz';
    return { answers, currentIdx, phase };
  } catch {
    return null;
  }
}

export function saveQuizPersist(p: QuizPersist): void {
  try {
    localStorage.setItem(REL_HEALTH_QUIZ_KEY, JSON.stringify(p));
  } catch {
    /* */
  }
}

export function clearQuizPersist(): void {
  try {
    localStorage.removeItem(REL_HEALTH_QUIZ_KEY);
  } catch {
    /* */
  }
}
