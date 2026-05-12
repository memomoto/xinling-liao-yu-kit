/**
 * 《小刺》遗憾结局：消极弹幕 → 积极文字 → 弹窗「我要爱自己」→ 重新开局
 *
 * 自定义显示字体：将 .woff2 放到 public/fonts/healing-display.woff2（可选），会优先于站酷快乐体。
 */
import '@fontsource/zcool-kuaile/400.css';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

/** 优先 HealingDisplay（用户自放 woff2），否则 ZCOOL KuaiLe（npm 包） */
const FONT_STACK = '"HealingDisplay", "ZCOOL KuaiLe", "PingFang SC", "Microsoft YaHei", sans-serif';

type Phase = 'danmaku' | 'positive' | 'popups' | 'done';

/** 与创伤、自我否定相关的短句，作弹幕用 */
const NEGATIVE_DANMAKU = [
  '我不够好。',
  '一定是我做错了什么。',
  '我要让所有人都喜欢我。',
  '我必须成为所有人的希望。',
  '敏感是我的错。',
  '我不配被温柔对待。',
  '都是我不好。',
  '我不能给别人添麻烦。',
  '只要我乖一点就不会被骂了。',
  '压抑自己才对大家都好。',
  '我为什么这么脆弱。',
  '没有人会真正理解我。',
  '他们伤害我一定是因为我不值得。',
  '我不能示弱。',
  '我必须完美才值得被爱。',
  '都是我的问题。',
  '我不该有情绪。',
  '原谅他们就等于承认我不重要。',
];

const POSITIVE_LINES = [
  { text: '真的是这样子的吗？', color: '#7c3aed' },
  {
    text: '如果伤害我的人真的爱我，那他们为什么要把伤害传递给我？',
    color: '#5b21b6',
  },
  {
    text: '这是爱吗？这不是爱。这是在借着我，填补他们的空虚。',
    color: '#0d9488',
  },
  { text: '我要爱自己！我要爱自己！', color: '#db2777' },
];

const POPUP_CAP = 16;
const POPUP_LABEL = '我要爱自己';

function randomInRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** 经典 Windows 式对话框（灰底、凸边、标题条、假「确定」） */
function ClassicOsDialog({
  message,
  width,
  height,
}: {
  message: string;
  width: number;
  height: number;
}) {
  const btnStyle: CSSProperties = {
    minWidth: 72,
    padding: '3px 18px',
    fontSize: 11,
    fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
    background: '#c0c0c0',
    borderTop: '2px solid #fff',
    borderLeft: '2px solid #fff',
    borderRight: '2px solid #404040',
    borderBottom: '2px solid #404040',
    color: '#000',
    cursor: 'default',
  };

  return (
    <div
      style={{
        width,
        height,
        boxSizing: 'border-box',
        background: '#c0c0c0',
        borderTop: '2px solid #fff',
        borderLeft: '2px solid #fff',
        borderRight: '2px solid #0a0a0a',
        borderBottom: '2px solid #0a0a0a',
        boxShadow: '4px 4px 0 rgba(0,0,0,0.35)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          height: 22,
          background: 'linear-gradient(90deg, #000080 0%, #1084d0 100%)',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 6,
          paddingRight: 4,
          justifyContent: 'space-between',
          color: '#fff',
          fontSize: 11,
          fontWeight: 700,
          fontFamily: 'Tahoma, "MS Sans Serif", sans-serif',
        }}
      >
        <span>提示</span>
        <span style={{ fontSize: 12, lineHeight: 1, opacity: 0.95 }}>×</span>
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: '10px 12px 10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#c0c0c0',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12,
            fontWeight: 700,
            color: '#000080',
            textAlign: 'center',
            lineHeight: 1.4,
            fontFamily: FONT_STACK,
          }}
        >
          {message}
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%', paddingTop: 6 }}>
          <span style={btnStyle}>确定</span>
        </div>
      </div>
    </div>
  );
}

