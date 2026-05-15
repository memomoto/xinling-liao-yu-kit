/**
 * 「心之花」SVG — greenhouse 与小置物架共用。
 */

import { useId } from 'react';

import type { HeartFlowerSpec } from '@/lib/heart-flower-model';
import {
  HEART_PETAL_SHARP_PATH,
  HEART_PETAL_SOFT_PATH,
  HEART_POT_PATH,
  HEART_STEM_PATH,
} from '@/lib/heart-flower-model';

export function HeartFlowerSvg({
  spec,
  t,
  glow,
  breathScale = 1,
  width = 140,
  height = 160,
}: {
  spec: HeartFlowerSpec;
  t: number;
  glow: boolean;
  breathScale?: number;
  width?: number;
  height?: number;
}) {
  const uid = useId().replace(/:/g, '');
  const gid = `grad-pot-${spec.id}-${uid}`;
  const fid = `glow-${spec.id}-${uid}`;
  const sharpOp = 1 - t;
  const softOp = t;

  return (
    <svg width={width} height={height} viewBox="-70 -90 140 170" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f5e6dc" />
          <stop offset="100%" stopColor="#dcb898" />
        </linearGradient>
        <filter id={fid} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={glow ? 4 : 2} result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g transform={`translate(0, -18) scale(${breathScale}) translate(0, 18)`}>
        <path d={HEART_STEM_PATH} fill="none" stroke="rgba(90,120,80,0.85)" strokeWidth="4" strokeLinecap="round" />

        <path
          d={HEART_POT_PATH}
          fill={`url(#${gid})`}
          stroke="#c9a88c"
          strokeWidth={1.2}
          opacity={0.95}
        />

        <g filter={glow ? `url(#${fid})` : undefined}>
          {Array.from({ length: 6 }).map((_, i) => (
            <g key={i} transform={`rotate(${i * 60})`}>
              <path
                d={HEART_PETAL_SHARP_PATH}
                fill={spec.sharp}
                opacity={sharpOp * 0.92 + 0.06}
                style={{ transition: 'opacity 0.55s ease' }}
              />
              <path
                d={HEART_PETAL_SOFT_PATH}
                fill={spec.soft}
                opacity={softOp * 0.96}
                style={{ transition: 'opacity 0.55s ease' }}
              />
            </g>
          ))}
          <circle r={11} fill={spec.centerSoft} opacity={softOp * 0.92} />
          <circle r={11} fill={spec.centerSharp} opacity={sharpOp * 0.85} />
        </g>
      </g>
    </svg>
  );
}
