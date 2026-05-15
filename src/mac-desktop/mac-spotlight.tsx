/**
 * Spotlight 风格搜索浮层（顶部居中），筛选已注册应用。
 */

import { useEffect, useMemo, useRef, useState } from 'react';

import type { WindowState } from '@/mac-desktop/xp-window';
import { useMacEmbedded } from '@/mac-desktop/mac-embedded-context';

const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif';

export interface SpotlightAppEntry {
  id: string;
  title: string;
  icon: string;
}

interface MacSpotlightProps {
  open: boolean;
  onClose: () => void;
  apps: SpotlightAppEntry[];
  onOpenApp: (id: string) => void;
  openWindows?: WindowState[];
}

export function MacSpotlight({ open, onClose, apps, onOpenApp, openWindows = [] }: MacSpotlightProps) {
  const embedded = useMacEmbedded();
  const [q, setQ] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ('');
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return apps.slice(0, 12);
    return apps.filter((a) => a.title.toLowerCase().includes(s) || a.id.toLowerCase().includes(s)).slice(0, 20);
  }, [apps, q]);

  if (!open) return null;

  const running = new Set(openWindows.map((w) => w.id));

  return (
    <div
      role="dialog"
      aria-modal
      aria-label="聚焦搜索"
      style={{
        position: 'fixed',
        top: MAC_TOP,
        left: '50%',
        transform: 'translateX(-50%)',
        width: embedded ? 'min(520px, calc(100% - 32px))' : 'min(520px, calc(100vw - 32px))',
        zIndex: 136000,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <style>{`
        @keyframes macSpotIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div
        style={{
          borderRadius: 14,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.14)',
          background: 'rgba(32,32,48,0.88)',
          backdropFilter: 'blur(42px) saturate(160%)',
          WebkitBackdropFilter: 'blur(42px) saturate(160%)',
          boxShadow: '0 28px 80px rgba(0,0,0,0.55)',
          fontFamily: FONT,
          animation: 'macSpotIn 0.22s ease-out',
        }}
      >
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="聚焦搜索"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            border: 'none',
            outline: 'none',
            padding: '14px 18px',
            fontSize: 18,
            background: 'transparent',
            color: 'rgba(255,255,255,0.92)',
          }}
        />
        <div style={{ height: 1, background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ padding: 8, maxHeight: 320, overflowY: 'auto' }} className="mac-os-scrollbar">
          {filtered.length === 0 ? (
            <div style={{ padding: 12, fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>无匹配结果</div>
          ) : (
            filtered.map((a, i) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  onOpenApp(a.id);
                  onClose();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  width: '100%',
                  textAlign: 'left',
                  padding: '9px 11px',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  background: i === 0 ? 'rgba(80,130,255,0.35)' : 'transparent',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: 14,
                  fontFamily: FONT,
                }}
              >
                <img src={a.icon} alt="" style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 6 }} />
                <span style={{ flex: 1 }}>
                  {a.title}
                  {running.has(a.id) ? (
                    <span style={{ marginLeft: 8, fontSize: 11, opacity: 0.45 }}>已打开</span>
                  ) : null}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const MAC_TOP = 72;
