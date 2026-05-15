/**
 * 浮动窗口：macOS 风格标题栏（红绿灯）+ 毛玻璃，最大化扣顶栏与 Dock。
 */

import React, { useState, useCallback, useRef } from 'react';

import { useWindowDrag } from '@/hooks/use-window-drag';
import { MAC_DOCK_PX, MAC_MENU_BAR_PX, MAC_RIGHT_SIDEBAR_PX } from '@/config/ping_guo_ke_jie_mian_chi_cun';
import { useMacEmbedded } from '@/mac-desktop/mac-embedded-context';
import { XpWindowFrameContext } from '@/mac-desktop/xp-window-frame-context';
import { XpWindowPixelHearts } from '@/mac-desktop/xp-window-pixel-hearts';

const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
const MIN_W = 200;
const MIN_H = 120;

export interface WindowState {
  id: string;
  title: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  minimized: boolean;
  contentKey?: number;
  /** 首次出现时是否直接铺满工作台（仍可点绿钮还原为小窗） */
  preferMaximized?: boolean;
}

interface XpWindowProps {
  win: WindowState;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onPositionChange: (id: string, x: number, y: number) => void;
  onSizeChange: (id: string, x: number, y: number, w: number, h: number) => void;
  children: React.ReactNode;
}

type ResizeDir = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se';

const CURSOR_MAP: Record<ResizeDir, string> = {
  n: 'n-resize',
  s: 's-resize',
  e: 'e-resize',
  w: 'w-resize',
  nw: 'nw-resize',
  ne: 'ne-resize',
  sw: 'sw-resize',
  se: 'se-resize',
};

const HANDLE_PX = 5;

function ResizeHandle({
  dir,
  win,
  onSizeChange,
  onFocus,
}: {
  dir: ResizeDir;
  win: WindowState;
  onSizeChange: (id: string, x: number, y: number, w: number, h: number) => void;
  onFocus: (id: string) => void;
}) {
  const startRef = useRef<{ px: number; py: number; x: number; y: number; w: number; h: number } | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      onFocus(win.id);
      startRef.current = { px: e.clientX, py: e.clientY, x: win.x, y: win.y, w: win.width, h: win.height };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [win, onFocus],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const start = startRef.current;
      if (!start) return;

      const dx = e.clientX - start.px;
      const dy = e.clientY - start.py;

      let { x, y, w, h } = start;

      if (dir.includes('e')) w = Math.max(MIN_W, start.w + dx);
      if (dir.includes('w')) {
        const newW = Math.max(MIN_W, start.w - dx);
        x = start.x + (start.w - newW);
        w = newW;
      }
      if (dir.includes('s')) h = Math.max(MIN_H, start.h + dy);
      if (dir.includes('n')) {
        const newH = Math.max(MIN_H, start.h - dy);
        y = start.y + (start.h - newH);
        h = newH;
      }

      onSizeChange(win.id, x, y, w, h);
    },
    [dir, win.id, onSizeChange],
  );

  const handlePointerUp = useCallback(() => {
    startRef.current = null;
  }, []);

  const style: React.CSSProperties = {
    position: 'absolute',
    zIndex: 10,
    cursor: CURSOR_MAP[dir],
  };

  const h = HANDLE_PX;
  if (dir === 'n') Object.assign(style, { top: 0, left: h, right: h, height: h });
  if (dir === 's') Object.assign(style, { bottom: 0, left: h, right: h, height: h });
  if (dir === 'e') Object.assign(style, { top: h, right: 0, bottom: h, width: h });
  if (dir === 'w') Object.assign(style, { top: h, left: 0, bottom: h, width: h });
  if (dir === 'nw') Object.assign(style, { top: 0, left: 0, width: h, height: h });
  if (dir === 'ne') Object.assign(style, { top: 0, right: 0, width: h, height: h });
  if (dir === 'sw') Object.assign(style, { bottom: 0, left: 0, width: h, height: h });
  if (dir === 'se') Object.assign(style, { bottom: 0, right: 0, width: h, height: h });

  return (
    <div
      style={style}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    />
  );
}

