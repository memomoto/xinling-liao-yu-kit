/**
 * 小暖信箱 — 角色「小暖」常驻在面板内（非桌宠、非侧栏宠物）：书摘回信、心情与互动。
 */
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';

import { DreamyContainer } from '@/components/healing-motifs/dreamy-container';
import { randomAck, randomComfortQuote, type ComfortQuote } from './comfort-quotes';

const FONT = '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif';

const QUOTE_BUBBLE_MS = 28000;
const LETTER_BUBBLE_MS = 16000;
const AUTO_SEED = 'xiao-nuan-mailbox'.split('').reduce((a, c) => a + c.charCodeAt(0), 0);

type BuddyBubble =
  | { kind: 'quote'; q: ComfortQuote }
  | { kind: 'plain'; text: string };

type Eyes = 'normal' | 'happy' | 'sleepy';

function formatBubble(q: ComfortQuote, preface?: string): string {
  const body = preface ? `${preface}\n\n${q.text}` : q.text;
  return q.note ? `${body}\n\n—— ${q.note}` : body;
}

/** 面板内的小暖形象（原创简笔角色，与侧栏/桌宠体系无关） */
function XiaoNuanSvg({
  size,
  eyes,
  idleAnimate = true,
}: {
  size: number;
  eyes: Eyes;
  idleAnimate?: boolean;
}) {
  const d = (which: Eyes) => (eyes === which ? undefined : 'none');
  const showZzz = eyes === 'sleepy';
  const uid = useId().replace(/:/g, '');
  const kf = `cbZzzDrift_${uid}`;
  const c1 = `cbZzz1_${uid}`;
  const c2 = `cbZzz2_${uid}`;
  const c3 = `cbZzz3_${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        display: 'block',
        overflow: showZzz ? 'visible' : undefined,
        animation: idleAnimate ? 'cbPanelNuanIdle 3s ease-in-out infinite' : undefined,
      }}
    >
      {showZzz ? (
        <style>{`
          @keyframes ${kf} {
            0%, 100% { transform: translate(0, 0); opacity: 0.28; }
            40% { transform: translate(-2.5px, -6px); opacity: 0.92; }
            70% { transform: translate(-4px, -10px); opacity: 0.45; }
          }
          .${c1} { animation: ${kf} 2.6s ease-in-out infinite; }
          .${c2} { animation: ${kf} 2.6s ease-in-out infinite 0.45s; }
          .${c3} { animation: ${kf} 2.6s ease-in-out infinite 0.88s; }
          @media (prefers-reduced-motion: reduce) {
            .${c1}, .${c2}, .${c3} { animation: none !important; opacity: 0.65; }
          }
        `}</style>
      ) : null}
      <defs>
        <radialGradient id={`cbCheek_${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFB7D5" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#FFB7D5" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="72" rx="22" ry="14" fill="#FBEAF0" />
      <circle cx="50" cy="46" r="28" fill="#FFF0F5" />
      <ellipse cx="26" cy="23" rx="9" ry="11" fill="#FFF0F5" />
      <ellipse cx="26" cy="23" rx="5" ry="7" fill="#FFD9EC" />
      <ellipse cx="74" cy="23" rx="9" ry="11" fill="#FFF0F5" />
      <ellipse cx="74" cy="23" rx="5" ry="7" fill="#FFD9EC" />
      <ellipse cx="34" cy="52" rx="8" ry="5" fill={`url(#cbCheek_${uid})`} />
      <ellipse cx="66" cy="52" rx="8" ry="5" fill={`url(#cbCheek_${uid})`} />
      <g style={{ display: d('normal') }}>
        <ellipse cx="40" cy="46" rx="4.5" ry="5" fill="#3D2B3D" />
        <ellipse cx="60" cy="46" rx="4.5" ry="5" fill="#3D2B3D" />
        <circle cx="42" cy="44" r="1.5" fill="white" />
        <circle cx="62" cy="44" r="1.5" fill="white" />
      </g>
      <g style={{ display: d('happy') }}>
        <path d="M36 46 Q40 41 44 46" fill="none" stroke="#3D2B3D" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M56 46 Q60 41 64 46" fill="none" stroke="#3D2B3D" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <g style={{ display: d('sleepy') }}>
        <path d="M36 47 Q40 45 44 47" fill="none" stroke="#3D2B3D" strokeWidth="2" strokeLinecap="round" />
        <path d="M56 47 Q60 45 64 47" fill="none" stroke="#3D2B3D" strokeWidth="2" strokeLinecap="round" />
      </g>
      <path d="M44 56 Q50 61 56 56" fill="none" stroke="#D4537E" strokeWidth="2" strokeLinecap="round" />
      <path d="M43 32 Q46 28 50 32 Q54 28 57 32 Q54 36 50 32 Q46 36 43 32Z" fill="#ED93B1" />
      <circle cx="50" cy="32" r="2.5" fill="#FFD9EC" />
      <ellipse cx="28" cy="68" rx="5" ry="10" fill="#FFF0F5" transform="rotate(-20 28 68)" />
      <ellipse cx="72" cy="68" rx="5" ry="10" fill="#FFF0F5" transform="rotate(20 72 68)" />
      <path d="M68 78 Q80 88 74 95 Q66 90 68 78Z" fill="#FFD9EC" />
      {showZzz ? (
        <>
          <g transform="translate(28, 33)" className={c1}>
            <text x="0" y="0" fontSize="15" fill="#D4537E" fontFamily="Georgia, serif">
              z
            </text>
          </g>
          <g transform="translate(17, 22)" className={c2}>
            <text x="0" y="0" fontSize="12" fill="#D4537E" fontFamily="Georgia, serif">
              z
            </text>
          </g>
          <g transform="translate(8, 13)" className={c3}>
            <text x="0" y="0" fontSize="9" fill="#D4537E" fontFamily="Georgia, serif">
              z
            </text>
          </g>
        </>
      ) : null}
    </svg>
  );
}

