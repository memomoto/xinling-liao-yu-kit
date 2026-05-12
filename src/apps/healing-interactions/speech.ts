/**
 * 浏览器 SpeechRecognition（Chrome / Edge；需 HTTPS 或 localhost）。
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnySpeechRecognition = any;

export function getSpeechRecognitionCtor(): (new () => AnySpeechRecognition) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => AnySpeechRecognition;
    webkitSpeechRecognition?: new () => AnySpeechRecognition;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}
