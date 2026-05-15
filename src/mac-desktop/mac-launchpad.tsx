/**
 * Launchpad 风格应用网格（自站点 `mac-launchpad.tsx` 的液态玻璃网格版，不含甜甜圈轨道）。
 */

import { useCallback, useEffect, useState } from 'react';

import type { DesktopIconDef } from '@/types/desktop-icon';

const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif';

const LP_GLASS_FILTER_ID = 'moeStandaloneLpGlassDistortion';
const LP_GLASS_FILTER_ID_EMBED = `${LP_GLASS_FILTER_ID}-tabletEmbed`;

const LAUNCHPAD_VOTES_LS = 'moe:launchpad-app-votes';

function readLaunchpadVotes(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LAUNCHPAD_VOTES_LS);
    if (!raw) return {};
    const o = JSON.parse(raw) as unknown;
    if (o && typeof o === 'object' && !Array.isArray(o)) {
      const out: Record<string, number> = {};
      for (const [k, v] of Object.entries(o)) {
        if (typeof v === 'number' && Number.isFinite(v)) out[k] = Math.max(0, Math.floor(v));
      }
      return out;
    }
  } catch {
    /* ignore */
  }
  return {};
}

function writeLaunchpadVotes(v: Record<string, number>): void {
  try {
    localStorage.setItem(LAUNCHPAD_VOTES_LS, JSON.stringify(v));
  } catch {
    /* ignore */
  }
}

interface MacLaunchpadProps {
  open: boolean;
  onClose: () => void;
  icons: DesktopIconDef[];
  onOpenApp: (id: string) => void;
}

interface LaunchpadIconGridScrollerProps {
  glassFilterId: string;
  icons: DesktopIconDef[];
  votes: Record<string, number>;
  bumpVote: (appId: string) => void;
  onOpenApp: (id: string) => void;
  /** 选应用后追加调用（启动台 overlay 用于关层） */
  afterOpenSelection?: () => void;
  variant: 'modal' | 'shelf';
  scrollMaxHeight: string;
  outerRadiusPx: number;
  innerScrollerPaddingPx: string;
  showOuterChrome: boolean;
}

