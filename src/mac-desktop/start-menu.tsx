/**
 * Finder 风格开始菜单：应用列表 + 右侧收藏网格（独立版无「我的电脑」，收藏即注册应用快捷方式）。
 */

import React from 'react';

import { MAC_DOCK_PX } from '@/config/ping_guo_ke_jie_mian_chi_cun';
import { useMacEmbedded } from '@/mac-desktop/mac-embedded-context';
import { APP_REGISTRY } from '@/apps/registry';

const MAC_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif';

const PROGRAMS = Object.values(APP_REGISTRY).map((a) => ({
  id: a.id,
  icon: a.icon,
  label: a.title,
  highlight: a.id === 'healingToolboxHub',
}));

const FAVORITES = Object.values(APP_REGISTRY)
  .filter((a) => a.id !== 'siteReadme')
  .slice(0, 8);

interface StartMenuProps {
  onItemClick?: (id: string) => void;
  onLogOff?: () => void;
  onTurnOff?: () => void;
  onOpenLaunchpad?: () => void;
}

export function StartMenu({ onItemClick, onLogOff, onTurnOff, onOpenLaunchpad }: StartMenuProps) {
  const embedded = useMacEmbedded();
  return (
    <div
      style={{
        position: 'fixed',
        bottom: `${MAC_DOCK_PX + 12}px`,
        left: 'max(16px, env(safe-area-inset-left))',
        width: embedded ? 'min(540px, calc(100% - 32px))' : 'min(540px, calc(100vw - 32px))',
        zIndex: 129500,
        borderRadius: 14,
        overflow: 'hidden',
        fontFamily: MAC_FONT,
        fontSize: 13,
        userSelect: 'none',
        border: '1px solid rgba(255,255,255,0.55)',
        boxShadow: '0 28px 80px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.65)',
        backdropFilter: 'blur(36px) saturate(175%)',
        WebkitBackdropFilter: 'blur(36px) saturate(175%)',
        background: 'linear-gradient(180deg, rgba(252,252,254,0.82) 0%, rgba(238,240,246,0.76) 100%)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 14px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(245,246,250,0.35) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, position: 'relative', zIndex: 2 }}>
          <DotBtn color="#ff5f57" border="#e34940" title="关闭" onClick={() => onLogOff?.()} glyph="×" />
          <DotBtn color="#febc2e" border="#dba727" title="最小化" onClick={() => onLogOff?.()} glyph="−" />
          <DotBtn color="#28c840" border="#21a332" title="关闭菜单" onClick={() => onLogOff?.()} glyph="" />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(35,40,55,0.82)', letterSpacing: '0.02em' }}>
          应用程序与文件夹
        </span>
      </div>

      <div style={{ display: 'flex', minHeight: 380, maxHeight: 'min(52vh, 440px)' }}>
        <div
          style={{
            flex: '1 1 52%',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '10px 8px',
            borderRight: '1px solid rgba(0,0,0,0.06)',
            background: 'rgba(255,255,255,0.35)',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(0,0,0,0.38)', padding: '4px 10px 8px' }}>
            应用程序
          </div>
          {PROGRAMS.map((prog, idx) => (
            <React.Fragment key={prog.id}>
              {idx === 1 && <Hairline />}
              <ProgramRow prog={prog} onPick={() => onItemClick?.(prog.id)} />
            </React.Fragment>
          ))}
          <div style={{ marginTop: 'auto', paddingTop: 8 }}>
            <Hairline />
            <AllProgramsRow onOpenLaunchpad={onOpenLaunchpad} />
          </div>
        </div>

        <div
          style={{
            flex: '1 1 48%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: 'rgba(248,249,252,0.55)',
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'rgba(0,0,0,0.38)',
              padding: '14px 14px 8px',
              letterSpacing: '0.04em',
            }}
          >
            个人收藏
          </div>
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '8px 12px 14px',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 10,
              alignContent: 'start',
            }}
          >
            {FAVORITES.map((app) => (
              <PlaceTile
                key={app.id}
                icon={app.icon}
                label={app.title}
                onOpen={() => onItemClick?.(app.id)}
              />
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 10,
          padding: '12px 14px',
          borderTop: '1px solid rgba(0,0,0,0.06)',
          background: 'linear-gradient(180deg, rgba(245,246,250,0.65) 0%, rgba(232,234,242,0.55) 100%)',
        }}
      >
        <MacPillButton label="注销…" onClick={onLogOff} subtle />
        <MacPillButton label="关机…" onClick={onTurnOff} />
      </div>
    </div>
  );
}

function Hairline() {
  return <div style={{ height: 1, margin: '6px 10px', background: 'rgba(0,0,0,0.07)' }} />;
}

function ProgramRow({ prog, onPick }: { prog: (typeof PROGRAMS)[number]; onPick: () => void }) {
  const [hovered, setHovered] = React.useState(false);
  const active = prog.highlight || hovered;
  return (
    <button
      type="button"
      onClick={onPick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 12px',
        margin: '2px 4px',
        borderRadius: 10,
        border: 'none',
        cursor: 'pointer',
        width: 'calc(100% - 8px)',
        textAlign: 'left',
        fontFamily: MAC_FONT,
        fontSize: 13,
        fontWeight: prog.highlight ? 600 : 500,
        color: 'rgba(28,32,45,0.92)',
        background: active ? 'rgba(90,140,255,0.16)' : 'transparent',
        boxShadow: active ? 'inset 0 0 0 1px rgba(90,140,255,0.22)' : 'none',
        transition: 'transform 0.15s ease, background 0.15s ease',
        transform: hovered ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      <img
        src={prog.icon}
        alt=""
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          objectFit: 'contain',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      />
      <span>{prog.label}</span>
    </button>
  );
}

function PlaceTile({ icon, label, onOpen }: { icon: string; label: string; onOpen: () => void }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '12px 8px',
        borderRadius: 12,
        border: 'none',
        cursor: 'pointer',
        fontFamily: MAC_FONT,
        fontSize: 11,
        fontWeight: 600,
        color: 'rgba(35,40,55,0.88)',
        background: hovered ? 'rgba(90,140,255,0.12)' : 'rgba(255,255,255,0.45)',
        boxShadow: hovered
          ? '0 6px 18px rgba(40,60,120,0.12), inset 0 1px 0 rgba(255,255,255,0.7)'
          : '0 2px 10px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.65)',
        transition: 'transform 0.18s cubic-bezier(0.34, 1.3, 0.64, 1), box-shadow 0.18s ease, background 0.18s ease',
        transform: hovered ? 'scale(1.06)' : 'scale(1)',
      }}
    >
      <img
        src={icon}
        alt=""
        style={{
          width: 44,
          height: 44,
          objectFit: 'contain',
          filter: hovered ? 'drop-shadow(0 4px 10px rgba(60,90,180,0.25))' : undefined,
        }}
      />
      <span style={{ textAlign: 'center', lineHeight: 1.25, wordBreak: 'break-word' }}>{label}</span>
    </button>
  );
}

function AllProgramsRow({ onOpenLaunchpad }: { onOpenLaunchpad?: () => void }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      type="button"
      onClick={() => onOpenLaunchpad?.()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        margin: '4px',
        borderRadius: 10,
        border: 'none',
        cursor: 'pointer',
        width: 'calc(100% - 8px)',
        fontFamily: MAC_FONT,
        fontSize: 12,
        fontWeight: 600,
        color: 'rgba(55,65,85,0.65)',
        background: hovered ? 'rgba(0,0,0,0.04)' : 'transparent',
      }}
    >
      <span>全部应用程序（Launchpad）</span>
      <span style={{ fontSize: 10, opacity: 0.55 }}>F4</span>
    </button>
  );
}

