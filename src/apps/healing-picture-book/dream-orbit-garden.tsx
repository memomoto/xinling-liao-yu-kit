/**
 * 梦核轨道：静态背景 + 椭圆分布的选择球（不使用视频）
 */
import { useCallback, useEffect, useState } from 'react';
import { DREAM_STATIC_SRC } from './dream-assets';
import { HEALING_THEMES } from './healing-themes';

const FONT = '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif';

const ORBIT_ANGLES_DEG = [-90, -18, 54, 126, 198];

function orbitPosition(index: number): { left: string; top: string } {
  const deg = ORBIT_ANGLES_DEG[index] ?? -90 + index * 72;
  const rad = (deg * Math.PI) / 180;
  const rx = 39;
  const ry = 36;
  const cx = 50;
  const cy = 42;
  const x = cx + rx * Math.cos(rad);
  const y = cy + ry * Math.sin(rad);
  return { left: `${x}%`, top: `${y}%` };
}

export function DreamOrbitGarden({
  selectedIds,
  onToggleTheme,
}: {
  selectedIds: string[];
  onToggleTheme: (id: string) => void;
}) {
  const [orbsReady, setOrbsReady] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setOrbsReady(true), 200);
    return () => window.clearTimeout(t);
  }, []);

  const toggle = useCallback(
    (id: string) => {
      if (!orbsReady) return;
      onToggleTheme(id);
    },
    [orbsReady, onToggleTheme],
  );

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        position: 'relative',
        borderRadius: 18,
        overflow: 'hidden',
        fontFamily: FONT,
        background: 'linear-gradient(145deg, #fdf4ff 0%, #e0f2fe 100%)',
      }}
    >
      <style>{`
        @keyframes dream-orbit-pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1.12); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
        }
      `}</style>

      <img
        src={DREAM_STATIC_SRC}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
          zIndex: 1,
        }}
      />

      {HEALING_THEMES.map((theme, index) => {
        const pos = orbitPosition(index);
        const selected = selectedIds.includes(theme.id);
        const size = 'clamp(58px, 12vmin, 96px)';
        const scale = selected ? 1.22 : orbsReady ? 1.12 : 0.85;
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => toggle(theme.id)}
            aria-pressed={selected}
            style={{
              position: 'absolute',
              left: pos.left,
              top: pos.top,
              transform: `translate(-50%, -50%) scale(${scale})`,
              transition: 'transform 0.45s ease, box-shadow 0.25s ease',
              zIndex: 2,
              width: size,
              height: size,
              borderRadius: '50%',
              border: selected ? '3px solid rgba(236, 72, 153, 0.85)' : '2px solid rgba(255,255,255,0.75)',
              cursor: orbsReady ? 'pointer' : 'default',
              background: selected
                ? 'linear-gradient(160deg, #fce7f3, #ddd6fe)'
                : 'linear-gradient(160deg, #fffbeb, #e0f2fe)',
              boxShadow: selected ? '0 12px 34px rgba(219, 39, 119, 0.35)' : '0 6px 22px rgba(30, 58, 138, 0.12)',
              padding: 8,
              animation: orbsReady ? 'dream-orbit-pulse 5.2s ease-in-out infinite' : undefined,
              animationDelay: `${index * 0.25}s`,
              color: '#4c1d57',
              fontSize: 'clamp(10px, 2.8vmin, 12px)',
              fontWeight: 700,
              lineHeight: 1.25,
              textAlign: 'center',
            }}
          >
            {theme.shortLabel}
          </button>
        );
      })}
    </div>
  );
}
