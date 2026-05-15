/**
 * 仿 macOS 桌面外壳：顶栏、Dock、多窗口、Spotlight、Launchpad、调度中心。
 * 自站点 `src/client/views/home.tsx` 迁出；独立包内用静态 `getDesktopShellSettings()`，无 TRPC。
 */

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { APP_REGISTRY } from '@/apps/registry';
import { getDesktopShellSettings } from '@/config/desktop-shell-settings';
import {
  MAC_DOCK_FISHEYE_MAX_BOOST,
  MAC_DOCK_FISHEYE_SIGMA_SLOT_RATIO,
  MAC_DOCK_GLASS_HEIGHT_PX,
  MAC_DOCK_ICON_LAYER_MIN_HEIGHT_PX,
  MAC_DOCK_ITEM_SLOT_PX,
  MAC_MENU_BAR_PX,
  MAC_RIGHT_SIDEBAR_PX,
} from '@/config/ping_guo_ke_jie_mian_chi_cun';
import { HealingDesktopDawnAtmosphere } from '@/components/healing-motifs';
import { useMacDesktopShortcuts } from '@/hooks/use-mac-desktop-shortcuts';
import { RegisteredApp } from '@/shell/registered-app';
import { HEALING_OPEN_APP_EVENT, type OpenWindowDetail } from '@/shell/cross-shell-events';
import { readPinnedDockAppIds, writePinnedDockAppIds } from '@/storage/dock-pinned-apps';
import type { DesktopIconDef } from '@/types/desktop-icon';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/mac-context-menu';
import { MacLaunchpad } from '@/mac-desktop/mac-launchpad';
import { MacMissionControl } from '@/mac-desktop/mac-mission-control';
import { MacSpotlight } from '@/mac-desktop/mac-spotlight';
import { StartMenu } from '@/mac-desktop/start-menu';
import { useMacEmbedded } from '@/mac-desktop/mac-embedded-context';
import { XpWindow, type WindowState } from '@/mac-desktop/xp-window';

import '@/mac-desktop/styles/mac-shell.css';

const MAC_SHELL_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif';

function dockFisheyeScale(distancePx: number): number {
  const sigmaPx = MAC_DOCK_ITEM_SLOT_PX * MAC_DOCK_FISHEYE_SIGMA_SLOT_RATIO;
  const denom = 2 * sigmaPx * sigmaPx || 1;
  const bell = Math.exp(-(distancePx * distancePx) / denom);
  return Math.min(1 + MAC_DOCK_FISHEYE_MAX_BOOST * bell, 2.14);
}

