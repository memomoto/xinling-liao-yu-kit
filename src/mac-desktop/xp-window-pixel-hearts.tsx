/**
 * 窗口内侧边缘像素风小爱心（与主站一致）。
 */
import { useSyncExternalStore, type CSSProperties } from 'react';

import { ENABLE_XP_WINDOW_PIXEL_HEARTS, LS_XP_PIXEL_HEARTS_OFF } from '@/config/shell-decor.config';

const ROWS = ['.##..##.', '########', '########', '.######.', '..####..', '...##...'];

function PixelHeartIcon({ widthPx, className }: { widthPx: number; className?: string }) {
  const h = (widthPx * 6) / 8;
  return (
    <svg
      className={className}
      width={widthPx}
      height={h}
      viewBox="0 0 8 6"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      style={{
        display: 'block',
        imageRendering: 'pixelated',
        shapeRendering: 'crispEdges',
      }}
    >
      {ROWS.map((row, y) =>
        [...row].map((c, x) =>
          c === '#' ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="currentColor" /> : null,
        ),
      )}
    </svg>
  );
}

function readHeartsOff(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(LS_XP_PIXEL_HEARTS_OFF) === '1';
  } catch {
    return false;
  }
}

function subscribeHeartsOff(cb: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', cb);
  return () => window.removeEventListener('storage', cb);
}

type XpWindowPixelHeartsProps = {
  maximized: boolean;
};

export function XpWindowPixelHearts({ maximized }: XpWindowPixelHeartsProps) {
  const userOff = useSyncExternalStore(subscribeHeartsOff, readHeartsOff, () => false);

  if (!ENABLE_XP_WINDOW_PIXEL_HEARTS || userOff || maximized) return null;

  const spots: Array<{
    key: string;
    style: CSSProperties;
    w: number;
    delay: string;
    color: string;
  }> = [
    { key: 'tl', style: { top: 46, left: 8 }, w: 11, delay: '0s', color: 'rgba(236, 72, 153, 0.48)' },
    { key: 'tr', style: { top: 52, right: 72 }, w: 9, delay: '0.55s', color: 'rgba(219, 39, 119, 0.42)' },
    { key: 'lm', style: { top: '38%', left: 5 }, w: 13, delay: '1.1s', color: 'rgba(244, 114, 182, 0.4)' },
    { key: 'lm2', style: { top: '62%', left: 6 }, w: 10, delay: '0.35s', color: 'rgba(236, 72, 153, 0.36)' },
    { key: 'rm', style: { top: '34%', right: 6 }, w: 12, delay: '0.8s', color: 'rgba(219, 39, 119, 0.38)' },
    { key: 'rm2', style: { top: '66%', right: 5 }, w: 9, delay: '1.35s', color: 'rgba(244, 114, 182, 0.44)' },
    { key: 'bl', style: { bottom: 14, left: 10 }, w: 10, delay: '0.2s', color: 'rgba(236, 72, 153, 0.4)' },
    { key: 'br', style: { bottom: 12, right: 12 }, w: 12, delay: '0.95s', color: 'rgba(219, 39, 119, 0.36)' },
  ];

  return (
    <>
      <style>{`
        @keyframes fmXpHeartPulse {
          0%, 100% { transform: scale(0.88); opacity: 0.82; }
          42% { transform: scale(1.14); opacity: 1; }
          68% { transform: scale(0.94); opacity: 0.9; }
        }
        .fm-xp-ph-beat {
          animation: fmXpHeartPulse 2.85s ease-in-out infinite;
          transform-origin: center center;
        }
        @media (prefers-reduced-motion: reduce) {
          .fm-xp-ph-beat { animation: none !important; transform: none; opacity: 0.85 !important; }
        }
      `}</style>
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 4,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        {spots.map((s) => (
          <div
            key={s.key}
            className="fm-xp-ph-beat"
            style={{
              position: 'absolute',
              color: s.color,
              animationDelay: s.delay,
              ...s.style,
            }}
          >
            <PixelHeartIcon widthPx={s.w} />
          </div>
        ))}
      </div>
    </>
  );
}
