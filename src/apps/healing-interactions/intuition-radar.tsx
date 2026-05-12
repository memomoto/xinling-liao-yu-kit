/**
 * 第六感雷达校准 — 鼠标距离感应 + 身影冷暖滤镜 + 涟漪圈。
 */

import { useCallback, useEffect, useRef, useState } from 'react';

type SilKind = 'safe' | 'danger';

type Sil = { id: string; leftPct: number; topPct: number; kind: SilKind };

const SILHOUETTES: Sil[] = [
  { id: 'a', leftPct: 18, topPct: 28, kind: 'safe' },
  { id: 'b', leftPct: 52, topPct: 22, kind: 'danger' },
  { id: 'c', leftPct: 72, topPct: 48, kind: 'safe' },
  { id: 'd', leftPct: 38, topPct: 58, kind: 'danger' },
  { id: 'e', leftPct: 58, topPct: 72, kind: 'safe' },
];

/** 在同一身影上停留约 1.5s / 3s 时展开的意象文案（非诊断） */
const SIL_DWELL: Record<string, { title: string; soft: string; deep: string }> = {
  a: {
    title: '松弛的一角',
    soft: '靠得越近，肩颈好像可以先放下一点点——像有人在远处替你守门。',
    deep: '你可以把这当成一种身体的赞成票：不必说服自己「应该」亲近谁，触觉会先诚实。',
  },
  b: {
    title: '收紧的信号',
    soft: '靠近这里会隐约发紧——不一定是坏人，更像你的身体在说「慢一点」。',
    deep: '迟疑不是懦弱；停在半径外观察，也是一种自我保护的智慧。',
  },
  c: {
    title: '温和的引力',
    soft: '像暖意轻轻拢过来——意象里的「安全」不必喧哗，有时只是呼吸变浅。',
    deep: '记住这一刻的感受：以后在现实里迷路时，你可以召回这份对照。',
  },
  d: {
    title: '雾里看花',
    soft: '轮廓发冷、边缘变硬——也许是提醒你「不必急着看懂每一个人」。',
    deep: '若现实中也有人让你一再缩小自己，可以先把距离当成温柔的缓冲。',
  },
  e: {
    title: '安静的依托',
    soft: '靠近平稳的影子——像一句没说出口的「你可以慢慢来」。',
    deep: '允许自己被安抚：这不等于软弱，而是神经系统终于获准喘息。',
  },
};

const RADIUS = 150;
const DWELL_EXPAND_MS = 1500;
const DWELL_DEEP_MS = 3000;