function formatTime(date: Date): string {
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m} ${ampm}`;
}

function formatMenuBarCalendarLine(date: Date): string {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(date);
}

function MenubarSpotlightGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden fill="none">
      <circle cx="11" cy="11" r="7.25" stroke="currentColor" strokeWidth="1.75" />
      <path d="M16.5 16.5 21 21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function MenubarHairline({ ariaHidden = true }: { ariaHidden?: boolean }) {
  return (
    <span
      aria-hidden={ariaHidden}
      role="presentation"
      style={{
        width: 1,
        height: 15,
        alignSelf: 'center',
        flexShrink: 0,
        background: 'linear-gradient(180deg, transparent, rgba(60,60,70,0.16), transparent)',
        margin: '0 2px',
      }}
    />
  );
}

function WindowContent({
  id,
  minimized,
  remountKey,
}: {
  id: string;
  minimized: boolean;
  remountKey: number;
}) {
  return <RegisteredApp id={id} windowMinimized={minimized} remountKey={remountKey} />;
}

function parseShellOpenDetail(detail: unknown): string | null {
  if (typeof detail === 'string' && detail) return detail;
  if (detail && typeof detail === 'object' && 'id' in detail && typeof (detail as { id: unknown }).id === 'string') {
    return (detail as { id: string }).id;
  }
  return null;
}

export function MacHomePage() {
  const embedded = useMacEmbedded();
  const shell = useMemo(() => getDesktopShellSettings(), []);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [menuBarClock, setMenuBarClock] = useState(() => new Date());
  const [openWindows, setOpenWindows] = useState<WindowState[]>([]);
  const [pinnedDockIds, setPinnedDockIds] = useState<string[]>([]);
  const [dockPinsHydrated, setDockPinsHydrated] = useState(false);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [launchpadOpen, setLaunchpadOpen] = useState(false);
  const [mcOpen, setMcOpen] = useState(false);
  const dockRowRef = useRef<HTMLDivElement>(null);
  const [dockMx, setDockMx] = useState<number | null>(null);
  const [dockCenters, setDockCenters] = useState<number[]>([]);
  const [draggingDockId, setDraggingDockId] = useState<string | null>(null);
  const zCounter = useRef(100);
  const studyRoomHealBootstrapRef = useRef(false);
  const spotlightApps = useMemo(
    () => Object.entries(APP_REGISTRY).map(([id, a]) => ({ id, title: a.title, icon: a.icon })),
    [],
  );

  const iconDefs: DesktopIconDef[] = useMemo(
    () => Object.values(APP_REGISTRY).map((a) => ({ id: a.id, label: a.title, src: a.icon })),
    [],
  );

  const launchpadIconDefs = useMemo(() => {
    const seen = new Set<string>();
    const out: DesktopIconDef[] = [];
    const push = (def: DesktopIconDef) => {
      if (seen.has(def.id)) return;
      seen.add(def.id);
      out.push(def);
    };
    for (const ic of iconDefs) push(ic);
    for (const app of Object.values(APP_REGISTRY)) {
      push({ id: app.id, label: app.title, src: app.icon });
    }
    return out;
  }, [iconDefs]);

  useEffect(() => {
    setPinnedDockIds(readPinnedDockAppIds());
    setDockPinsHydrated(true);
  }, []);

  useEffect(() => {
    if (!dockPinsHydrated) return;
    writePinnedDockAppIds(pinnedDockIds);
  }, [pinnedDockIds, dockPinsHydrated]);

  useEffect(() => {
    const id = setInterval(() => setMenuBarClock(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dockTileIds = useMemo(() => {
    const seen = new Set<string>();
    const pinned = pinnedDockIds.filter((id) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    const pinnedSet = new Set(pinned);
    const openExtra = openWindows.map((w) => w.id).filter((id) => !pinnedSet.has(id));
    return [...pinned, ...openExtra];
  }, [pinnedDockIds, openWindows]);

  const dockMeasureDep = `${pinnedDockIds.join(',')}:${openWindows.map((w) => w.id).join('|')}`;

  useLayoutEffect(() => {
    const nav = dockRowRef.current;
    if (!nav) return;
    const measure = () => {
      const items = nav.querySelectorAll<HTMLElement>('[data-dock-item]');
      const rect = nav.getBoundingClientRect();
      setDockCenters(
        [...items].map((el) => {
          const er = el.getBoundingClientRect();
          return er.left - rect.left + er.width / 2;
        }),
      );
    };
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(nav);
    window.addEventListener('resize', measure);
    nav.addEventListener('scroll', measure, { passive: true });
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', measure);
      nav.removeEventListener('scroll', measure);
    };
  }, [dockMeasureDep, isStartMenuOpen]);

  const dockScaleAt = useCallback(
    (index: number): number => {
      if (dockMx === null) return 1;
      const c = dockCenters[index];
      if (c === undefined) return 1;
      return dockFisheyeScale(Math.abs(dockMx - c));
    },
    [dockMx, dockCenters],
  );

  useMacDesktopShortcuts(
    {
      onSpotlightToggle: () => setSpotlightOpen((v) => !v),
      onMissionControlToggle: () => setMcOpen((v) => !v),
      onLaunchpadToggle: () => setLaunchpadOpen((v) => !v),
      onCloseOverlays: () => {
        setSpotlightOpen(false);
        setLaunchpadOpen(false);
        setMcOpen(false);
        setIsStartMenuOpen(false);
      },
    },
    true,
  );

  const handleStartButtonClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsStartMenuOpen((prev) => !prev);
  }, []);

  const handleDesktopClick = useCallback(() => {
    setSpotlightOpen(false);
    setLaunchpadOpen(false);
    setMcOpen(false);
    if (isStartMenuOpen) setIsStartMenuOpen(false);
  }, [isStartMenuOpen]);

  const openWindow = useCallback((iconId: string, opts?: { preferMaximized?: boolean }) => {
    const app = APP_REGISTRY[iconId];
    if (!app) return;

    setOpenWindows((prev) => {
      const existing = prev.find((w) => w.id === iconId);
      if (existing) {
        const maxZ = zCounter.current + 1;
        zCounter.current = maxZ;
        const nextKey = (existing.contentKey ?? 0) + 1;
        return prev.map((w) =>
          w.id === iconId ? { ...w, minimized: false, zIndex: maxZ, contentKey: nextKey } : w,
        );
      }
      const offset = (prev.length % 8) * 22;
      const newZ = ++zCounter.current;
      const preferMaximized = Boolean(opts?.preferMaximized);
      const newWin: WindowState = {
        id: iconId,
        title: app.title,
        icon: app.icon,
        x: 80 + offset,
        y: MAC_MENU_BAR_PX + 16 + offset,
        width: app.defaultWidth,
        height: app.defaultHeight,
        zIndex: newZ,
        minimized: false,
        contentKey: 0,
        preferMaximized,
      };
      return [...prev, newWin];
    });
  }, []);

  useEffect(() => {
    if (embedded || studyRoomHealBootstrapRef.current) return;
    studyRoomHealBootstrapRef.current = true;
    openWindow('healingToolboxHub', { preferMaximized: true });
  }, [embedded, openWindow]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const id = typeof detail === 'string' ? detail : (detail as { id?: string } | undefined)?.id;
      if (!id) return;
      openWindow(id);
    };
    window.addEventListener('xp-open-window', handler);
    return () => window.removeEventListener('xp-open-window', handler);
  }, [openWindow]);

  useEffect(() => {
    const handler = (ev: Event) => {
      const id = parseShellOpenDetail((ev as CustomEvent<OpenWindowDetail>).detail);
      if (!id) return;
      openWindow(id);
    };
    window.addEventListener(HEALING_OPEN_APP_EVENT, handler as EventListener);
    return () => window.removeEventListener(HEALING_OPEN_APP_EVENT, handler as EventListener);
  }, [openWindow]);

  const handleWindowFocus = useCallback((id: string) => {
    const newZ = ++zCounter.current;
    setOpenWindows((prev) => prev.map((w) => (w.id === id ? { ...w, zIndex: newZ } : w)));
  }, []);

  const handleWindowClose = useCallback((id: string) => {
    setOpenWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const handleWindowMinimize = useCallback((id: string) => {
    setOpenWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: true } : w)));
  }, []);

  const handlePositionChange = useCallback((id: string, x: number, y: number) => {
    setOpenWindows((prev) => prev.map((w) => (w.id === id ? { ...w, x, y } : w)));
  }, []);

  const handleSizeChange = useCallback((id: string, x: number, y: number, width: number, height: number) => {
    setOpenWindows((prev) => prev.map((w) => (w.id === id ? { ...w, x, y, width, height } : w)));
  }, []);

  const handleTaskbarBtn = useCallback((id: string) => {
    setOpenWindows((prev) => {
      const win = prev.find((w) => w.id === id);
      if (!win) return prev;
      if (win.minimized) {
        const newZ = ++zCounter.current;
        return prev.map((w) => (w.id === id ? { ...w, minimized: false, zIndex: newZ } : w));
      }
      return prev.map((w) => (w.id === id ? { ...w, minimized: true } : w));
    });
  }, []);

  const handleMissionControlSelect = useCallback((id: string) => {
    const newZ = ++zCounter.current;
    setOpenWindows((prev) => prev.map((w) => (w.id === id ? { ...w, minimized: false, zIndex: newZ } : w)));
  }, []);

  const reorderDockWindows = useCallback((fromId: string, targetId: string) => {
    if (fromId === targetId) return;
    setOpenWindows((prev) => {
      const fromIdx = prev.findIndex((w) => w.id === fromId);
      if (fromIdx < 0) return prev;
      const next = [...prev];
      const removed = next.splice(fromIdx, 1)[0];
      if (!removed) return prev;
      const insertAt = next.findIndex((w) => w.id === targetId);
      if (insertAt < 0) return prev;
      next.splice(insertAt, 0, removed);
      return next;
    });
  }, []);

  const handleDockIconActivate = useCallback(
    (appId: string) => {
      const win = openWindows.find((w) => w.id === appId);
      if (!win) {
        openWindow(appId);
        return;
      }
      handleTaskbarBtn(appId);
    },
    [openWindow, handleTaskbarBtn, openWindows],
  );

  const handlePinDockApp = useCallback((appId: string) => {
    setPinnedDockIds((prev) => (prev.includes(appId) ? prev : [...prev, appId]));
  }, []);

  const handleUnpinDockApp = useCallback((appId: string) => {
    setPinnedDockIds((prev) => prev.filter((id) => id !== appId));
  }, []);

  const dockMaxW = embedded ? 'min(calc(100% - 56px), 92%)' : 'min(calc(100vw - 56px), 92vw)';

  return (
    <>
      <div
        id="mac-shell-backdrop"
        onClick={handleDesktopClick}
        style={{
          position: 'relative',
          width: embedded ? '100%' : '100vw',
          height: embedded ? '100%' : '100dvh',
          flex: embedded ? '1 1 auto' : undefined,
          minHeight: embedded ? 0 : undefined,
          overflow: 'hidden',
        }}
      >
        <section
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: shell.wallpaper,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundColor: '#0b1520',
            zIndex: 0,
          }}
        />

        <HealingDesktopDawnAtmosphere />
      </div>

      <header
        role="banner"
        style={{
          position: embedded ? 'absolute' : 'fixed',
          top: 0,
          left: 0,
          right: MAC_RIGHT_SIDEBAR_PX,
          height: MAC_MENU_BAR_PX,
          zIndex: 130000,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'space-between',
          paddingLeft: 'max(13px, env(safe-area-inset-left))',
          paddingRight: 'max(12px, calc(env(safe-area-inset-right) + 2px))',
          fontFamily: MAC_SHELL_FONT,
          WebkitFontSmoothing: 'antialiased',
          backdropFilter: 'blur(42px) saturate(180%) contrast(103%)',
          WebkitBackdropFilter: 'blur(42px) saturate(180%) contrast(103%)',
          backgroundColor: 'rgba(246, 246, 248, 0.42)',
          backgroundImage:
            'linear-gradient(180deg, rgb(255 255 255 / 74%) 0%, rgb(255 255 255 / 52%) 24%, rgb(237 239 246 / 45%) 100%)',
          borderBottom: '0.55px solid rgba(35, 41, 53, 0.08)',
          boxShadow:
            'inset 0 0.65px 0 rgba(255, 255, 255, 0.76), inset 0 -1px 0 rgba(255, 255, 255, 0.09), 0 26px 56px rgba(255,251,246,0.32)',
        }}
      >
        <nav
          aria-label="菜单栏"
          style={{
            display: 'flex',
            alignItems: 'center',
            flex: '1 1 auto',
            minWidth: 0,
            overflow: 'hidden',
            gap: 1,
          }}
        >
          <button
            type="button"
            aria-label="Apple 菜单"
            className="mac-menubar-widget-hit"
            onClick={(e) => {
              e.stopPropagation();
              setIsStartMenuOpen((v) => !v);
            }}
            style={{
              width: 28,
              minHeight: MAC_MENU_BAR_PX - 4,
              border: 'none',
              marginRight: 2,
              cursor: 'pointer',
              alignSelf: 'center',
              flexShrink: 0,
              fontFamily: MAC_SHELL_FONT,
              fontWeight: 500,
              fontSize: 16,
              padding: '0 4px',
              lineHeight: 1,
              ...(isStartMenuOpen ? { backgroundColor: 'rgba(0, 0, 0, 0.096)' } : {}),
            }}
          >
            
          </button>
          <span
            className="mac-menubar-faux-item shrink-0 cursor-default select-none"
            style={{
              paddingLeft: 6,
              paddingRight: 10,
              fontWeight: 700,
              fontSize: '13px',
              letterSpacing: '-0.01em',
              color: 'rgba(34, 39, 53, 0.94)',
            }}
          >
            访达
          </span>
          {['文件', '编辑', '显示', '窗口', '帮助'].map((t) => (
            <span key={t} className="mac-menubar-faux-item shrink-0 select-none cursor-default">
              {t}
            </span>
          ))}
        </nav>

        <div
          aria-label="控制中心与状态栏"
          style={{
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            gap: 9,
          }}
        >
          <MenubarHairline />

          <button
            type="button"
            className="mac-menubar-widget-hit"
            aria-label="聚焦搜索"
            title="聚焦搜索（⌘/Ctrl + Space）"
            onClick={(e) => {
              e.stopPropagation();
              setSpotlightOpen((v) => !v);
            }}
            style={{
              padding: '2px 5px',
              ...(spotlightOpen ? { backgroundColor: 'rgba(0, 0, 0, 0.09)' } : {}),
            }}
          >
            <MenubarSpotlightGlyph />
          </button>

          {shell.systemTrayIcons.map((iconUrl, i) => (
            <div key={i} role="presentation" className="mac-menubar-widget-hit" tabIndex={-1}>
              <div
                style={{
                  width: 18,
                  height: 18,
                  margin: '-1px 0',
                  borderRadius: 4,
                  backgroundImage: `url("${iconUrl}")`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                  opacity: 0.93,
                  pointerEvents: 'none',
                }}
              />
            </div>
          ))}

          <MenubarHairline />

          <time
            dateTime={menuBarClock.toISOString()}
            suppressHydrationWarning
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'center',
              lineHeight: 1.06,
              minWidth: 0,
              fontVariantNumeric: 'tabular-nums',
              cursor: 'default',
              letterSpacing: '0.015em',
              paddingRight: '1px',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(50, 53, 61, 0.58)', marginBottom: 1 }}>
              {formatMenuBarCalendarLine(menuBarClock)}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(32, 37, 52, 0.95)' }}>
              {formatTime(menuBarClock)}
            </span>
          </time>
        </div>
      </header>

      <nav
        role="navigation"
        aria-label="程序坞"
        style={{
          position: embedded ? 'absolute' : 'fixed',
          bottom: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 125000,
          maxWidth: dockMaxW,
          overflow: 'visible',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'relative',
            pointerEvents: 'auto',
            overflow: 'visible',
            maxWidth: dockMaxW,
          }}
        >
          <div
            aria-hidden
            style={{
              position: 'absolute',
              left: -18,
              right: -18,
              bottom: 0,
              height: MAC_DOCK_GLASS_HEIGHT_PX,
              borderRadius: 28,
              backdropFilter: 'blur(34px) saturate(185%) brightness(103%)',
              WebkitBackdropFilter: 'blur(34px) saturate(185%) brightness(103%)',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.48) 0%, rgba(232,236,245,0.34) 40%, rgba(215,219,229,0.28) 100%)',
              border: '1px solid rgba(255,255,255,0.86)',
              boxShadow:
                '0 26px 64px rgba(20,36,72,0.16), 0 8px 20px rgba(0,6,38,0.11), inset 0 1.2px 0 rgba(255,255,255,0.93), inset 0 -6px 12px rgba(255,255,255,0.13)',
              pointerEvents: 'none',
            }}
          />
          <div
            ref={dockRowRef}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setDockMx(e.clientX - r.left);
            }}
            onMouseLeave={() => setDockMx(null)}
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'flex-end',
              gap: 6,
              minWidth: 0,
              minHeight: MAC_DOCK_ICON_LAYER_MIN_HEIGHT_PX,
              overflowX: 'auto',
              overflowY: 'hidden',
              scrollbarWidth: 'thin',
              boxSizing: 'border-box',
              padding: '10px 17px 10px',
            }}
          >
            <DockItemSlot>
              <DockLpBtn
                scale={dockScaleAt(0)}
                onClick={(e) => {
                  e.stopPropagation();
                  setLaunchpadOpen((v) => !v);
                  setIsStartMenuOpen(false);
                  setSpotlightOpen(false);
                  setMcOpen(false);
                }}
              />
            </DockItemSlot>
            <DockItemSlot>
              <DockLaunchBtn
                scale={dockScaleAt(1)}
                isOpen={isStartMenuOpen}
                logoUrl={shell.logoUrl}
                onClick={(e) => {
                  handleStartButtonClick(e);
                  setLaunchpadOpen(false);
                  setMcOpen(false);
                }}
              />
            </DockItemSlot>
            <div
              aria-hidden
              style={{
                width: '1px',
                alignSelf: 'stretch',
                minHeight: 52,
                margin: '10px 8px',
                flexShrink: 0,
                opacity: 0.78,
                background:
                  'linear-gradient(180deg, rgba(130,138,154,0) 16%, rgba(110,117,138,0.36) 50%, rgba(130,138,154,0) 84%), linear-gradient(90deg, rgba(255,255,255,0.55), transparent 52%, transparent 48%, rgba(255,255,255,0.35))',
              }}
            />
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: 3,
                flex: '1 1 auto',
                minWidth: 0,
                overflow: 'visible',
                paddingBottom: 2,
              }}
            >
              {dockTileIds.map((appId, wi) => {
                const win = openWindows.find((w) => w.id === appId);
                const pinned = pinnedDockIds.includes(appId);
                return (
                  <DockItemSlot key={appId}>
                    <DockAppTileBtn
                      scale={dockScaleAt(2 + wi)}
                      appId={appId}
                      win={win}
                      pinnedToDock={pinned}
                      draggingDockId={draggingDockId}
                      onActivate={() => handleDockIconActivate(appId)}
                      onPinToDock={() => handlePinDockApp(appId)}
                      onUnpinFromDock={() => handleUnpinDockApp(appId)}
                      onQuitWindow={() => handleWindowClose(appId)}
                      onDockDragStart={(id) => setDraggingDockId(id)}
                      onDockDragEnd={() => setDraggingDockId(null)}
                      onDockReorder={reorderDockWindows}
                    />
                  </DockItemSlot>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {openWindows.map((win) => (
        <XpWindow
          key={win.id}
          win={win}
          onFocus={handleWindowFocus}
          onClose={handleWindowClose}
          onMinimize={handleWindowMinimize}
          onPositionChange={handlePositionChange}
          onSizeChange={handleSizeChange}
        >
          <WindowContent id={win.id} minimized={win.minimized} remountKey={win.contentKey ?? 0} />
        </XpWindow>
      ))}

      {isStartMenuOpen && (
        <StartMenu
          onItemClick={(id) => {
            setIsStartMenuOpen(false);
            openWindow(id);
          }}
          onLogOff={() => setIsStartMenuOpen(false)}
          onTurnOff={() => setIsStartMenuOpen(false)}
          onOpenLaunchpad={() => {
            setIsStartMenuOpen(false);
            setLaunchpadOpen(true);
            setSpotlightOpen(false);
            setMcOpen(false);
          }}
        />
      )}

      <MacSpotlight
        open={spotlightOpen}
        onClose={() => setSpotlightOpen(false)}
        apps={spotlightApps}
        onOpenApp={(id) => openWindow(id)}
        openWindows={openWindows}
      />
      <MacLaunchpad
        open={launchpadOpen}
        onClose={() => setLaunchpadOpen(false)}
        icons={launchpadIconDefs}
        onOpenApp={(id) => openWindow(id)}
      />
      <MacMissionControl
        open={mcOpen}
        onClose={() => setMcOpen(false)}
        windows={openWindows}
        onSelectWindow={handleMissionControlSelect}
      />
    </>
  );
}

function DockItemSlot({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: MAC_DOCK_ITEM_SLOT_PX,
        minWidth: MAC_DOCK_ITEM_SLOT_PX,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
  );
}

function DockLpBtn({ scale, onClick }: { scale: number; onClick: (e: React.MouseEvent) => void }) {
  const [hovered, setHovered] = useState(false);
  const lift = hovered ? -8 : 0;
  const hs = hovered ? 1.08 : 1;
  return (
    <button
      type="button"
      data-dock-item
      aria-label="启动台网格"
      title="启动台（F4）"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 52,
        height: 52,
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.55)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        background: hovered
          ? 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(226,228,237,0.34) 100%)'
          : 'linear-gradient(180deg, rgba(255,255,255,0.42) 0%, rgba(242,243,247,0.28) 100%)',
        boxShadow: hovered
          ? '0 14px 32px rgba(16,42,106,0.18), inset 0 1px 0 rgba(255,255,255,0.94)'
          : '0 10px 24px rgba(16,42,106,0.12), inset 0 1px 0 rgba(255,255,255,0.88)',
        transform: `translateY(${lift}px) scale(${scale * hs})`,
        transformOrigin: 'bottom center',
        transition: 'transform 0.14s ease, box-shadow 0.14s ease',
        padding: 0,
      }}
    >
      <span
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 7px)',
          gap: 3,
          width: 27,
          height: 27,
        }}
        aria-hidden
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} style={{ borderRadius: 2, background: 'rgba(35,35,50,0.88)', aspectRatio: '1' }} />
        ))}
      </span>
    </button>
  );
}

function DockLaunchBtn({
  scale,
  isOpen,
  logoUrl,
  onClick,
}: {
  scale: number;
  isOpen: boolean;
  logoUrl: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const lift = hovered ? -8 : 0;
  const hs = hovered ? 1.08 : 1;
  return (
    <button
      type="button"
      data-dock-item
      data-start-button="true"
      aria-label="开始菜单"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 52,
        height: 52,
        borderRadius: 12,
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        background: isOpen
          ? 'linear-gradient(180deg, rgba(0,122,255,0.34) 0%, rgba(0,122,255,0.17) 100%)'
          : hovered
            ? 'linear-gradient(180deg, rgba(255,255,255,0.58) 0%, rgba(232,236,246,0.36) 100%)'
            : 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(236,239,246,0.24) 100%)',
        boxShadow:
          isOpen || hovered
            ? 'inset 0 1px 0 rgba(255,255,255,0.7), 0 10px 26px rgba(13,53,148,0.15)'
            : '0 6px 16px rgba(13,53,148,0.1), inset 0 1px 0 rgba(255,255,255,0.82)',
        transform: `translateY(${lift}px) scale(${scale * hs})`,
        transformOrigin: 'bottom center',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease',
      }}
    >
      <img src={logoUrl} alt="" style={{ width: 30, height: 30, objectFit: 'contain' }} />
    </button>
  );
}

function DockAppTileBtn({
  scale,
  appId,
  win,
  pinnedToDock,
  draggingDockId,
  onActivate,
  onPinToDock,
  onUnpinFromDock,
  onQuitWindow,
  onDockDragStart,
  onDockDragEnd,
  onDockReorder,
}: {
  scale: number;
  appId: string;
  win: WindowState | undefined;
  pinnedToDock: boolean;
  draggingDockId: string | null;
  onActivate: () => void;
  onPinToDock: () => void;
  onUnpinFromDock: () => void;
  onQuitWindow: () => void;
  onDockDragStart: (id: string) => void;
  onDockDragEnd: () => void;
  onDockReorder: (fromId: string, targetId: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const manifest = APP_REGISTRY[appId];
  const icon = win?.icon ?? manifest?.icon ?? '/assets/icons/healing-journal-app.svg';
  const titleLab = win?.title ?? manifest?.title ?? appId;

  const hasWindow = Boolean(win);
  const active = win ? !win.minimized : false;
  const canReorderTarget = hasWindow;

  const lift = hovered ? -10 : 0;
  const hs = hovered ? 1.1 : 1;
  const DOCK_DND_MIME = 'application/x-moe-dock-window';

  const buttonInner = (
    <button
      type="button"
      data-dock-item
      draggable={hasWindow}
      aria-grabbed={Boolean(win && draggingDockId === win.id)}
      title={`${titleLab}${hasWindow ? ' — 可拖到其它运行中图标上排序' : ''} · 右键：固定或移除`}
      onDragStart={(e) => {
        if (!win) return;
        onDockDragStart(win.id);
        e.dataTransfer.setData(DOCK_DND_MIME, win.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragEnd={() => onDockDragEnd()}
      onDragOver={(e) => {
        if (!canReorderTarget || !draggingDockId || !win) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      }}
      onDrop={(e) => {
        if (!canReorderTarget || !win) return;
        e.preventDefault();
        const fromId = e.dataTransfer.getData(DOCK_DND_MIME);
        if (fromId) onDockReorder(fromId, win.id);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onActivate();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        width: 52,
        height: 52,
        borderRadius: 12,
        border: 'none',
        padding: 5,
        cursor: hasWindow ? 'grab' : 'default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        opacity: win && draggingDockId === win.id ? 0.48 : 1,
        background: hovered
          ? 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(232,237,246,0.36) 100%)'
          : 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(234,239,247,0.26) 100%)',
        boxShadow: hovered
          ? '0 14px 34px rgba(13,53,148,0.16), inset 0 1px 0 rgba(255,255,255,0.92)'
          : '0 8px 20px rgba(13,53,148,0.11), inset 0 1px 0 rgba(255,255,255,0.86)',
        transform: `translateY(${lift}px) scale(${scale * hs})`,
        transformOrigin: 'bottom center',
        transition:
          'transform 0.2s cubic-bezier(0.34, 1.25, 0.64, 1), box-shadow 0.2s ease, opacity 0.15s ease',
      }}
    >
      <img src={icon} alt="" style={{ width: 34, height: 34, objectFit: 'contain' }} />
      {active && (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            bottom: -3,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: 'rgba(18,38,112,0.44)',
          }}
        />
      )}
    </button>
  );

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger asChild>{buttonInner}</ContextMenuTrigger>
      <ContextMenuContent
        lang="zh-CN"
        translate="no"
        onCloseAutoFocus={(e) => e.preventDefault()}
        style={{ fontFamily: MAC_SHELL_FONT }}
      >
        {!pinnedToDock ? (
          <ContextMenuItem lang="zh-CN" translate="no" onSelect={onPinToDock}>
            固定在程序坞
          </ContextMenuItem>
        ) : (
          <ContextMenuItem lang="zh-CN" translate="no" onSelect={onUnpinFromDock}>
            从程序坞移除
          </ContextMenuItem>
        )}
        {hasWindow ? (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem lang="zh-CN" translate="no" variant="destructive" onSelect={onQuitWindow}>
              关闭窗口
            </ContextMenuItem>
          </>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
  );
}
