import type { ReactNode } from 'react';

import './two-column-layout.css';

type TwoColumnLayoutProps = {
  sidebar: ReactNode;
  content: ReactNode;
  windowWidth: number;
  /** 默认 true：内容区再套一层 maxWidth 640 居中；博客阅读等可设为 false */
  constrainContentWidth?: boolean;
};

export function TwoColumnLayout({
  sidebar,
  content,
  windowWidth,
  constrainContentWidth = true,
}: TwoColumnLayoutProps) {
  const isWide = windowWidth > 700;
  return (
    <div className={`tcl-shell ${isWide ? 'tcl-shell--row' : 'tcl-shell--col'}`}>
      <div
        className={`tcl-sidebar paper-app-surface paper-app-scroll ${isWide ? 'tcl-sidebar--row' : 'tcl-sidebar--col'}`}
      >
        {sidebar}
      </div>
      <div className="tcl-main">
        <div className="tcl-scroll paper-app-scroll">
          {constrainContentWidth ? (
            <div className="tcl-inner">{content}</div>
          ) : (
            <div className="tcl-inner tcl-inner--full">{content}</div>
          )}
        </div>
      </div>
    </div>
  );
}