function LaunchpadIconGridScroller({
  glassFilterId,
  icons,
  votes,
  bumpVote,
  onOpenApp,
  afterOpenSelection,
  variant,
  scrollMaxHeight,
  outerRadiusPx,
  innerScrollerPaddingPx,
  showOuterChrome,
}: LaunchpadIconGridScrollerProps) {
  const visible = icons.filter((ic) => ic.id !== 'recycleBin');
  const innerGlassRadiusPx = Math.max(12, outerRadiusPx - 4);

  const renderIconCell = (ic: DesktopIconDef, idx: number) => (
    <div
      key={ic.id}
      className="relative flex w-24 shrink-0 flex-col items-center gap-3 overflow-visible"
      style={{
        animation:
          variant === 'shelf' ? undefined : `macLpIcon 0.35s ease ${Math.min(idx, 18) * 0.025}s both`,
      }}
    >
      <button
        type="button"
        onClick={() => {
          onOpenApp(ic.id);
          afterOpenSelection?.();
        }}
        className="flex w-full shrink-0 flex-col items-center gap-3 overflow-visible border-none bg-transparent p-0"
        style={{
          cursor: 'pointer',
          fontFamily: FONT,
          boxSizing: 'border-box',
        }}
      >
        <span
          className="block size-12 overflow-hidden rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.22)',
            border: '1px solid rgba(255,255,255,0.42)',
            boxShadow: '0 8px 24px rgba(40,60,100,0.14), inset 0 1px 0 rgba(255,255,255,0.55)',
            backdropFilter: 'blur(12px) saturate(150%)',
            WebkitBackdropFilter: 'blur(12px) saturate(150%)',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
          }}
        >
          <img src={ic.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: 'rgba(28,32,42,0.92)',
            textAlign: 'center',
            textShadow:
              '0 1px 0 rgba(255,255,255,0.5), 0 0 10px rgba(255,255,255,0.35), 0 2px 8px rgba(0,0,0,0.12)',
            lineHeight: 1.25,
            width: '100%',
            height: 'auto',
            overflow: 'visible',
          }}
        >
          {ic.label}
        </span>
      </button>
      <button
        type="button"
        aria-label={`给 ${ic.label} 点赞`}
        title="点赞"
        onClick={(e) => {
          e.stopPropagation();
          bumpVote(ic.id);
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          padding: '2px 8px',
          borderRadius: 999,
          border: '1px solid rgba(100,120,160,0.22)',
          background: 'rgba(255,255,255,0.32)',
          cursor: 'pointer',
          fontSize: 10,
          fontFamily: FONT,
          color: 'rgba(28,32,42,0.75)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
        }}
      >
        <span aria-hidden>👍</span>
        <span>{votes[ic.id] ?? 0}</span>
      </button>
    </div>
  );

  const maxPanelW = variant === 'modal' ? undefined : '100%';

  const glassPanel = (
    <div
      className={
        variant === 'modal'
          ? 'mx-auto w-[90%] max-w-5xl rounded-3xl border border-white/30 bg-white/20 p-8 shadow-2xl backdrop-blur-xl sm:p-12'
          : undefined
      }
      style={{
        flexShrink: variant === 'shelf' ? 1 : 0,
        borderRadius: variant === 'modal' ? undefined : outerRadiusPx,
        overflow: 'visible',
        maxWidth: maxPanelW,
        width: variant === 'shelf' ? '100%' : undefined,
        boxSizing: 'border-box',
        boxShadow:
          variant === 'shelf'
            ? '0 14px 40px rgba(20, 35, 70, 0.12)'
            : undefined,
      }}
    >
      <div
        className="mac-os-scrollbar"
        style={{
          overflowY: 'auto',
          overflowX: 'clip',
          maxHeight: scrollMaxHeight,
          padding: innerScrollerPaddingPx,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '100%',
            margin: '0 auto',
            overflow: 'visible',
          }}
        >
          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              backdropFilter: 'blur(10px) saturate(165%)',
              WebkitBackdropFilter: 'blur(10px) saturate(165%)',
              filter: `url(#${glassFilterId})`,
              isolation: 'isolate',
              overflow: 'hidden',
              pointerEvents: 'none',
              borderRadius: innerGlassRadiusPx,
            }}
          />

          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              background: 'rgba(255,255,255,0.16)',
              pointerEvents: 'none',
              borderRadius: innerGlassRadiusPx,
            }}
          />

          <div
            aria-hidden
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              overflow: 'hidden',
              pointerEvents: 'none',
              borderRadius: innerGlassRadiusPx,
              boxShadow:
                'inset 2px 2px 1px 0 rgba(255,255,255,0.45), inset -1px -1px 1px 1px rgba(255,255,255,0.38)',
            }}
          />

          <div
            style={{
              position: 'relative',
              zIndex: 3,
              width: '100%',
              maxWidth: '100%',
              margin: '0 auto',
              overflow: 'visible',
            }}
          >
            <div className="relative grid min-h-[120px] w-full max-w-full grid-cols-4 gap-x-8 gap-y-12 overflow-visible justify-items-center sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7">
              {visible.map((ic, idx) => renderIconCell(ic, idx))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <GlassDistortionSvgDefs filterId={glassFilterId} />
      {showOuterChrome ? (
        glassPanel
      ) : (
        <div style={{ flex: 1, minHeight: 0, width: '100%', boxSizing: 'border-box', display: 'flex' }}>{glassPanel}</div>
      )}
    </>
  );
}

