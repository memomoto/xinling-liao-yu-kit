/**
 * 书桌 → 笔电 / 手账 视角演示（纯 CSS，无 Tailwind）。
 * 开发环境在地址栏加 `?deskPrototype=1` 查看（见 main.tsx）。
 */
import { useCallback, useState } from 'react';

import './healing-desk-prototype.css';

type View = 'desk' | 'laptop' | 'book';

type MockCard = { id: number; tag: string; content: string };

const MOCK_CARDS: MockCard[] = [
  {
    id: 1,
    tag: '#边界',
    content:
      '我更习惯用这样的方式沟通（线上留言/约具体时段），突然的打扰我会很难回应。',
  },
  {
    id: 2,
    tag: '#边界',
    content: '这个请求超出了我能承担的范围，我只能说不，并不是针对你这个人。',
  },
  {
    id: 3,
    tag: '#情感',
    content: '我很在意你的感受，但我也需要诚实——这件事我做不到。',
  },
];

type HealingDeskPrototypeProps = {
  /** 嵌入右上方面板等窄容器时使用：叠层限定在组件内缩放，不占满整页 */
  embedded?: boolean;
  /** 占满父级高度（如弹窗内容区）；勿与 embedded 同时使用 */
  fillParent?: boolean;
  /**
   * 根级物理书桌：点击笔电时交给外层（进入真仿 Mac 壳），不打开本组件内置的笔电演示层。
   */
  onPhysicalLaptopOpen?: () => void;
};

export function HealingDeskPrototype({
  embedded = false,
  fillParent = false,
  onPhysicalLaptopOpen,
}: HealingDeskPrototypeProps) {
  const [currentView, setCurrentView] = useState<View>('desk');
  const [toast, setToast] = useState<string | null>(null);
  const physicalLaptop = Boolean(onPhysicalLaptopOpen);

  const openLaptop = useCallback(() => {
    if (onPhysicalLaptopOpen) {
      onPhysicalLaptopOpen();
      return;
    }
    setCurrentView('laptop');
  }, [onPhysicalLaptopOpen]);

  const copyLine = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast('已复制');
    } catch {
      setToast('复制失败，可手动选中文字');
    }
    window.setTimeout(() => setToast(null), 1800);
  }, []);

  const deskBody = (
    <>
      <div className="hdp-desk-bg" aria-hidden>
        <div className="hdp-desk-grain" />
      </div>

      <div
        className={`hdp-desk-stage${currentView !== 'desk' ? ' hdp-desk-stage--hidden' : ''}${embedded ? ' hdp-desk-stage--embed' : ''}`}
        aria-hidden={currentView !== 'desk'}
      >
        <button type="button" className="hdp-journal" onClick={() => setCurrentView('book')}>
          <span className="hdp-journal-spine-line" />
          <span className="hdp-journal-ribbon" />
          <span className="hdp-journal-title">
            My
            <br />
            Journal
          </span>
          <span className="hdp-journal-hint">翻开手账</span>
        </button>

        <button type="button" className={`hdp-laptop${physicalLaptop ? ' hdp-laptop--physical-prop' : ''}`} onClick={openLaptop}>
          <span className="hdp-laptop-hinge" />
          <div className="hdp-laptop-lid">
            <span className="hdp-laptop-logo-ring">
              <span className="hdp-laptop-logo">
                <span className="hdp-laptop-logo-dot" />
              </span>
            </span>
          </div>
          <div className="hdp-laptop-base">
            <span className="hdp-laptop-base-led" />
          </div>
          <span className="hdp-laptop-hint">{physicalLaptop ? '打开电脑' : '开启数字疗愈舱'}</span>
        </button>
      </div>

      {!physicalLaptop ? (
      <div
        className={`hdp-laptop-overlay${currentView === 'laptop' ? '' : ' hdp-laptop-overlay--off'}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={currentView !== 'laptop'}
      >
        <div className="hdp-monitor-shell">
          <div className="hdp-monitor-top">
            <span className="hdp-monitor-cam" />
            <button type="button" className="hdp-close-btn" onClick={() => setCurrentView('desk')}>
              合上电脑
            </button>
          </div>
          <div className="hdp-screen-inner">
            <aside className="hdp-os-sidebar" aria-label="示意导航">
              <div className="hdp-os-brand">心灵疗愈</div>
              <div className="hdp-os-nav">
                <div className="hdp-os-nav-item hdp-os-nav-item--on">
                  <span>🗂️</span> 疗愈工具箱
                </div>
                <div className="hdp-os-nav-item">
                  <span>🌱</span> 每日修复
                </div>
                <div className="hdp-os-nav-item">
                  <span>📥</span> 情绪释放站
                </div>
              </div>
            </aside>
            <div className="hdp-os-main paper-app-surface">
              <h1 className="hdp-os-title">工具与互动</h1>
              <p className="hdp-os-lead">
                外框仍是「显示器里的 OS」；列表用纸质感分隔，与右侧手账世界更少冲突。
              </p>
              <div className="hdp-card-list">
                {MOCK_CARDS.map((card) => (
                  <article key={card.id} className="hdp-card">
                    <span className="hdp-card-tag">{card.tag}</span>
                    <p className="hdp-card-text">{card.content}</p>
                    <div className="hdp-card-actions">
                      <button type="button" className="hdp-copy-btn" onClick={() => copyLine(card.content)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path
                            d="M8 7V5a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2M8 7h8a2 2 0 012 2v2"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                        复制这句话
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      ) : null}

      <div
        className={`hdp-book-overlay${currentView === 'book' ? '' : ' hdp-book-overlay--off'}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={currentView !== 'book'}
      >
        <div className="hdp-book-wrap">
          <button type="button" className="hdp-book-back-btn" onClick={() => setCurrentView('desk')}>
            返回桌面
          </button>
          <div className="hdp-book-page hdp-book-page--left">
            <h2 className="hdp-book-h2">纯粹的自述空间</h2>
            <p className="hdp-book-p">
              这里的环境依然属于纸与笔。
              <br />
              用来承载你不想被任何按钮打扰的万字长文。
            </p>
          </div>
          <div className="hdp-book-page hdp-book-page--right">
            <span className="hdp-book-gutter" aria-hidden />
          </div>
        </div>
      </div>

      {toast ? (
        <div
          role="status"
          className={embedded ? 'hdp-toast hdp-toast--embed' : 'hdp-toast'}
        >
          {toast}
        </div>
      ) : null}
    </>
  );

  return (
    <div
      className={`hdp-root${embedded ? ' hdp-root--embedded' : ''}${fillParent ? ' hdp-root--fill-parent' : ''}`}
    >
      {embedded ? (
        <div className="hdp-embed-canvas">
          <div className="hdp-embed-inner">{deskBody}</div>
        </div>
      ) : (
        deskBody
      )}
    </div>
  );
}
