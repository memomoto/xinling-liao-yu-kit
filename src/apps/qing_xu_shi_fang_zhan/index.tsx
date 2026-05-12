/**
 * 情绪释放站：碎纸机（文字碎屑飘落）· 放飞气球（心事升空）
 */

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import './qing_xu_shi_fang_zhan.css';

type Mode = 'shred' | 'balloon';

function segmentGlyphs(text: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    try {
      return [
        ...new Intl.Segmenter(navigator.language, { granularity: 'grapheme' }).segment(
          text,
        ),
      ].map((s) => s.segment);
    } catch {
      /* fallthrough */
    }
  }
  return Array.from(text);
}

type ShredParticle = {
  id: string;
  ch: string;
  leftPct: number;
  delayS: number;
  durS: number;
  driftPx: number;
  rotDeg: number;
};

const SHRED_LIMIT = 220;

/** 云层占位：纯 CSS 椭圆，不占资源 */
function SkyDecor() {
  return (
    <>
      <div
        className="ersSun"
        aria-hidden
      />
      <div
        className="ersCloud"
        aria-hidden
        style={{
          width: '42%',
          height: 34,
          top: '12%',
          left: '-35%',
          animationDuration: '55s',
        }}
      />
      <div
        className="ersCloud"
        aria-hidden
        style={{
          width: '28%',
          height: 22,
          top: '22%',
          left: '-20%',
          animationDuration: '38s',
          animationDelay: '-12s',
        }}
      />
    </>
  );
}

