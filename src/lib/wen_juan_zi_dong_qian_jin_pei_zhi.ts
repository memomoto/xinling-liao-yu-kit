/**
 * 选择题问卷共用偏好：是否在选中选项后自动进入下一题（关系健康问卷、创伤自测等）。
 */
export const QUIZ_AUTO_ADVANCE_PREF_KEY = 'quiz_auto_advance_after_choice_v1';

export function loadQuizAutoAdvancePref(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const v = localStorage.getItem(QUIZ_AUTO_ADVANCE_PREF_KEY);
    if (v === null) return false;
    return v === '1' || v === 'true';
  } catch {
    return false;
  }
}

export function saveQuizAutoAdvancePref(on: boolean): void {
  try {
    localStorage.setItem(QUIZ_AUTO_ADVANCE_PREF_KEY, on ? '1' : '0');
  } catch {
    /* */
  }
}
