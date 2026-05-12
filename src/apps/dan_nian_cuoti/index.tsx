/**
 * 写给当年的错题——虚拟试卷上的小日记；「涂鸦」「飞走」为本地仪式性动作。
 */

import type { CSSProperties } from 'react';
import { useCallback, useState } from 'react';

const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif';

type Butterfly = { id: string; x: number; y: number; dx: number; dy: number; rot: number };

export function WrongAnswerHealApp() {
  const [text, setText] = useState('');
  const [scribbleRuns, setScribbleRuns] = useState(0);
  const [butterflies, setButterflies] = useState<Butterfly[]>([]);

  const scribblePass = () => {
    setScribbleRuns((n) => n + 1);
  };

  const releaseButterflies = useCallback(() => {
    const t0 = Date.now();
    const base = [...Array(14)].map((_, i): Butterfly => ({
      id: `fly-${t0}-${i}`,
      x: 20 + Math.random() * 70,
      y: 42 + Math.random() * 30,
      dx: Math.random() * 60 - 20,
      dy: -(80 + Math.random() * 80),
      rot: Math.random() * 40 - 20,
    }));
    setButterflies(base);
    window.setTimeout(() => {
      setText('');
      setButterflies([]);
    }, 2400);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        height: '100%',
        minHeight: 480,
        fontFamily: FONT,
        borderRadius: 12,
        overflow: 'hidden',
        background: 'linear-gradient(180deg, #f4f6fb 0%, #eceff7 100%)',
      }}
    >
      <style>{`
        @keyframes cuotiSquiggle {
          0% { stroke-dashoffset: 120; opacity: 0.45; }
          40% { opacity: 0.92; }
          100% { stroke-dashoffset: 0; opacity: 0.55; }
        }
        @keyframes cuotiFlutter {
          0% {
            opacity: 0.95;
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(var(--dx), var(--dy)) rotate(var(--rot)) scale(0.6);
          }
        }
      `}</style>

      {/* 试卷底板 */}
      <div
        style={{
          margin: '16px auto',
          maxWidth: 'min(560px, 100%)',
          padding: '24px 22px 72px',
          background:
            `repeating-linear-gradient(transparent 0 27px, rgba(120,145,210,0.08) 27px 28px),
             linear-gradient(180deg, #fffefb 0%, #fafcfe 55%, #faf8ff 100%)`,
          boxShadow: '0 18px 48px rgba(60,82,122,0.12), inset 0 1px 0 rgba(255,255,255,0.92)',
          borderRadius: 4,
          border: '1px solid rgba(200,210,230,0.55)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 18,
            right: 26,
            width: 86,
            height: 72,
            border: '2px dashed rgba(150,165,190,0.45)',
            borderRadius: 3,
          }}
          aria-hidden
        />
        <header style={{ marginBottom: 18, borderBottom: '1px dashed rgba(160,175,205,0.45)', paddingBottom: 12 }}>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', color: 'rgba(90,104,132,0.55)' }}>
            「错题」其实只是当年不敢讲的那一页
          </div>
          <div style={{ fontSize: 16, marginTop: 6, fontWeight: 700, color: 'rgba(38,48,68,0.9)' }}>
            写给当年的错题（不会被打分）
          </div>
        </header>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="写什么都可以：委屈、愤怒、委屈里的勇敢……只有你能看见。"
          style={{
            width: '100%',
            minHeight: 220,
            resize: 'vertical',
            border: 'none',
            background: 'transparent',
            fontFamily: FONT,
            fontSize: 14,
            lineHeight: '28px',
            color: 'rgba(35,45,65,0.9)',
            outline: 'none',
            padding: '2px 4px',
            boxSizing: 'border-box',
          }}
        />

        {/* 涂鸦层（SVG 覆盖） */}
        <svg
          aria-hidden
          style={{
            position: 'absolute',
            left: 18,
            right: 18,
            top: 120,
            bottom: 90,
            pointerEvents: 'none',
            overflow: 'visible',
          }}
        >
          {[...Array(scribbleRuns)].map((_, i) => (
            <path
              key={i}
              d={`M ${40 + i * 60} ${80 + (i % 3) * 40} Q ${120 + i * 20} ${20 + i * 15} ${200 + i * 30} ${90 + i * 12}`}
              fill="none"
              stroke="rgba(255,180,120,0.35)"
              strokeWidth={3.2}
              strokeLinecap="round"
              style={{
                animation: 'cuotiSquiggle 1.1s ease-out forwards',
                strokeDasharray: 120,
                strokeDashoffset: 120,
              }}
            />
          ))}
        </svg>

        {/* 蝴蝶 */}
        {butterflies.map((b) => (
          <span
            key={b.id}
            aria-hidden
            style={
              {
                position: 'absolute',
                left: `${b.x}%`,
                top: `${b.y}%`,
                fontSize: 18,
                pointerEvents: 'none',
                animation: 'cuotiFlutter 2.3s ease-out forwards',
                '--dx': `${b.dx}px`,
                '--dy': `${b.dy}px`,
                '--rot': `${b.rot}deg`,
              } as CSSProperties
            }
          >
            🦋
          </span>
        ))}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
          <button
            type="button"
            onClick={scribblePass}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              border: 'none',
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              background: 'linear-gradient(180deg, #ffd8a8 0%, #ffc078 100%)',
              color: 'rgba(70,45,20,0.9)',
              boxShadow: '0 6px 18px rgba(255,160,80,0.25)',
            }}
          >
            轻轻涂一下
          </button>
          <button
            type="button"
            onClick={releaseButterflies}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              border: 'none',
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              background: 'linear-gradient(180deg, #b8e0ff 0%, #8ec5fc 100%)',
              color: 'rgba(22,48,78,0.92)',
              boxShadow: '0 6px 18px rgba(120,180,240,0.28)',
            }}
          >
            让字句飞走
          </button>
        </div>
      </div>
    </div>
  );
}
