import { useCallback, useState, type ReactNode } from 'react';

import { listRegisteredAppsSorted } from '@/shell/app-catalog';

export type AppCornerLauncherExtraItem = {
  title: string;
  subtitle?: string;
  glyph?: ReactNode;
  onSelect: () => void;
};

type AppCornerLauncherProps = {
  currentId: string;
  onSelectApp: (id: string) => void;
  /** 网格末尾追加的自定义入口（如「俯视书桌演示」） */
  extraItems?: AppCornerLauncherExtraItem[];
  /**
   * true：按钮与面板相对于「最近的 position:relative」父元素铺满的一层（沉浸式书房窗口内）。
   */
  containInParent?: boolean;
};

/**
 * 固定角落的四宫格按钮 + 应用网格，用于沉浸式书房内切换外壳应用或打开附加场景。
 */
export function AppCornerLauncher({
  currentId,
  onSelectApp,
  extraItems,
  containInParent = false,
}: AppCornerLauncherProps) {
  const [open, setOpen] = useState(false);
  const apps = listRegisteredAppsSorted();

  const close = useCallback(() => setOpen(false), []);

  const posMode = containInParent ? ('absolute' as const) : ('fixed' as const);
  const zFab = containInParent ? 30 : 10_000;
  const zDlg = containInParent ? 45 : 10_001;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="打开应用与场景菜单"
        title="其它应用与场景"
        style={{
          position: posMode,
          top: 10,
          right: 12,
          zIndex: zFab,
          width: 40,
          height: 40,
          borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.22)',
          background: 'rgba(22, 18, 14, 0.72)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          color: '#f5f0e8',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 17,
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
        }}
      >
        <i className="fa-solid fa-border-all" aria-hidden />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="选择应用或场景"
          style={{
            position: posMode,
            inset: 0,
            zIndex: zDlg,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            style={{
              width: 'min(440px, 100%)',
              maxHeight: 'min(78vh, 560px)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 16,
              background: 'linear-gradient(165deg, #2a2420 0%, #1a1512 100%)',
              border: '1px solid rgba(212, 175, 135, 0.25)',
              boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
            }}
          >
            <div
              style={{
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 700, color: '#f5f0e8' }}>应用与场景</span>
              <button
                type="button"
                onClick={close}
                aria-label="关闭"
                style={{
                  border: 'none',
                  background: 'rgba(255,255,255,0.08)',
                  color: '#e8dfd3',
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 16,
                }}
              >
                ×
              </button>
            </div>
            <div
              style={{
                padding: 12,
                overflowY: 'auto',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
              }}
            >
              {apps.map((a) => {
                const on = a.id === currentId;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      onSelectApp(a.id);
                      close();
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                      padding: '12px 8px',
                      borderRadius: 12,
                      border: on ? '1px solid rgba(244, 196, 132, 0.55)' : '1px solid rgba(255,255,255,0.08)',
                      background: on ? 'rgba(244, 196, 132, 0.12)' : 'rgba(255,255,255,0.04)',
                      color: '#f5f0e8',
                      cursor: 'pointer',
                      fontSize: 11,
                      textAlign: 'center',
                    }}
                  >
                    <img src={a.icon} alt="" width={28} height={28} style={{ objectFit: 'contain' }} />
                    <span style={{ lineHeight: 1.35 }}>{a.title}</span>
                  </button>
                );
              })}
              {extraItems?.map((item, idx) => (
                <button
                  key={`extra-${idx}`}
                  type="button"
                  onClick={() => {
                    item.onSelect();
                    close();
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    padding: '12px 8px',
                    borderRadius: 12,
                    border: '1px solid rgba(129, 199, 255, 0.28)',
                    background: 'rgba(45, 80, 120, 0.22)',
                    color: '#e8eef8',
                    cursor: 'pointer',
                    fontSize: 11,
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: 22, lineHeight: 1 }}>{item.glyph ?? '✦'}</span>
                  <span style={{ fontWeight: 650, lineHeight: 1.35 }}>{item.title}</span>
                  {item.subtitle ? (
                    <span style={{ opacity: 0.78, fontSize: 10, lineHeight: 1.3 }}>{item.subtitle}</span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