function GlassDistortionSvgDefs({ filterId }: { filterId: string }) {
  return (
    <svg aria-hidden style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
      <defs>
        <filter
          id={filterId}
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          filterUnits="objectBoundingBox"
        >
          <feTurbulence type="fractalNoise" baseFrequency="0.01 0.01" numOctaves={1} seed="5" result="turbulence" />
          <feComponentTransfer in="turbulence" result="mapped">
            <feFuncR type="gamma" amplitude={1} exponent={10} offset={0.5} />
            <feFuncG type="gamma" amplitude={0} exponent={1} offset={0} />
            <feFuncB type="gamma" amplitude={0} exponent={1} offset={0.5} />
          </feComponentTransfer>
          <feGaussianBlur in="turbulence" stdDeviation={3} result="softMap" />
          <feSpecularLighting
            in="softMap"
            surfaceScale={5}
            specularConstant={1}
            specularExponent={100}
            lightingColor="white"
            result="specLight"
          >
            <fePointLight x={-200} y={-200} z={300} />
          </feSpecularLighting>
          <feComposite in="specLight" operator="arithmetic" k1={0} k2={1} k3={1} k4={0} result="litImage" />
          <feDisplacementMap in="SourceGraphic" in2="softMap" scale={48} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

/**
 * 疗愈平板 / 嵌入式屏内常驻：液态玻璃图标网格 + 👍 计数（与 Dock 启动台共用 localStorage）。
 */
export function MacLaunchpadInlineShelf({ icons, onOpenApp }: { icons: DesktopIconDef[]; onOpenApp: (id: string) => void }) {
  const [votes, setVotes] = useState(readLaunchpadVotes);
  useEffect(() => setVotes(readLaunchpadVotes()), []);

  const bumpVote = useCallback((appId: string) => {
    setVotes((prev) => {
      const next = { ...prev, [appId]: (prev[appId] ?? 0) + 1 };
      writeLaunchpadVotes(next);
      return next;
    });
  }, []);

  return (
    <div
      role="region"
      aria-label="疗愈舱应用网格"
      style={{
        position: 'relative',
        flex: 1,
        minHeight: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'auto',
      }}
    >
      <style>{`
        @keyframes macLpIcon {
          from { transform: scale(0.65); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div
        style={{
          flex: 1,
          width: '100%',
          position: 'relative',
          overflow: 'visible',
          marginTop: 6,
          minHeight: 0,
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
          }}
        />

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            flex: 1,
            minHeight: 0,
          }}
        >
          <main
            className="mac-os-scrollbar"
            style={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'clip',
              padding: '12px 14px 16px',
              minHeight: 0,
            }}
          >
            <div
              style={{
                margin: '0 auto',
                maxWidth: '100%',
                padding: '20px 16px',
                boxSizing: 'border-box',
                borderRadius: 24,
                background: 'rgba(255, 255, 255, 0.17)',
                border: '1px solid rgba(255, 255, 255, 0.32)',
                backdropFilter: 'blur(22px) saturate(165%)',
                WebkitBackdropFilter: 'blur(22px) saturate(165%)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.42)',
              }}
            >
              <LaunchpadIconGridScroller
                glassFilterId={LP_GLASS_FILTER_ID_EMBED}
                icons={icons}
                votes={votes}
                bumpVote={bumpVote}
                onOpenApp={onOpenApp}
                variant="shelf"
                scrollMaxHeight="none"
                outerRadiusPx={18}
                innerScrollerPaddingPx="10px 8px 18px"
                showOuterChrome={false}
              />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export function MacLaunchpad({ open, onClose, icons, onOpenApp }: MacLaunchpadProps) {
  const [votes, setVotes] = useState<Record<string, number>>({});
  useEffect(() => {
    if (open) setVotes(readLaunchpadVotes());
  }, [open]);

  const bumpVote = useCallback((appId: string) => {
    setVotes((prev) => {
      const next = { ...prev, [appId]: (prev[appId] ?? 0) + 1 };
      writeLaunchpadVotes(next);
      return next;
    });
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal
      aria-label="启动台"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 135500,
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '56px 24px 96px',
        animation: 'macLpFade 0.28s ease-out',
        background: 'rgba(12, 18, 32, 0.14)',
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes macLpFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes macLpIcon {
          from { transform: scale(0.65); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
        <LaunchpadIconGridScroller
          glassFilterId={LP_GLASS_FILTER_ID}
          icons={icons}
          votes={votes}
          bumpVote={bumpVote}
          onOpenApp={onOpenApp}
          afterOpenSelection={onClose}
          variant="modal"
          scrollMaxHeight="min(calc(100dvh - 112px), min(92vh, 92dvh))"
          outerRadiusPx={24}
          innerScrollerPaddingPx="0"
          showOuterChrome
        />
      </div>
    </div>
  );
}
