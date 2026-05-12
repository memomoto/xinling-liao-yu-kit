import type { ReactNode } from 'react';

type TwoColumnLayoutProps = {
  sidebar: ReactNode;
  content: ReactNode;
  windowWidth: number;
  /** 默认 true：内容区再套一层 maxWidth 640 居中；博客阅读等可设为 false */
  constrainContentWidth?: boolean;
};

const BORDER = '1px solid rgba(212, 184, 192, 0.85)';
const SIDEBAR_BG = 'rgba(255, 240, 245, 0.72)';

export function TwoColumnLayout({
  sidebar,
  content,
  windowWidth,
  constrainContentWidth = true,
}: TwoColumnLayoutProps) {
  const isWide = windowWidth > 700;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isWide ? 'row' : 'column',
        flex: 1,
        minHeight: 0,
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: isWide ? 180 : '100%',
          maxHeight: isWide ? '100%' : 220,
          height: isWide ? '100%' : 'auto',
          borderRight: isWide ? BORDER : 'none',
          borderBottom: isWide ? 'none' : BORDER,
          overflowY: 'auto',
          flexShrink: 0,
          background: SIDEBAR_BG,
          boxSizing: 'border-box',
        }}
      >
        {sidebar}
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isWide ? '24px 28px' : '16px',
            minHeight: 0,
          }}
        >
          {constrainContentWidth ? (
            <div style={{ maxWidth: 640, margin: '0 auto', width: '100%' }}>{content}</div>
          ) : (
            content
          )}
        </div>
      </div>
    </div>
  );
}
