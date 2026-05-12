/** 与同目录独立 HTML 可共用进度（同源时）；键名可与 HTML localStorage 对齐 */
export const TRAUMA_ASSESSMENT_KEY = 'trauma_type_assessment_v1';

export type QuizPersist = {
  answers: (number | null)[];
  currentIdx: number;
  phase: 'quiz' | 'result';
};

const TOTAL = 12;

export function emptyAnswers(): (number | null)[] {
  return Array.from({ length: TOTAL }, () => null);
}

export function loadQuizPersist(): QuizPersist | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(TRAUMA_ASSESSMENT_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as Partial<QuizPersist>;
    if (!o || typeof o !== 'object') return null;
    if (!Array.isArray(o.answers) || o.answers.length !== TOTAL) return null;
    const answers = o.answers.map((a) =>
      typeof a === 'number' && a >= 0 && a <= 2 ? a : null,
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
    localStorage.setItem(TRAUMA_ASSESSMENT_KEY, JSON.stringify(p));
  } catch {
    /* */
  }
}