export function XpWindow({
  win,
  onFocus,
  onClose,
  onMinimize,
  onPositionChange,
  onSizeChange,
  children,
}: XpWindowProps) {
  const embedded = useMacEmbedded();
  const [maximized, setMaximized] = useState(Boolean(win.preferMaximized));
  const [preMaxState, setPreMaxState] = useState({ x: win.x, y: win.y, w: win.width, h: win.height });

  const handlePositionChange = useCallback(
    (pos: { x: number; y: number }) => onPositionChange(win.id, pos.x, pos.y),
    [win.id, onPositionChange],
  );

  const { handleTitlePointerDown } = useWindowDrag({
    position: { x: win.x, y: win.y },
    onPositionChange: handlePositionChange,
    onDragStart: () => onFocus(win.id),
  });

  const handleMaximize = useCallback(() => {
    if (!maximized) {
      setPreMaxState({ x: win.x, y: win.y, w: win.width, h: win.height });
      onPositionChange(win.id, 0, 0);
    } else {
      onSizeChange(win.id, preMaxState.x, preMaxState.y, preMaxState.w, preMaxState.h);
    }
    setMaximized((v) => !v);
  }, [maximized, win, preMaxState, onPositionChange, onSizeChange]);

  const minimized = win.minimized;

  const style: React.CSSProperties = maximized
    ? {
        position: 'fixed',
        left: 0,
        top: MAC_MENU_BAR_PX,
        width: embedded ? `calc(100% - ${MAC_RIGHT_SIDEBAR_PX}px)` : `calc(100vw - ${MAC_RIGHT_SIDEBAR_PX}px)`,
        height: embedded
          ? `calc(100% - ${MAC_MENU_BAR_PX + MAC_DOCK_PX}px)`
          : `calc(100vh - ${MAC_MENU_BAR_PX + MAC_DOCK_PX}px)`,
        zIndex: win.zIndex,
      }
    : {
        position: 'fixed',
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        zIndex: win.zIndex,
      };

  const chromeRadius = maximized ? 0 : 12;

  return (
    <XpWindowFrameContext.Provider value={{ minimized }}>
      <>
        <style>{`
        @keyframes macWinEnter {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
        <div
          style={{
            ...style,
            display: minimized ? 'none' : 'flex',
            flexDirection: 'column',
            boxShadow: maximized
              ? 'none'
              : '0 26px 80px rgba(0,0,0,0.22), 0 10px 28px rgba(25,45,90,0.12), 0 0 0 1px rgba(255,255,255,0.55)',
            border: maximized ? 'none' : '1px solid rgba(255,255,255,0.72)',
            borderRadius: chromeRadius,
            overflow: 'hidden',
            fontFamily: FONT,
            userSelect: 'none',
            animation: maximized ? undefined : 'macWinEnter 0.38s cubic-bezier(0.34, 1.15, 0.64, 1)',
          }}
          onPointerDown={() => onFocus(win.id)}
        >
          {!maximized &&
            (['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'] as ResizeDir[]).map((dir) => (
              <ResizeHandle key={dir} dir={dir} win={win} onSizeChange={onSizeChange} onFocus={onFocus} />
            ))}

          <div
            onPointerDown={handleTitlePointerDown}
            style={{
              background: 'linear-gradient(180deg, rgba(246,246,246,0.96) 0%, rgba(228,228,232,0.96) 100%)',
              backdropFilter: 'blur(14px) saturate(160%)',
              WebkitBackdropFilter: 'blur(14px) saturate(160%)',
              padding: '6px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'move',
              flexShrink: 0,
              minHeight: 40,
              borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                flexShrink: 0,
                position: 'relative',
                zIndex: 25,
              }}
            >
              <TrafficLight color="#ff5f57" border="#e34940" title="关闭" onClick={() => onClose(win.id)} glyph="×" />
              <TrafficLight
                color="#febc2e"
                border="#dba727"
                title="最小化"
                onClick={() => onMinimize(win.id)}
                glyph="−"
              />
              <TrafficLight
                color="#28c840"
                border="#21a332"
                title={maximized ? '还原' : '最大化'}
                onClick={handleMaximize}
                glyph={maximized ? '↙' : '↗'}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, minWidth: 0 }}>
              <img src={win.icon} alt="" style={{ width: 14, height: 14, objectFit: 'contain', opacity: 0.85, flexShrink: 0 }} />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'rgba(30,30,30,0.92)',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  letterSpacing: '0.02em',
                }}
              >
                {win.title}
              </span>
            </div>
            <div style={{ width: 68, flexShrink: 0 }} aria-hidden />
          </div>

          <div
            className="mac-os-scrollbar"
            style={{
              flex: 1,
              minHeight: 0,
              background: 'rgba(252,252,253,0.94)',
              overflow: 'auto',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 800,
                margin: '0 auto',
                flex: 1,
                minHeight: 0,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                boxSizing: 'border-box',
              }}
            >
              {children}
            </div>
          </div>
          <XpWindowPixelHearts maximized={maximized} />
        </div>
      </>
    </XpWindowFrameContext.Provider>
  );
}

function TrafficLight({
  color,
  border,
  title,
  glyph,
  onClick,
}: {
  color: string;
  border: string;
  title: string;
  glyph: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      type="button"
      data-window-btn
      title={title}
      aria-label={title}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        boxSizing: 'border-box',
        width: 28,
        height: 28,
        padding: 0,
        border: 'none',
        borderRadius: 8,
        background: 'transparent',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          border: `1px solid ${border}`,
          background: hovered ? `linear-gradient(180deg, ${color} 0%, ${color}dd 100%)` : color,
          boxShadow: hovered ? 'inset 0 -1px 0 rgba(0,0,0,0.12)' : 'inset 0 1px 0 rgba(255,255,255,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(0,0,0,0.45)',
          fontSize: 9,
          fontWeight: 700,
          lineHeight: 1,
          pointerEvents: 'none',
        }}
      >
        <span style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.12s ease' }}>{glyph}</span>
      </span>
    </button>
  );
}
