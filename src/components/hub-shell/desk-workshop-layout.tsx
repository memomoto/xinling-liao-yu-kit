import React, { useCallback, useState, type ReactNode } from 'react';

import './desk-workshop.css';

export type DeskItemKind = 'eraser' | 'tape' | 'innerChild';

type DeskWorkshopLayoutProps = {
  toolbox: ReactNode;
  children: ReactNode;
  windowWidth: number;
  cocoonMode?: boolean;
  onDeskItem?: (kind: DeskItemKind) => void;
};

const DESK_DND = 'application/x-desk-item';

export function DeskWorkshopLayout({
  toolbox,
  children,
  windowWidth: _windowWidth,
  cocoonMode = false,
  onDeskItem,
}: DeskWorkshopLayoutProps) {
  const [toast, setToast] = useState('');
  const [eraserOver, setEraserOver] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 3200);
  }, []);

  const onDragStartItem = useCallback((e: React.DragEvent<HTMLDivElement>, kind: DeskItemKind) => {
    e.dataTransfer.setData(DESK_DND, kind);
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const onEraserZoneDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setEraserOver(true);
  }, []);

  const onEraserZoneDragLeave = useCallback(() => {
    setEraserOver(false);
  }, []);

  const onEraserZoneDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setEraserOver(false);
      const raw = e.dataTransfer.getData(DESK_DND);
      if (raw === 'eraser') {
        onDeskItem?.('eraser');
        showToast('已切换到认知磁盘清理。');
      } else {
        showToast('请使用右侧标签上的橡皮擦。');
      }
    },
    [onDeskItem, showToast],
  );

  return (
    <div className="dw-root">
      <div className={`dw-desk ${cocoonMode ? 'dw-desk--cocoon' : ''}`}>
        {cocoonMode ? (
          <span
            id="desk-cocoon-notice"
            style={{
              position: 'absolute',
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: 'hidden',
              clip: 'rect(0,0,0,0)',
              border: 0,
            }}
          >
            已进入安全茧模式。
          </span>
        ) : null}

        <div className={`dw-book-shell ${cocoonMode ? 'dw-book-shell--cocoon' : ''}`}>
          <div className="dw-scrapbook-outer">
            <div
              className={`dw-scrapbook ${cocoonMode ? 'dw-scrapbook--cocoon' : ''}`}
              aria-describedby={cocoonMode ? 'desk-cocoon-notice' : undefined}
            >
              <div className="dw-spine-crease" aria-hidden />

              <div className="dw-page dw-page--left">
                <nav className="dw-tool-nav" aria-label="疗愈工具">
                  {toolbox}
                </nav>
                <div
                  className={`dw-eraser-zone ${eraserOver ? 'dw-eraser-zone--over' : ''}`}
                  onDragOver={onEraserZoneDragOver}
                  onDragLeave={onEraserZoneDragLeave}
                  onDrop={onEraserZoneDrop}
                >
                  将右侧「认知清理橡皮擦」拖放到此处
                </div>
              </div>

              <div className="dw-page dw-page--right">
                <div className="dw-page-scroll">{children}</div>
              </div>
            </div>

            <aside className="dw-edge-tabs" aria-label="桌上的工具">
              <div
                className="dw-edge-tab"
                draggable
                onDragStart={(e) => onDragStartItem(e, 'eraser')}
                role="button"
                tabIndex={0}
                onClick={() => onDeskItem?.('eraser')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onDeskItem?.('eraser');
                  }
                }}
              >
                <i className="fa-solid fa-eraser dw-edge-tab__icon" aria-hidden />
                <span className="dw-edge-tab__label">认知清理橡皮擦</span>
              </div>

              <button
                type="button"
                className="dw-edge-tab dw-edge-tab--btn"
                onClick={() => onDeskItem?.('tape')}
              >
                <i className="fa-solid fa-cassette-tape dw-edge-tab__icon" aria-hidden />
                <span className="dw-edge-tab__label">音胶囊磁带</span>
              </button>

              <button
                type="button"
                className="dw-edge-tab dw-edge-tab--btn"
                onClick={() => onDeskItem?.('innerChild')}
              >
                <i className="fa-solid fa-ghost dw-edge-tab__icon" aria-hidden />
                <span className="dw-edge-tab__label">内在小孩</span>
              </button>
            </aside>
          </div>
        </div>
      </div>

      {toast ? <div className="dw-toast">{toast}</div> : null}
    </div>
  );
}
