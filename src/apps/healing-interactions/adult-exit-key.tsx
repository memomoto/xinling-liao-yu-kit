/**
 * 成人的退出键 — 粉灰气泡对话框 + Canvas 三角碎片飞散 + 背景过渡到海边意象。
 */

import { useCallback, useEffect, useRef, useState } from 'react';

type Phase = 'dialog' | 'shattering' | 'freedom';

type Shard = {
  cx: number;
  cy: number;
  vx: number;
  vy: number;
  rot: number;
  rotSp: number;
  op: number;
  v1: { x: number; y: number };
  v2: { x: number; y: number };
  v3: { x: number; y: number };
  fill: string;
};

export function AdultExitKey() {
  const [phase, setPhase] = useState<Phase>('dialog');
  const rootRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const shardsRef = useRef<Shard[]>([]);
  const rafRef = useRef(0);
  const swipeStartRef = useRef<{ x: number; y: number; t: number } | null>(null);

  const SWIPE_UP_PX = 88;
  const SWIPE_MAX_MS = 520;
  const SWIPE_MAX_SIDE_DRIFT = 110;

  const runShatter = useCallback(() => {
    const root = rootRef.current;
    const box = boxRef.current;
    const c = canvasRef.current;
    if (!root || !box || !c) return;

    const rr = root.getBoundingClientRect();
    const br = box.getBoundingClientRect();
    const left = br.left - rr.left;
    const top = br.top - rr.top;
    const w = br.width;
    const h = br.height;

    const cols = 9;
    const rows = 7;
    const colors = ['#f5dfe8', '#edd5ec', '#fce8f2', '#ecd8c8', '#ffd9ec', '#f8e8dc'];
    const shards: Shard[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x0 = left + (col / cols) * w;
        const x1 = left + ((col + 1) / cols) * w;
        const y0 = top + (row / rows) * h;
        const y1 = top + ((row + 1) / rows) * h;

        const pushTri = (ax: number, ay: number, bx: number, by: number, cxp: number, cyp: number) => {
          const cxn = (ax + bx + cxp) / 3;
          const cyn = (ay + by + cyp) / 3;
          shards.push({
            cx: cxn,
            cy: cyn,
            vx: (Math.random() - 0.5) * 9,
            vy: -5 - Math.random() * 7,
            rot: Math.random() * Math.PI * 2,
            rotSp: (Math.random() - 0.5) * 0.32,
            op: 1,
            v1: { x: ax - cxn, y: ay - cyn },
            v2: { x: bx - cxn, y: by - cyn },
            v3: { x: cxp - cxn, y: cyp - cyn },
            fill: colors[(row + col) % colors.length] ?? '#f5dfe8',
          });
        };

        pushTri(x0, y0, x1, y0, x1, y1);
        pushTri(x0, y0, x1, y1, x0, y1);
      }
    }

    shardsRef.current = shards;
    setPhase('shattering');

    const ctx = c.getContext('2d');
    if (!ctx) return;

    let frames = 0;
    const loop = () => {
      frames += 1;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rw = root.clientWidth;
      const rh = root.clientHeight;
      c.width = rw * dpr;
      c.height = rh * dpr;
      c.style.width = `${rw}px`;
      c.style.height = `${rh}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rw, rh);

      shardsRef.current = shardsRef.current.filter((s) => {
        s.cx += s.vx;
        s.cy += s.vy;
        s.vy += 0.32;
        s.rot += s.rotSp;
        s.op -= 0.019;
        if (s.op <= 0) return false;

        ctx.save();
        ctx.translate(s.cx, s.cy);
        ctx.rotate(s.rot);
        ctx.globalAlpha = Math.max(0, s.op);
        ctx.beginPath();
        ctx.moveTo(s.v1.x, s.v1.y);
        ctx.lineTo(s.v2.x, s.v2.y);
        ctx.lineTo(s.v3.x, s.v3.y);
        ctx.closePath();
        ctx.fillStyle = s.fill;
        ctx.fill();
        ctx.restore();
        return true;
      });

      if (shardsRef.current.length && frames < 110) {
        rafRef.current = requestAnimationFrame(loop);
      } else {
        setPhase('freedom');
      }
    };
    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (phase !== 'dialog') return;
      swipeStartRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    },
    [phase],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (phase !== 'dialog') return;
      const s = swipeStartRef.current;
      swipeStartRef.current = null;
      if (!s) return;
      const dyUp = s.y - e.clientY;
      const dx = Math.abs(e.clientX - s.x);
      const dt = Date.now() - s.t;
      if (dyUp > SWIPE_UP_PX && dx < SWIPE_MAX_SIDE_DRIFT && dt < SWIPE_MAX_MS) {
        runShatter();
      }
    },
    [phase, runShatter],
  );

  const handlePointerCancel = useCallback(() => {
    swipeStartRef.current = null;
  }, []);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const bg =
    phase === 'freedom'
      ? 'linear-gradient(180deg, #cfefff 0%, #e8f8ff 42%, #b8dce8 100%)'
      : 'linear-gradient(165deg, #ece5ee 0%, #e8dfe8 55%, #dcd4e4 100%)';

  return (
    <div
      ref={rootRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      style={{
        position: 'relative',
        minHeight: 400,
        borderRadius: 18,
        background: bg,
        transition: 'background 1.4s ease',
        overflow: 'hidden',
        fontFamily: '"Songti SC", SimSun, "PingFang SC", sans-serif',
        touchAction: phase === 'dialog' ? 'pan-y' : 'auto',
      }}
    >
      <style>{`
        @keyframes exitPulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 200, 220, 0.65); }
          70% { box-shadow: 0 0 0 22px rgba(255, 200, 220, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 200, 220, 0); }
        }
        @keyframes dialogFlyIn {
          from { opacity: 0; transform: translateY(-28px) rotate(-4deg) scale(0.94); }
          to { opacity: 1; transform: translateY(0) rotate(0) scale(1); }
        }
      `}</style>

      {phase === 'freedom' ? (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '42%',
            background:
              'linear-gradient(180deg, transparent 0%, rgba(120,180,210,0.35) 40%, rgba(80,150,190,0.55) 100%)',
            opacity: 0.85,
          }}
        />
      ) : null}

      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 5,
        }}
        aria-hidden
      />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          padding: 24,
          gap: 28,
        }}
      >
        {phase !== 'freedom' ? (
          <>
            <div
              ref={boxRef}
              style={{
                maxWidth: 340,
                padding: '22px 24px',
                borderRadius: 22,
                background: 'rgba(255, 248, 252, 0.72)',
                border: '1px solid rgba(255, 210, 230, 0.65)',
                boxShadow: '0 18px 40px rgba(140, 100, 130, 0.15), inset 0 1px 0 rgba(255,255,255,0.85)',
                animation: phase === 'dialog' ? 'dialogFlyIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1)' : undefined,
                opacity: phase === 'shattering' ? 0 : 1,
                transition: 'opacity 0.12s ease',
                pointerEvents: phase === 'dialog' ? 'auto' : 'none',
              }}
            >
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.75, color: '#5c4a52' }}>
                不舒服的关系里，你不必永远扮演懂事的那一个。
                <br />
                <span style={{ opacity: 0.85 }}>
                  按下 EXIT，像关掉一扇不该由你硬撑的门——外面未必完美，但是你的呼吸会先松一寸。也可以<strong>在画面上快速向上滑</strong>，像把这层负担拂走。
                </span>
              </p>
            </div>

            <button
              type="button"
              disabled={phase !== 'dialog'}
              onClick={runShatter}
              style={{
                width: 104,
                height: 104,
                borderRadius: '50%',
                border: '2px solid rgba(255, 200, 185, 0.95)',
                cursor: phase === 'dialog' ? 'pointer' : 'default',
                background: 'linear-gradient(145deg, #ffd9e8 0%, #f0c4a8 48%, #f5d4c0 100%)',
                color: '#6b4548',
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: '0.12em',
                boxShadow: '0 10px 28px rgba(180, 110, 130, 0.35), inset 0 2px 0 rgba(255,255,255,0.65)',
                animation: phase === 'dialog' ? 'exitPulse 2.2s ease-out infinite' : undefined,
              }}
            >
              EXIT
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <p style={{ margin: 0, fontSize: 16, color: '#3d5a68', lineHeight: 1.8 }}>
              门已经碎了。
              <br />
              <span style={{ fontSize: 14, opacity: 0.85 }}>风会从缝里进来——那是你自己的海风。</span>
            </p>
            <button
              type="button"
              onClick={() => {
                setPhase('dialog');
                shardsRef.current = [];
              }}
              style={{
                marginTop: 22,
                padding: '10px 20px',
                borderRadius: 999,
                border: '1px solid rgba(120,170,200,0.45)',
                background: 'rgba(255,255,255,0.55)',
                cursor: 'pointer',
                color: '#456878',
                fontSize: 13,
              }}
            >
              再来一次意象练习
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