function MacPillButton({
  label,
  onClick,
  subtle,
}: {
  label: string;
  onClick?: () => void;
  subtle?: boolean;
}) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '8px 16px',
        borderRadius: 999,
        border: subtle ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(70,110,230,0.35)',
        cursor: 'pointer',
        fontFamily: MAC_FONT,
        fontSize: 13,
        fontWeight: 600,
        color: subtle ? 'rgba(45,55,75,0.85)' : '#fff',
        background: subtle
          ? hovered
            ? 'rgba(255,255,255,0.75)'
            : 'rgba(255,255,255,0.45)'
          : hovered
            ? 'linear-gradient(180deg, #6b9dff 0%, #4f72ea 100%)'
            : 'linear-gradient(180deg, #5d8fff 0%, #4568e5 100%)',
        boxShadow: subtle
          ? '0 2px 8px rgba(0,0,0,0.06)'
          : '0 6px 18px rgba(70,110,230,0.35), inset 0 1px 0 rgba(255,255,255,0.35)',
        transition: 'transform 0.15s ease, filter 0.15s ease',
        transform: hovered ? 'scale(1.04)' : 'scale(1)',
      }}
    >
      {label}
    </button>
  );
}

function DotBtn({
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
      title={title}
      aria-label={title}
      onPointerDown={(e) => e.stopPropagation()}
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
          background: hovered ? `linear-gradient(180deg, ${color}, ${color}dd)` : color,
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(0,0,0,0.45)',
          fontSize: 9,
          fontWeight: 700,
          pointerEvents: 'none',
        }}
      >
        {glyph ? <span style={{ opacity: hovered ? 1 : 0 }}>{glyph}</span> : null}
      </span>
    </button>
  );
}