export function BadEndingAwakening({
  title,
  storyBlurb,
  artSrc,
  onReplay,
}: {
  title?: string;
  /** 结局旁白首段，顶栏下方一行概括 */
  storyBlurb: string;
  artSrc?: string;
  onReplay: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('danmaku');
  const [danmakuOpacity, setDanmakuOpacity] = useState(1);
  const [positiveIndex, setPositiveIndex] = useState(0);
  const [popups, setPopups] = useState<
    { id: number; left: number; top: number; w: number; h: number }[]
  >([]);
  const popupIdRef = useRef(0);

  const danmakuRows = useMemo(() => {
    const rows: { key: string; text: string; topPct: number; durationSec: number; delaySec: number }[] =
      [];
    const pool = [...NEGATIVE_DANMAKU];
    for (let i = 0; i < 14; i++) {
      const pick = pool[i % pool.length] ?? '……';
      rows.push({
        key: `dm-${i}`,
        text: pick,
        topPct: 8 + ((i * 5.5) % 72),
        durationSec: 14 + randomInRange(0, 6),
        delaySec: i * 0.85,
      });
    }
    return rows;
  }, []);

  useEffect(() => {
    const t1 = window.setTimeout(() => setDanmakuOpacity(0), 9000);
    const t2 = window.setTimeout(() => setPhase('positive'), 10500);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'positive') return;
    if (positiveIndex >= POSITIVE_LINES.length) {
      setPhase('popups');
      return;
    }
    const hold = positiveIndex === POSITIVE_LINES.length - 1 ? 4200 : 3800;
    const t = window.setTimeout(() => setPositiveIndex((n) => n + 1), hold);
    return () => window.clearTimeout(t);
  }, [phase, positiveIndex]);

  useEffect(() => {
    if (phase !== 'popups') return;
    let spawned = 0;
    const intervalId = window.setInterval(() => {
      if (spawned >= POPUP_CAP) {
        window.clearInterval(intervalId);
        window.setTimeout(() => setPhase('done'), 900);
        return;
      }
      spawned += 1;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const w = Math.min(248, Math.max(200, rect.width * 0.48));
      const h = 124;
      const left = randomInRange(4, Math.max(6, rect.width - w - 6));
      const top = randomInRange(28, Math.max(40, rect.height - h - 8));
      const pid = popupIdRef.current++;
      setPopups((prev) => [...prev, { id: pid, left, top, w, h }]);
    }, 320);
    return () => window.clearInterval(intervalId);
  }, [phase]);

  const positiveLine =
    phase === 'positive' && positiveIndex < POSITIVE_LINES.length
      ? POSITIVE_LINES[positiveIndex]
      : null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        fontFamily: FONT_STACK,
        overflow: 'hidden',
        borderRadius: 14,
        background: '#1a1528',
      }}
    >
      <style>{`
        /* 可选：用户把 woff2 放到 public/fonts/healing-display.woff2 */
        @font-face {
          font-family: 'HealingDisplay';
          src: url('/fonts/healing-display.woff2') format('woff2');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }
        /* 弹幕：贴在容器右缘出发，匀速向左移出左缘（右进左出） */
        @keyframes bad-ending-danmaku-r2l {
          from { transform: translateX(0); }
          to { transform: translateX(calc(-100% - 100vw)); }
        }
        @keyframes bad-ending-positive-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {artSrc ? (
        <img
          src={artSrc}
          alt=""
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center',
            opacity: 0.92,
          }}
        />
      ) : null}

      {/* 顶区：标题 + 一句旁白，无底部黑条 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          zIndex: 4,
          padding: '10px 12px 8px',
          background:
            'linear-gradient(180deg, rgba(253, 242, 248, 0.94) 0%, rgba(253, 242, 248, 0.55) 75%, transparent 100%)',
          pointerEvents: 'none',
        }}
      >
        {title ? (
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#b45309',
              marginBottom: 4,
              textShadow: '0 0 10px rgba(255,255,255,0.9)',
            }}
          >
            {title}
          </div>
        ) : null}
        <p
          style={{
            margin: 0,
            fontSize: 'clamp(11px, 1.35vmin, 13px)',
            lineHeight: 1.55,
            color: '#6b21a8',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            textShadow: '0 0 8px rgba(255,255,255,0.95)',
          }}
          title={storyBlurb}
        >
          {storyBlurb}
        </p>
      </div>

      {/* 消极弹幕：left:100% = 贴在可视区右缘，动画整体向左移出 */}
      {phase === 'danmaku' ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 3,
            pointerEvents: 'none',
            overflow: 'hidden',
            opacity: danmakuOpacity,
            transition: 'opacity 1.4s ease-out',
          }}
        >
          {danmakuRows.map((row) => (
            <div
              key={row.key}
              style={{
                position: 'absolute',
                left: '100%',
                top: `${row.topPct}%`,
                width: 'max-content',
                maxWidth: 'none',
                whiteSpace: 'nowrap',
                willChange: 'transform',
                fontSize: 'clamp(13px, 2.4vmin, 18px)',
                fontWeight: 800,
                color: '#fda4af',
                letterSpacing: '0.02em',
                textShadow:
                  '1px 0 0 #fff, -1px 0 0 #fff, 0 1px 0 #fff, 0 -1px 0 #fff, 2px 0 0 rgba(255,255,255,0.85), -2px 0 0 rgba(255,255,255,0.85), 0 0 12px rgba(255,255,255,0.95)',
                animationName: 'bad-ending-danmaku-r2l',
                animationDuration: `${row.durationSec}s`,
                animationTimingFunction: 'linear',
                animationIterationCount: 'infinite',
                animationDelay: `${row.delaySec}s`,
              }}
            >
              {row.text}
            </div>
          ))}
        </div>
      ) : null}

      {positiveLine ? (
        <div
          key={positiveIndex}
          style={{
            position: 'absolute',
            left: '8%',
            right: '8%',
            top: '38%',
            zIndex: 5,
            textAlign: 'center',
            pointerEvents: 'none',
            animation: 'bad-ending-positive-in 0.9s ease-out both',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 'clamp(14px, 2.4vmin, 20px)',
              fontWeight: 800,
              lineHeight: 1.65,
              color: positiveLine.color,
              textShadow:
                '0 0 18px rgba(255,255,255,0.95), 0 0 28px rgba(253, 230, 255, 0.85), 0 2px 4px rgba(255,255,255,0.9)',
            }}
          >
            {positiveLine.text}
          </p>
        </div>
      ) : null}

      {popups.map((p, i) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            zIndex: 80 + i,
            animation: 'bad-ending-positive-in 0.35s ease-out both',
          }}
        >
          <ClassicOsDialog message={POPUP_LABEL} width={p.w} height={p.h} />
        </div>
      ))}

      {phase === 'done' ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 200,
            padding: '20px 16px 18px',
            display: 'flex',
            justifyContent: 'center',
            background:
              'linear-gradient(0deg, rgba(253, 242, 248, 0.97) 0%, rgba(253, 242, 248, 0.75) 70%, transparent 100%)',
          }}
        >
          <button
            type="button"
            onClick={onReplay}
            style={{
              padding: '14px 26px',
              fontSize: 'clamp(13px, 1.6vmin, 16px)',
              fontWeight: 800,
              border: 'none',
              borderRadius: 999,
              cursor: 'pointer',
              fontFamily: FONT_STACK,
              background: 'linear-gradient(90deg, #ec4899, #a855f7)',
              color: '#fff',
              boxShadow: '0 6px 28px rgba(168, 85, 247, 0.5)',
            }}
          >
            爱自己是终生浪漫的开始
          </button>
        </div>
      ) : null}
    </div>
  );
}
