/**
 * 回家的路 —— 轻柔改写画面：偏振梦境色调 +「水彩」虚化 + 花影叠层；
 * 底图不包含真实阶梯照片，仅以发光方块通向云端的抽象意象为伴。
 */

import { useCallback, useMemo, useState } from 'react';

const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif';

function CloudStepsBg() {
  const blocks = useMemo(
    () =>
      [0, 1, 2, 3, 4, 5, 6].map((i) => ({
        left: `${12 + i * 9}%`,
        bottom: `${4 + i * 7}%`,
        w: 42 + i * 8,
        h: 18 + (i % 3) * 5,
        rot: -6 + (i % 4) * 4,
        delay: `${i * 0.55}s`,
      })),
    []
  );
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: 0.92,
      }}
    >
      <style>{`
        @keyframes hjdFloat {
          0%, 100% { transform: translateY(0); filter: brightness(1.08); }
          50% { transform: translateY(-7px); filter: brightness(1.35); }
        }
      `}</style>
      {blocks.map((b, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            left: b.left,
            bottom: b.bottom,
            width: b.w,
            height: b.h,
            transform: `rotate(${b.rot}deg)`,
            borderRadius: 10,
            background:
              'linear-gradient(135deg, rgba(255,250,252,0.55) 0%, rgba(200,226,255,0.32) 50%, rgba(180,215,250,0.22) 100%)',
            boxShadow:
              '0 0 22px 6px rgba(160,215,255,0.45), inset 0 1px 0 rgba(255,255,255,0.75)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            animation: `hjdFloat ${6 + idx * 0.35}s ease-in-out infinite`,
            animationDelay: b.delay,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          left: '8%',
          top: '-6%',
          width: '140%',
          height: '72%',
          background:
            'radial-gradient(ellipse 70% 55% at 50% -5%, rgba(240,248,255,0.92) 0%, rgba(235,246,255,0.4) 45%, transparent 72%)',
        }}
      />
    </div>
  );
}

const FLOWER_SLOTS = [
  { t: '12%', l: '68%', sz: 22 },
  { t: '52%', l: '18%', sz: 18 },
  { t: '72%', l: '62%', sz: 26 },
  { t: '28%', l: '42%', sz: 20 },
  { t: '64%', l: '80%', sz: 16 },
  { t: '38%', l: '12%', sz: 19 },
  { t: '82%', l: '36%', sz: 21 },
];

function BlossomLayer({ strength }: { strength: number }) {
  const op = strength / 100;
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {FLOWER_SLOTS.map((fl, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: fl.t,
            left: fl.l,
            width: fl.sz,
            height: fl.sz,
            opacity: op * (0.45 + (i % 3) * 0.08),
            transform: `rotate(${i * 11}deg) scale(${0.7 + op * 0.45})`,
            transition: 'opacity 1.5s ease, transform 1.8s ease',
            background:
              'radial-gradient(circle at 40% 40%, rgba(255,236,246,0.95) 0%, rgba(255,180,212,0.35) 45%, rgba(200,236,220,0.15) 70%, transparent 88%)',
            filter: `blur(${1.8 - op}px) saturate(${1 + op})`,
          }}
        />
      ))}
    </div>
  );
}

export function WayHomePracticeApp() {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [soft, setSoft] = useState(35);

  const onPick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl(URL.createObjectURL(f));
  }, [objectUrl]);

  const reset = () => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setObjectUrl(null);
  };

  const t = soft / 100;
  const filter = [
    `saturate(${1 + t * 0.55})`,
    `brightness(${1.02 + t * 0.08})`,
    `contrast(${1 - t * 0.12})`,
    `blur(${t * 5.8}px)`,
    `hue-rotate(${t * -8}deg)`,
  ].join(' ');

  return (
    <div
      style={{
        position: 'relative',
        minHeight: 520,
        fontFamily: FONT,
        overflow: 'hidden',
        borderRadius: 12,
        background: 'linear-gradient(165deg, #f8faff 0%, #edf4ff 52%, #e8f4f9 100%)',
      }}
    >
      <CloudStepsBg />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          maxHeight: '76vh',
        }}
      >
        <header>
          <h1 style={{ fontSize: 17, margin: '0 0 6px', fontWeight: 700, color: 'rgba(32,42,62,0.92)' }}>
            回家的路 · 改写画面练习
          </h1>
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: 'rgba(52,62,82,0.72)' }}>
            选一张照片里曾经让你绷紧的片段。慢慢调高「梦的浓度」——不是要否认过去，而是用更柔软的颜色与它并肩。
          </p>
        </header>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          <label
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '9px 16px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.62)',
              border: '1px solid rgba(255,255,255,0.9)',
              fontSize: 13,
              fontWeight: 600,
              color: 'rgba(45,56,76,0.88)',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(80,130,210,0.12)',
            }}
          >
            <input type="file" accept="image/*" hidden onChange={onPick} />
            选择图片
          </label>
          {objectUrl && (
            <button
              type="button"
              onClick={reset}
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                border: '1px solid rgba(140,155,175,0.35)',
                background: 'transparent',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: FONT,
              }}
            >
              清除
            </button>
          )}
        </div>

        <div style={{ flex: 1, minHeight: 320, position: 'relative', borderRadius: 14, overflow: 'hidden' }}>
          {objectUrl ? (
            <>
              <img src={objectUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', filter }} />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  pointerEvents: 'none',
                  background: `linear-gradient(205deg,
                    rgba(255,245,252,${0.12 + t * 0.38}) 0%,
                    rgba(220,240,255,${0.1 + t * 0.32}) 45%,
                    rgba(238,248,238,${0.08 + t * 0.28}) 100%)`,
                  mixBlendMode: 'multiply',
                }}
              />
              <BlossomLayer strength={soft} />
            </>
          ) : (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 14,
                color: 'rgba(70,82,104,0.55)',
                fontSize: 13,
              }}
            >
              <span>还没有图片时，先看看这些发光的台阶——它们在往上铺开，像在靠近一片云。</span>
              <span style={{ opacity: 0.75 }}>上传后，拖拽下方滑扭，像在往画面里倒水粉。</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label htmlFor="hjd-soft" style={{ fontSize: 13, fontWeight: 600, color: 'rgba(45,55,74,0.85)' }}>
            梦的浓度：{soft}
          </label>
          <input
            id="hjd-soft"
            type="range"
            min={0}
            max={100}
            value={soft}
            onChange={(ev) => setSoft(Number(ev.target.value))}
            style={{ width: '100%', accentColor: '#7aabff' }}
          />
          <span style={{ fontSize: 11.5, color: 'rgba(70,82,104,0.58)' }}>
            觉得够了就停下；不需要一次「修好」，只要给身体一点新的视觉记忆就够。
          </span>
        </div>
      </div>
    </div>
  );
}
