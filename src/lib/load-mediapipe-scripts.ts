/** 按需加载 MediaPipe Hands + Camera utils（CDN），避免首屏阻塞 */

const MEDIAPIPE_MARKERS = [
  { src: 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js', mark: 'mp-camera-utils' },
  { src: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js', mark: 'mp-hands' },
] as const;

let loadPromise: Promise<void> | null = null;

export function loadMediapipeHandScripts(): Promise<void> {
  if (typeof document === 'undefined') return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = Promise.all(
    MEDIAPIPE_MARKERS.map(
      ({ src, mark }) =>
        new Promise<void>((resolve, reject) => {
          if (document.querySelector(`script[data-flow-mp="${mark}"]`)) {
            resolve();
            return;
          }
          const s = document.createElement('script');
          s.src = src;
          s.async = true;
          s.dataset.flowMp = mark;
          s.onload = () => resolve();
          s.onerror = () => reject(new Error(`MediaPipe 脚本加载失败: ${src}`));
          document.head.appendChild(s);
        }),
    ),
  ).then(() => undefined);

  return loadPromise;
}
