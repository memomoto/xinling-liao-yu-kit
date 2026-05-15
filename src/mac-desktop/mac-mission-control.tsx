/**
 * Mission Control：将所有打开窗口以缩略卡片形式平铺（示意预览，非实时截屏）。
 */

import type { WindowState } from '@/mac-desktop/xp-window';

const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif';

interface MacMissionControlProps {
  open: boolean;
  onClose: () => void;
  windows: WindowState[];
  onSelectWindow: (id: string) => void;
}

export function MacMissionControl({ open, onClose, windows, onSelectWindow }: MacMissionControlProps) {
  if (!open) return null;

  const visible = windows.filter((w) => !w.minimized);

  return (
    <div
      role="dialog"
      aria-modal
      aria-label="调度中心"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 135400,
        background: 'rgba(5,5,18,0.78)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        padding: '52px 28px 120px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        animation: 'mcIn 0.3s ease-out',
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes mcIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
      <p style={{ fontFamily: FONT, fontSize: 12, color: 'rgba(255,255,255,0.38)', marginBottom: 20 }}>
        调度中心 — 点击窗口回到前台，点击空白处关闭
      </p>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 18,
          justifyContent: 'center',
          alignContent: 'flex-start',
          flex: 1,
          overflowY: 'auto',
          width: '100%',
          maxWidth: 1200,
        }}
        className="mac-os-scrollbar"
      >
        {visible.length === 0 ? (
          <span style={{ fontFamily: FONT, fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>暂无打开的窗口</span>
        ) : (
          visible.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectWindow(w.id);
                onClose();
              }}
              style={{
                width: 220,
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(28,28,42,0.95)',
                cursor: 'pointer',
                padding: 0,
                textAlign: 'left',
                boxShadow: '0 18px 50px rgba(0,0,0,0.45)',
                transition: 'transform 0.18s ease, border-color 0.18s ease',
                fontFamily: FONT,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.03)';
                e.currentTarget.style.borderColor = 'rgba(100,150,255,0.55)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              }}
            >
              <div
                style={{
                  height: 22,
                  background: 'rgba(45,45,62,0.98)',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: 10,
                  gap: 5,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f56' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#febc2e' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840' }} />
              </div>
              <div
                style={{
                  height: 120,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  padding: 12,
                  background: 'linear-gradient(165deg, rgba(55,55,75,0.5) 0%, rgba(22,22,34,0.9) 100%)',
                }}
              >
                <img src={w.icon} alt="" style={{ width: 44, height: 44, objectFit: 'contain' }} />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.88)', flex: 1, lineHeight: 1.35 }}>{w.title}</span>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