export function IntuitionRadar() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState<{ x: number; y: number } | null>(null);
  const [nearId, setNearId] = useState<string | null>(null);
  const [nearKind, setNearKind] = useState<SilKind | null>(null);
  const [dwellExpandedId, setDwellExpandedId] = useState<string | null>(null);
  const [dwellDeepId, setDwellDeepId] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripplesRef = useRef<{ x: number; y: number; born: number }[]>([]);
  const rafRef = useRef(0);
  const prevNearRef = useRef<string | null>(null);
  const lastRippleRef = useRef(0);

  const updatePointer = useCallback((clientX: number, clientY: number) => {
    const el = rootRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = clientX - r.left;
    const y = clientY - r.top;
    setMouse({ x, y });

    let best: { id: string; kind: SilKind; d: number } | null = null;
    for (const s of SILHOUETTES) {
      const cx = (s.leftPct / 100) * r.width;
      const cy = (s.topPct / 100) * r.height;
      const d = Math.hypot(x - cx, y - cy);
      if (d < RADIUS && (!best || d < best.d)) {
        best = { id: s.id, kind: s.kind, d };
      }
    }

    const prev = prevNearRef.current;
    if (best) {
      setNearId(best.id);
      setNearKind(best.kind);
      if (best.kind === 'danger') {
        setShake(true);
        window.setTimeout(() => setShake(false), 280);
        if (prev !== best.id && navigator.vibrate) navigator.vibrate([40, 25, 40]);
      } else if (prev !== best.id && navigator.vibrate) navigator.vibrate(90);
      prevNearRef.current = best.id;
    } else {
      setNearId(null);
      setNearKind(null);
      prevNearRef.current = null;
    }

    const t = performance.now();
    if (t - lastRippleRef.current > 72) {
      lastRippleRef.current = t;
      ripplesRef.current.push({ x, y, born: t });
    }
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      updatePointer(e.clientX, e.clientY);
    },
    [updatePointer],
  );

  useEffect(() => {
    if (!nearId) {
      setDwellExpandedId(null);
      setDwellDeepId(null);
      return;
    }
    const tExpand = window.setTimeout(() => setDwellExpandedId(nearId), DWELL_EXPAND_MS);
    const tDeep = window.setTimeout(() => setDwellDeepId(nearId), DWELL_DEEP_MS);
    return () => {
      window.clearTimeout(tExpand);
      window.clearTimeout(tDeep);
    };
  }, [nearId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const root = rootRef.current;
    if (!canvas || !root) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      const rw = root.clientWidth;
      const rh = root.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rw * dpr;
      canvas.height = rh * dpr;
      canvas.style.width = `${rw}px`;
      canvas.style.height = `${rh}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rw, rh);

      const now = performance.now();
      ripplesRef.current = ripplesRef.current.filter((rp) => now - rp.born < 900);

      for (const rp of ripplesRef.current) {
        const age = now - rp.born;
        const t = age / 900;
        const rad = 28 + t * 120;
        const a = 0.42 * (1 - t);
        ctx.strokeStyle =
          nearKind === 'safe'
            ? `rgba(255, 170, 210, ${a})`
            : nearKind === 'danger'
              ? `rgba(140, 200, 255, ${a})`
              : `rgba(200, 180, 255, ${a * 0.65})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rad, 0, Math.PI * 2);
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [nearKind]);

  return (
    <div
      ref={rootRef}
      onPointerMove={onPointerMove}
      onPointerLeave={() => {
        setMouse(null);
        setNearId(null);
        setNearKind(null);
        prevNearRef.current = null;
      }}
      style={{
        position: 'relative',
        minHeight: 420,
        borderRadius: 18,
        overflow: 'hidden',
        background: 'radial-gradient(ellipse 90% 70% at 50% 100%, #2a1844 0%, #1a0a2e 45%, #0d0618 100%)',
        cursor: 'crosshair',
        touchAction: 'none',
        animation: shake ? 'radarShake 0.28s ease' : undefined,
        fontFamily: '"Songti SC", SimSun, "PingFang SC", sans-serif',
      }}
    >
      <style>{`
        @keyframes radarShake {
          0%, 100% { transform: translate(0,0); }
          25% { transform: translate(-3px, 2px); }
          50% { transform: translate(3px, -2px); }
          75% { transform: translate(-2px, -2px); }
        }
      `}</style>

      {Array.from({ length: 48 }).map((_, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            position: 'absolute',
            left: `${((i * 17) % 93) + 3}%`,
            top: `${((i * 31) % 78) + 5}%`,
            width: 2,
            height: 2,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.45)',
            opacity: 0.15 + (i % 5) * 0.08,
          }}
        />
      ))}

      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4 }}
        aria-hidden
      />

      {SILHOUETTES.map((s) => {
        const active = nearId === s.id;
        const warm =
          active && s.kind === 'safe'
            ? 'sepia(0.28) hue-rotate(295deg) saturate(1.15) blur(2px)'
            : active && s.kind === 'danger'
              ? 'hue-rotate(175deg) saturate(0.55) brightness(0.92) blur(5px)'
              : 'blur(8px) grayscale(0.15) brightness(0.78)';
        const glow =
          active && s.kind === 'safe'
            ? '0 0 28px rgba(255, 160, 210, 0.55)'
            : active && s.kind === 'danger'
              ? '0 0 22px rgba(100, 170, 255, 0.35)'
              : 'none';

        return (
          <div
            key={s.id}
            style={{
              position: 'absolute',
              left: `${s.leftPct}%`,
              top: `${s.topPct}%`,
              transform: 'translate(-50%, -50%)',
              width: 72,
              height: 112,
              borderRadius: '40% 40% 48% 48%',
              background:
                s.kind === 'safe'
                  ? 'linear-gradient(180deg, rgba(190,140,200,0.45), rgba(120,80,140,0.35))'
                  : 'linear-gradient(180deg, rgba(90,110,160,0.5), rgba(50,60,100,0.45))',
              filter: warm,
              boxShadow: glow,
              transition: 'filter 0.35s ease, box-shadow 0.35s ease',
              zIndex: 2,
              pointerEvents: 'none',
            }}
          />
        );
      })}

      {mouse ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            left: mouse.x - 10,
            top: mouse.y - 10,
            width: 20,
            height: 20,
            borderRadius: '50%',
            border: '2px solid rgba(255,200,230,0.45)',
            boxShadow: '0 0 14px rgba(255,200,230,0.35)',
            pointerEvents: 'none',
            zIndex: 6,
          }}
        />
      ) : null}

      <div
        style={{
          position: 'relative',
          zIndex: 8,
          padding: 14,
          pointerEvents: 'none',
        }}
      >
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.65, color: 'rgba(230,210,245,0.75)' }}>
          缓慢移动光标或手指靠近模糊的身影——「暖」与「冷」只是意象练习：贴近某些人你会本能松弛，贴近另一些则会收紧。
          <span style={{ opacity: 0.65 }}>
            {' '}
            （半径约 {RADIUS}px）在同一身影上停留约 {DWELL_EXPAND_MS / 1000}s 会展开释义，约 {DWELL_DEEP_MS / 1000}s 会出现下一层感知提示。
          </span>
        </p>
      </div>

      {dwellExpandedId && SIL_DWELL[dwellExpandedId] ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            bottom: 12,
            zIndex: 10,
            padding: '12px 14px',
            borderRadius: 14,
            background: 'rgba(22, 12, 38, 0.72)',
            border: '1px solid rgba(255, 200, 230, 0.28)',
            boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
            pointerEvents: 'none',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255, 215, 235, 0.92)', marginBottom: 6 }}>
            {SIL_DWELL[dwellExpandedId].title}
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.68, color: 'rgba(235, 220, 250, 0.88)' }}>
            {SIL_DWELL[dwellExpandedId].soft}
          </div>
          {dwellDeepId === dwellExpandedId ? (
            <div
              style={{
                marginTop: 10,
                paddingTop: 10,
                borderTop: '1px solid rgba(255,255,255,0.12)',
                fontSize: 12,
                lineHeight: 1.68,
                color: 'rgba(210, 230, 255, 0.88)',
              }}
            >
              {SIL_DWELL[dwellExpandedId].deep}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