export function QingXuShiFangZhanApp() {
  const [mode, setMode] = useState<Mode>('shred');

  /** 碎纸机 */
  const [shredDraft, setShredDraft] = useState('');
  const [particles, setParticles] = useState<ShredParticle[]>([]);
  const [shredding, setShredding] = useState(false);
  const [shredCapHint, setShredCapHint] = useState(false);
  const shredTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const purgeShredTimer = () => {
    if (shredTimer.current !== null) {
      clearTimeout(shredTimer.current);
      shredTimer.current = null;
    }
  };

  const runShred = useCallback(() => {
    const raw = shredDraft.trim();
    if (!raw || shredding) return;

    purgeShredTimer();
    const glyphs = segmentGlyphs(raw).filter((g) => g !== '\n' && g !== '\r');
    if (glyphs.length === 0) return;
    const clipped = glyphs.length > SHRED_LIMIT;
    const capped = clipped ? glyphs.slice(0, SHRED_LIMIT) : glyphs;

    const next: ShredParticle[] = capped.map((ch, i) => ({
      id: `p-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
      ch: ch === ' ' ? '\u00a0' : ch,
      leftPct: 6 + Math.random() * 86,
      delayS: Math.random() * 0.28,
      durS: 1.85 + Math.random() * 1.2,
      driftPx: (Math.random() - 0.5) * 110,
      rotDeg: (Math.random() - 0.5) * 520,
    }));

    setShredCapHint(clipped);
    setShredding(true);
    setParticles(next);

    const maxDone =
      Math.max(...next.map((p) => p.delayS + p.durS), 2.4) * 1000 + 200;
    shredTimer.current = setTimeout(() => {
      setShredding(false);
      setShredDraft('');
      setParticles([]);
      setShredCapHint(false);
      shredTimer.current = null;
    }, maxDone);
  }, [shredDraft, shredding]);

  const resetShred = useCallback(() => {
    purgeShredTimer();
    setParticles([]);
    setShredding(false);
    setShredCapHint(false);
  }, []);

  useEffect(() => () => purgeShredTimer(), []);

  /** 气球 */
  const balloonGradNs = useId().replace(/:/g, '');
  const [riseStyle, setRiseStyle] = useState<CSSProperties | undefined>();
  const [balloonDraft, setBalloonDraft] = useState('');
  const [balloonFlying, setBalloonFlying] = useState(false);
  const [balloonDone, setBalloonDone] = useState(false);
  const balloonEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (balloonEndTimer.current !== null) clearTimeout(balloonEndTimer.current);
  }, []);


  const releaseBalloon = useCallback(() => {
    const t = balloonDraft.trim();
    if (!t || balloonFlying) return;
    setBalloonDone(false);

    const riseMs = 17000 + Math.floor(Math.random() * 5500);

    const w = () => `${(Math.random() - 0.5) * 26}px`;
    setRiseStyle({
      ...({
        '--ers-rise-ms': `${riseMs}ms`,
        '--ers-wobble-1': w(),
        '--ers-wobble-2': w(),
        '--ers-wobble-3': w(),
      } as CSSProperties),
    });

    setBalloonFlying(true);
    if (balloonEndTimer.current !== null) clearTimeout(balloonEndTimer.current);
    balloonEndTimer.current = setTimeout(() => {
      setBalloonFlying(false);
      setBalloonDone(true);
      setBalloonDraft('');
      balloonEndTimer.current = null;
    }, riseMs + 800);
  }, [balloonDraft, balloonFlying]);

  const resetBalloon = useCallback(() => {
    if (balloonEndTimer.current !== null) clearTimeout(balloonEndTimer.current);
    balloonEndTimer.current = null;
    setBalloonFlying(false);
    setBalloonDone(false);
    setBalloonDraft('');
    setRiseStyle(undefined);
  }, []);

  return (
    <div className="ersRoot mac-os-scrollbar">
      <p className="ersMuted">
        这里不写进数据库：你可以把心里憋着的句子写在这里，用动作象征「倒掉」——不是医疗建议。
      </p>
      <div
        className="ersTabs"
        role="tablist"
        aria-label="释放方式"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'shred'}
          aria-controls="ers-panel-shred"
          id="ers-tab-shred"
          className="ersTab"
          data-active={mode === 'shred'}
          onClick={() => setMode('shred')}
        >
          碎纸机
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'balloon'}
          aria-controls="ers-panel-balloon"
          id="ers-tab-balloon"
          className="ersTab"
          data-active={mode === 'balloon'}
          onClick={() => setMode('balloon')}
        >
          放飞气球
        </button>
      </div>

      <div className="ersStage">
        {mode === 'shred' && (
          <div
            role="tabpanel"
            aria-labelledby="ers-tab-shred"
            id="ers-panel-shred"
            className="ersShredderWrap"
          >
            <div className="ersPaperStack">
              <textarea
                className="ersPaperInput"
                placeholder={`写下那些卡住你的想法，不必完整、不必有道理。\n点「粉碎」后，让它们像纸片一样散开落下。`}
                value={shredDraft}
                onChange={(e) => setShredDraft(e.target.value)}
                disabled={shredding}
                spellCheck={false}
              />
              {particles.length > 0 ? (
                <div
                  className="ersParticleLayer"
                  aria-hidden
                >
                  {particles.map((p) => (
                    <span
                      key={p.id}
                      className="ersParticle"
                      style={
                        {
                          left: `${p.leftPct}%`,
                          '--ers-delay': `${p.delayS}s`,
                          '--ers-dur': `${p.durS}s`,
                          '--ers-drift': `${p.driftPx}px`,
                          '--ers-rot': `${p.rotDeg}deg`,
                        } as CSSProperties
                      }
                    >
                      {p.ch}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <div
              className="ersShredMetal"
              aria-hidden
            >
              <div className="ersShredTeeth" />
            </div>
            <div className="ersToolbar">
              <button
                type="button"
                className="ersPriBtn"
                onClick={runShred}
                disabled={!shredDraft.trim() || shredding}
              >
                粉碎这些话
              </button>
              <button
                type="button"
                className="ersGhostBtn"
                onClick={resetShred}
              >
                清空重来
              </button>
              {shredCapHint ? (
                <span className="ersMuted">
                  （字太多：已只粉碎前 {SHRED_LIMIT} 个字形以保持流畅）
                </span>
              ) : null}
            </div>
          </div>
        )}

        {mode === 'balloon' && (
          <div
            role="tabpanel"
            aria-labelledby="ers-tab-balloon"
            id="ers-panel-balloon"
            style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
          >
            <div
              className="ersSky"
              aria-live="polite"
            >
              <SkyDecor />
              <div
                className="ersBalloonHost"
                data-flight={
                  balloonDone && !balloonFlying ? 'gone' : undefined
                }
              >
                {!balloonDone || balloonFlying ? (
                  <div
                    className={balloonFlying ? 'ersBalloonRise' : undefined}
                    style={balloonFlying ? riseStyle : undefined}
                  >
                    <div className="ersBalloonGraphic">
                      <svg
                        className="ersSvgBalloon"
                        viewBox="0 0 200 280"
                        aria-hidden
                      >
                      <defs>
                        <linearGradient
                          id={`ers-balloon-fill-${balloonGradNs}`}
                          x1="40%"
                          y1="20%"
                          x2="60%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#ffd4dc" />
                          <stop offset="45%" stopColor="#ff88a8" />
                          <stop offset="100%" stopColor="#e9567a" />
                        </linearGradient>
                        <radialGradient
                          id={`ers-balloon-glare-${balloonGradNs}`}
                          cx="40%"
                          cy="30%"
                          r="65%"
                        >
                          <stop
                            offset="0%"
                            stopColor="rgba(255,255,255,0.92)"
                          />
                          <stop
                            offset="35%"
                            stopColor="rgba(255,245,248,0.35)"
                          />
                          <stop
                            offset="100%"
                            stopColor="rgba(255,120,140,0)"
                          />
                        </radialGradient>
                      </defs>
                      <ellipse
                        cx="100"
                        cy="118"
                        rx="78"
                        ry="93"
                        fill={`url(#ers-balloon-fill-${balloonGradNs})`}
                      />
                      <ellipse
                        cx="100"
                        cy="118"
                        rx="78"
                        ry="93"
                        fill={`url(#ers-balloon-glare-${balloonGradNs})`}
                      />
                      <ellipse
                        cx="100"
                        cy="206"
                        rx="18"
                        ry="10"
                        fill="#cf3d61"
                      />
                      <path
                        d="M100 218 Q 112 258 132 274"
                        fill="none"
                        stroke="#6b4f5f"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                    <textarea
                      className="ersBalloonTextarea"
                      placeholder="沉甸甸的那一句..."
                      rows={5}
                      value={balloonDraft}
                      onChange={(e) => setBalloonDraft(e.target.value)}
                      disabled={balloonFlying}
                      spellCheck={false}
                      maxLength={140}
                      aria-label="写在气球上的话"
                    />
                    </div>
                  </div>
                ) : null}
              </div>
              <div
                className="ersFadeMsg"
                data-show={balloonDone && !balloonFlying}
              >
                它已经飘远了。给自己一点空间。
              </div>
            </div>
            <div className="ersSkyControls">
              <button
                type="button"
                className="ersPriBtn"
                onClick={releaseBalloon}
                disabled={!balloonDraft.trim() || balloonFlying}
              >
                放飞气球
              </button>
              <button
                type="button"
                className="ersGhostBtn"
                onClick={resetBalloon}
                disabled={balloonFlying}
              >
                重新写一句
              </button>
              <span className="ersMuted">{balloonDraft.length}/140</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