function ReplyCard({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      role="status"
      style={{
        position: 'relative',
        maxWidth: 420,
        margin: '0 auto 14px',
        padding: '12px 14px 12px 12px',
        borderRadius: 14,
        border: '1px solid rgba(244, 114, 182, 0.45)',
        background: 'rgba(255,255,255,0.92)',
        color: '#4a0432',
        fontSize: 12,
        lineHeight: 1.65,
        boxShadow: '0 8px 28px rgba(219, 39, 119, 0.12)',
        whiteSpace: 'pre-wrap',
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="关闭"
        style={{
          position: 'absolute',
          top: 6,
          right: 8,
          border: 'none',
          background: 'transparent',
          color: '#9d174d',
          cursor: 'pointer',
          fontSize: 16,
          lineHeight: 1,
        }}
      >
        ×
      </button>
      {children}
    </div>
  );
}

export function ComfortBuddyApp() {
  const [mood, setMood] = useState(70);
  const [petSize, setPetSize] = useState(96);
  const [petAnim, setPetAnim] = useState<'idle' | 'bounce' | 'spin'>('idle');
  const [bubble, setBubble] = useState<BuddyBubble | null>(null);
  const [input, setInput] = useState('');
  const [autoPush, setAutoPush] = useState(true);
  const [intervalMs, setIntervalMs] = useState(12000);
  const bubbleHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const eyes: Eyes = mood >= 78 ? 'happy' : mood <= 32 ? 'sleepy' : 'normal';

  const hideBubble = useCallback(() => {
    if (bubbleHideTimer.current) {
      clearTimeout(bubbleHideTimer.current);
      bubbleHideTimer.current = null;
    }
    setBubble(null);
  }, []);

  const showQuoteBubble = useCallback((q?: ComfortQuote, ms: number = QUOTE_BUBBLE_MS) => {
    if (bubbleHideTimer.current) clearTimeout(bubbleHideTimer.current);
    bubbleHideTimer.current = null;
    setBubble({ kind: 'quote', q: q ?? randomComfortQuote() });
    bubbleHideTimer.current = setTimeout(() => {
      bubbleHideTimer.current = null;
      setBubble(null);
    }, ms);
  }, []);

  const showLetterBubble = useCallback((text: string) => {
    if (bubbleHideTimer.current) clearTimeout(bubbleHideTimer.current);
    bubbleHideTimer.current = null;
    setBubble({ kind: 'plain', text });
    bubbleHideTimer.current = setTimeout(() => {
      bubbleHideTimer.current = null;
      setBubble(null);
    }, LETTER_BUBBLE_MS);
  }, []);

  const changeMood = useCallback((d: number) => {
    setMood((m) => Math.min(100, Math.max(0, m + d)));
  }, []);

  const interact = useCallback(
    (kind: 'hug' | 'play' | 'msg') => {
      if (kind === 'hug') {
        setPetAnim('bounce');
        window.setTimeout(() => setPetAnim('idle'), 480);
        changeMood(10);
      } else if (kind === 'play') {
        setPetAnim('spin');
        window.setTimeout(() => setPetAnim('idle'), 680);
        changeMood(8);
      } else {
        changeMood(5);
      }
      showQuoteBubble();
    },
    [changeMood, showQuoteBubble],
  );

  const onNuanClick = useCallback(() => {
    const kinds: Array<'hug' | 'play' | 'msg'> = ['hug', 'play', 'msg'];
    interact(kinds[Math.floor(Math.random() * kinds.length)]!);
  }, [interact]);

  useEffect(() => {
    if (!autoPush) return;
    let cancelled = false;
    let t: number | undefined;
    const gapScale = intervalMs <= 6000 ? 0.5 : intervalMs >= 25000 ? 1.6 : 1;
    const scheduleNext = (delay: number) => {
      t = window.setTimeout(() => {
        if (cancelled) return;
        showQuoteBubble();
        changeMood(-2);
        const baseGap = 36000 + (AUTO_SEED % 14000) + Math.random() * 22000;
        scheduleNext(baseGap * gapScale);
      }, delay);
    };
    scheduleNext(4000 + (AUTO_SEED % 8000));
    return () => {
      cancelled = true;
      if (t !== undefined) window.clearTimeout(t);
    };
  }, [autoPush, intervalMs, showQuoteBubble, changeMood]);

  useEffect(
    () => () => {
      if (bubbleHideTimer.current) clearTimeout(bubbleHideTimer.current);
    },
    [],
  );

  const sendLetter = useCallback(() => {
    if (!input.trim()) return;
    const q = randomComfortQuote();
    showLetterBubble(formatBubble(q, randomAck()));
    setInput('');
    changeMood(3);
  }, [input, showLetterBubble, changeMood]);

  return (
    <DreamyContainer className="!max-w-none w-full flex-1 !rounded-none !shadow-none shadow-none md:!px-10 md:!py-10 !px-6 !py-6">
      <style>{`
        @keyframes cbPanelNuanIdle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes cbPanelNuanJump {
          0% { transform: translateY(0) scale(1); }
          35% { transform: translateY(-14px) scale(0.96, 1.04); }
          70% { transform: translateY(0) scale(1.04, 0.96); }
          100% { transform: translateY(0) scale(1); }
        }
        @keyframes cbPanelNuanSpin {
          from { transform: rotate(0); }
          to { transform: rotate(360deg); }
        }
        .cb-panel-nuan.cb-bounce svg { animation: cbPanelNuanJump 0.45s ease !important; }
        .cb-panel-nuan.cb-spin svg { animation: cbPanelNuanSpin 0.65s ease !important; }
        .cb-panel-nuan.cb-happy { filter: brightness(1.06); }
        @media (prefers-reduced-motion: reduce) {
          .cb-panel-nuan svg { animation: none !important; }
        }
      `}</style>
      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: FONT,
          minHeight: 0,
          color: 'rgba(253, 242, 248, 0.96)',
        }}
      >
        <div
          role="region"
          aria-label="小暖信箱"
          style={{
            position: 'relative',
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            padding: 14,
            borderBottom: '1px solid rgba(244, 192, 209, 0.35)',
            background: 'rgba(253, 224, 232, 0.08)',
          }}
        >
          <p style={{ margin: '0 0 12px', fontSize: 12, color: '#fbcfe8', lineHeight: 1.55 }}>
            小暖会一直待在这个窗口里陪你。写信会得到一段随机书摘式回应（仅本地、不上传）。心情偏低时她会犯困飘
            zzz；心情好时会笑眼弯弯。
          </p>

          {bubble ? (
            <ReplyCard onClose={hideBubble}>
              {bubble.kind === 'quote' ? (
                <>
                  <div style={{ fontWeight: 700, marginBottom: 6, color: '#831843' }}>书摘</div>
                  <div>{bubble.q.text}</div>
                  {bubble.q.note ? (
                    <div style={{ marginTop: 8, opacity: 0.85 }}>—— {bubble.q.note}</div>
                  ) : null}
                </>
              ) : (
                <div>{bubble.text}</div>
              )}
            </ReplyCard>
          ) : null}

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              justifyContent: 'center',
              gap: 20,
              marginTop: 4,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                className={`cb-panel-nuan ${petAnim === 'bounce' ? 'cb-bounce' : ''} ${petAnim === 'spin' ? 'cb-spin' : ''} ${mood > 80 ? 'cb-happy' : ''}`}
                onClick={onNuanClick}
                aria-label="点击小暖随机互动"
                style={{
                  border: 'none',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: 20,
                  padding: '10px 12px 6px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(219, 39, 119, 0.15)',
                }}
              >
                <XiaoNuanSvg size={petSize} eyes={eyes} idleAnimate={petAnim === 'idle'} />
              </button>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fce7f3' }}>小暖</span>
              <span style={{ fontSize: 10, color: '#f9a8d4', textAlign: 'center', maxWidth: 160, lineHeight: 1.4 }}>
                点点她也会随机抱抱 / 逗逗 / 说句话
              </span>
              <label style={{ fontSize: 10, color: '#f9a8d4', display: 'flex', alignItems: 'center', gap: 6 }}>
                大小
                <input
                  type="range"
                  min={72}
                  max={128}
                  value={petSize}
                  onChange={(ev) => setPetSize(Number(ev.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: 120 }}
                />
              </label>
            </div>

            <div style={{ flex: '1 1 200px', minWidth: 0, maxWidth: 420 }}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12,
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 10, color: '#f9a8d4' }}>心情值</span>
                  <div
                    style={{
                      width: 120,
                      height: 6,
                      borderRadius: 4,
                      background: 'rgba(212, 83, 126, 0.25)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${mood}%`,
                        borderRadius: 4,
                        background: 'linear-gradient(90deg, #f9a8d4, #ec4899)',
                        transition: 'width 0.35s ease',
                      }}
                    />
                  </div>
                </div>
                <div
                  role="group"
                  aria-label="互动"
                  style={{
                    display: 'inline-flex',
                    borderRadius: 12,
                    overflow: 'hidden',
                    border: '1px solid #f4b8d0',
                    background: '#fff',
                  }}
                >
                  {(
                    [
                      ['抱抱', () => interact('hug')],
                      ['逗逗她', () => interact('play')],
                      ['说句话', () => interact('msg')],
                    ] as const
                  ).map(([label, fn], i) => (
                    <button
                      key={label}
                      type="button"
                      onClick={fn}
                      style={{
                        fontSize: 11,
                        padding: '7px 10px',
                        margin: 0,
                        border: 'none',
                        borderRadius: 0,
                        borderRight: i < 2 ? '1px solid #fce7f3' : 'none',
                        background: '#fff',
                        color: '#9d174d',
                        cursor: 'pointer',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  fontSize: 11,
                  color: '#f9a8d4',
                }}
              >
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  自动书摘频率
                  <select
                    value={intervalMs}
                    onChange={(ev) => setIntervalMs(Number(ev.target.value))}
                    style={{ fontSize: 11, padding: '2px 6px' }}
                  >
                    <option value={6000}>较快</option>
                    <option value={12000}>中等</option>
                    <option value={25000}>较慢</option>
                  </select>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  自动出现书摘
                  <input type="checkbox" checked={autoPush} onChange={(ev) => setAutoPush(ev.target.checked)} />
                </label>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            borderTop: '1px solid rgba(251, 207, 232, 0.35)',
            background: 'rgba(255, 255, 255, 0.09)',
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendLetter()}
            placeholder="写一句心里话…"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              padding: '10px 12px',
              fontFamily: FONT,
              fontSize: 12,
              background: 'transparent',
              color: '#fdf2f8',
            }}
          />
          <button
            type="button"
            onClick={sendLetter}
            style={{
              background: 'linear-gradient(180deg, #ec4899, #db2777)',
              color: '#fff',
              border: 'none',
              padding: '0 18px',
              cursor: 'pointer',
              fontFamily: FONT,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            投递
          </button>
        </div>
      </div>
    </DreamyContainer>
  );
}

export { COMFORT_BOOK_SNIPPETS } from './comfort-quotes';
