import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { ImmersiveStudyRoomLayout } from '@/components/hub-shell/immersive-study-room-layout';
import { HeartFlowerRoomProvider } from '@/contexts/heart-flower-room-sync';
import { AppCornerLauncher } from '@/shell/app-corner-launcher';
import { HEALING_OPEN_APP_EVENT } from '@/shell/cross-shell-events';
import { useContainerWidth } from '@/hooks/use-container-width';
import { GroundingToolkitApp } from '@/apps/zhuo_lu_ji_jiu_xiang';
import { PanicGroundingKitApp } from '@/apps/panic-grounding-kit';
import { KindBoundaryExitApp } from '@/apps/tao_hao_jin_ji_kou';
import { PerspectiveSwitchApp } from '@/apps/perspective-switch';
import { MemoryAttributeEditorApp } from '@/apps/memory-attribute-editor';
import { BoundaryFirewallApp } from '@/apps/boundary-firewall';
import { CognitiveDiskCleanupApp } from '@/apps/cognitive-disk-cleanup';
import { HealingInteractionsApp } from '@/apps/healing-interactions';
import { HealingJournalApp } from '@/apps/healing-journal';
import { WrongAnswerHealApp } from '@/apps/dan_nian_cuoti';
import { KnowledgeClassroomApp } from '@/apps/zhi_shi_xiao_ke_tang';
import { ResumeApp } from '@/apps/resume';
import { HEALING_TOOLBOX_SIBLING_APP_IDS } from '@/apps/healing-sibling-apps';
import { MacEmbeddedProvider, useMacEmbedded } from '@/mac-desktop/mac-embedded-context';
import { MacHomePage } from '@/mac-desktop/mac-home-page';

import '@/shell/root-desk-scene.css';
import './healing-tablet-modal.css';
import './toolbox-mac-embed.css';

/** 书架书脊：星露谷式低饱和马卡龙循环（底色） */
const SPINE_MACARON_BG = ['#CDE4ED', '#FDF0CC', '#D4EACD', '#E0D5E7', '#F5D6D9'] as const;

function spineMacaron(index: number): string {
  return SPINE_MACARON_BG[index % SPINE_MACARON_BG.length]!;
}

/** 书桌实体书翻开：仅 slow-read / 纸本类模块 */
type BookEntityModule =
  | 'grounding'
  | 'journal'
  | 'perspective'
  | 'knowledgeClassroom'
  | 'wrongAnswer'
  | 'resume';

/** 疗愈平板（仿 Mac）内工具箱侧栏：仅数字 / 交互类模块 */
type ToolboxTabletModule =
  | 'panic'
  | 'kindBoundary'
  | 'memory'
  | 'boundary'
  | 'cognitive'
  | 'innerChild';

const MODULE_TITLE: Record<BookEntityModule | ToolboxTabletModule, string> = {
  grounding: '5-4-3-2-1 着陆箱',
  journal: '我的手账',
  perspective: '视角切换',
  knowledgeClassroom: '知识小课堂',
  wrongAnswer: '当年错题',
  resume: '项目说明',
  panic: '蓝屏急救包',
  kindBoundary: '讨好模式紧急出口',
  memory: '记忆属性',
  boundary: '边界防火墙',
  cognitive: '认知磁盘清理',
  innerChild: '内在小孩对话',
};

/** Mac 窗口内左侧导航：仅荧屏模块（实体书请在书房书架打开） */
const EMBED_NAV_GROUPS: ReadonlyArray<{ heading: string; modules: ToolboxTabletModule[] }> = [
  { heading: '荧屏·互动', modules: ['panic', 'innerChild', 'cognitive', 'memory', 'kindBoundary', 'boundary'] },
];

function renderTabletToolboxModule(active: ToolboxTabletModule) {
  switch (active) {
    case 'panic':
      return <PanicGroundingKitApp />;
    case 'kindBoundary':
      return <KindBoundaryExitApp />;
    case 'memory':
      return <MemoryAttributeEditorApp />;
    case 'boundary':
      return <BoundaryFirewallApp />;
    case 'cognitive':
      return <CognitiveDiskCleanupApp />;
    case 'innerChild':
      return <HealingInteractionsApp />;
    default:
      return null;
  }
}

function renderBookEntityModule(active: BookEntityModule) {
  switch (active) {
    case 'grounding':
      return <GroundingToolkitApp />;
    case 'journal':
      return <HealingJournalApp />;
    case 'perspective':
      return <PerspectiveSwitchApp />;
    case 'knowledgeClassroom':
      return <KnowledgeClassroomApp />;
    case 'wrongAnswer':
      return <WrongAnswerHealApp />;
    case 'resume':
      return <ResumeApp />;
    default:
      return null;
  }
}

/** 桌上的轻量 iPad（关）；点开后用 `HealingToolboxTabletModal` 居中放大，屏内仅挂载仿系统 */
function HealingToolboxDeskTabletClosed({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="isr-laptop-mount">
      <button type="button" className="hts-desk-tablet-closed" onClick={onOpen} aria-label="点击开启疗愈舱">
        <span className="hts-desk-tablet-slit" aria-hidden />
        <span className="hts-desk-tablet-hint">点击开启疗愈舱</span>
      </button>
    </div>
  );
}

function HealingToolboxTabletModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return createPortal(
    <div
      className="hts-tablet-modal-root"
      role="dialog"
      aria-modal="true"
      aria-label="疗愈平板"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="hts-tablet-modal-shell">
        <div className="hts-tablet-modal-sensor" aria-hidden />
        <button type="button" className="hts-tablet-modal-close" onClick={onClose}>
          合上平板
        </button>
        <div className="hts-tablet-modal-screen">
          <div className="rds-screen-surface hts-tablet-mac-fill">
            <MacEmbeddedProvider>
              <MacHomePage />
            </MacEmbeddedProvider>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function HealingToolboxMacEmbedPanel() {
  const [active, setActive] = useState<ToolboxTabletModule>('panic');
  const content = useMemo(() => renderTabletToolboxModule(active), [active]);

  return (
    <div className="htb-mac-embed-root">
      <nav className="htb-mac-embed-sidebar" aria-label="疗愈工具箱模块">
        {EMBED_NAV_GROUPS.map((g) => (
          <div key={g.heading}>
            <div className="htb-mac-embed-side-h">{g.heading}</div>
            {g.modules.map((id) => (
              <button
                key={id}
                type="button"
                className={`htb-mac-embed-nav-btn ${active === id ? 'htb-mac-embed-nav-btn--on' : ''}`}
                onClick={() => setActive(id)}
              >
                {MODULE_TITLE[id]}
              </button>
            ))}
          </div>
        ))}
        <div className="htb-mac-embed-side-h" style={{ marginTop: 14 }}>
          姊妹应用
        </div>
        <p style={{ margin: '0 6px 10px', fontSize: 10, lineHeight: 1.45, color: 'rgba(235,226,212,0.45)' }}>
          纸本慢读模块请在书房书架打开实体书；其它姊妹应用请在平板已展开时点击书架最下层姊妹书脊。
        </p>
      </nav>
      <main className="htb-mac-embed-main">
        <div className="htb-mac-embed-banner">{MODULE_TITLE[active]}</div>
        <div className="htb-mac-embed-sheet">{content}</div>
      </main>
    </div>
  );
}

/** 注册表里除本书房外的应用 — 书脊展示（姊妹 id 顺序须与 healing-sibling-apps.ts 一致） */
const SIBLING_SPINE: Record<string, { label: string; iconClass: string; heightPx: number; compact?: boolean }> = {
  mindSpaceHub: {
    label: '心灵空间',
    iconClass: 'fa-solid fa-cloud',
    heightPx: 168,
    compact: true,
  },
  dailyRepairHub: {
    label: '每日修复',
    iconClass: 'fa-solid fa-sun',
    heightPx: 156,
    compact: true,
  },
  selfKnowledgeHub: {
    label: '自我认知',
    iconClass: 'fa-solid fa-graduation-cap',
    heightPx: 174,
    compact: true,
  },
  healingPlayHub: {
    label: '疗愈互动',
    iconClass: 'fa-solid fa-masks-theater',
    heightPx: 166,
    compact: true,
  },
  emotionReleaseStation: {
    label: '情绪释放',
    iconClass: 'fa-solid fa-wind',
    heightPx: 162,
    compact: true,
  },
  siteReadme: {
    label: '项目说明',
    iconClass: 'fa-solid fa-circle-info',
    heightPx: 150,
    compact: true,
  },
};

const SIBLING_TOOLTIP_TITLE: Record<string, string> = {
  mindSpaceHub: '心灵空间',
  dailyRepairHub: '每日修复',
  selfKnowledgeHub: '自我认知',
  healingPlayHub: '疗愈互动与叙事',
  emotionReleaseStation: '情绪释放站',
  siteReadme: '项目说明',
};

function BookSpine({
  heightPx,
  background,
  label,
  iconClass,
  onOpen,
  compact,
  spineTitle,
}: {
  heightPx: number;
  background: string;
  label: string;
  iconClass: string;
  onOpen: () => void;
  compact?: boolean;
  spineTitle?: string;
}) {
  return (
    <button
      type="button"
      className={`isr-book-spine${compact ? ' isr-book-spine--compact' : ''}`}
      style={{ height: heightPx, background }}
      title={spineTitle ?? label}
      onClick={onOpen}
    >
      <span>{label}</span>
      <i className={`isr-book-icon ${iconClass}`} aria-hidden />
    </button>
  );
}

/**
 * 【物理世界 Root】沉浸式书房书架 + 幕布 + 书桌上手账与 iPad 平板；
 * 平板屏幕内仅能是仿 Mac（见 `MacHomePage`）。
 * 当作为 Mac 窗口内应用挂载时：`useMacEmbedded()` 为 true，仅渲染纸片式工具面板。
 */
export function HealingToolboxHubApp() {
  const embedded = useMacEmbedded();
  if (embedded) {
    return <HealingToolboxMacEmbedPanel />;
  }
  return <HealingToolboxHubPhysical />;
}

/** 顶层全屏疗愈书房：合上平板时不挂载仿 Mac */
function HealingToolboxHubPhysical() {
  const { ref } = useContainerWidth();
  const [scene, setScene] = useState<'room' | 'book'>('room');
  const [active, setActive] = useState<BookEntityModule>('grounding');
  const [isProjectorDown, setIsProjectorDown] = useState(false);
  const [isTabletOpen, setIsTabletOpen] = useState(false);

  const closeTablet = useCallback(() => {
    setIsTabletOpen(false);
  }, []);

  const openTablet = useCallback(() => {
    setIsTabletOpen(true);
  }, []);

  const enterBook = useCallback(
    (id: BookEntityModule) => {
      setActive(id);
      if (isProjectorDown) {
        setIsProjectorDown(false);
        window.setTimeout(() => {
          setScene('book');
        }, 580);
      } else {
        setScene('book');
      }
    },
    [isProjectorDown],
  );

  const relayOpenAppToMac = useCallback((id: string) => {
    window.dispatchEvent(new CustomEvent(HEALING_OPEN_APP_EVENT, { detail: { id } }));
  }, []);

  /** 姊妹书脊：绝不自动展开平板；仅在用户已打开疗愈平板时转发开窗事件 */
  const relaySiblingIfTabletOpen = useCallback(
    (id: string) => {
      if (!isTabletOpen) return;
      relayOpenAppToMac(id);
    },
    [isTabletOpen, relayOpenAppToMac],
  );

  const siblingShelfIds = useMemo(
    () => HEALING_TOOLBOX_SIBLING_APP_IDS.filter((id) => id !== 'siteReadme' && id !== 'selfKnowledgeHub'),
    [],
  );

  const content = useMemo(() => renderBookEntityModule(active), [active]);

  const backToRoom = useCallback(() => {
    setScene('room');
  }, []);

  const toggleProjector = useCallback(() => {
    setIsProjectorDown((v) => !v);
  }, []);

  const openNotebook = useCallback(() => {
    enterBook('journal');
  }, [enterBook]);

  const introParagraphs = useMemo(() => {
    const t = MODULE_TITLE[active];
    if (active === 'journal') {
      return (
        <>
          <p className="isr-intro-p">
            在这本手账里，你可以写下毫无删减的长篇自述。纸页的纹理会承接情绪，尽量不让冰冷的系统边框打扰你。
          </p>
        </>
      );
    }
    if (active === 'grounding') {
      return (
        <>
          <p className="isr-intro-p">
            这里可以收纳 5-4-3-2-1 着陆练习：用感官一点点回到当下。右侧是具体操作区，请给自己一点时间。
          </p>
        </>
      );
    }
    if (active === 'perspective') {
      return (
        <>
          <p className="isr-intro-p">
            左边是简短的引导与可读文字，右侧是本页的练习位。慢慢来，不要求一次做完。
          </p>
        </>
      );
    }
    if (active === 'knowledgeClassroom') {
      return (
        <>
          <p className="isr-intro-p">
            像在纸本条目册里查阅词条一样浏览短文：左侧可作检索与摘要，右侧是完整阅读区。
          </p>
        </>
      );
    }
    if (active === 'wrongAnswer') {
      return (
        <>
          <p className="isr-intro-p">一页浅色试卷纸：写给当年的错题。动笔很轻，仪式可以随意打断。</p>
        </>
      );
    }
    if (active === 'resume') {
      return (
        <>
          <p className="isr-intro-p">本页的条文式排版更适合当作纸本附录——项目是写给来访者与自己的备忘录。</p>
        </>
      );
    }
    return (
      <>
        <p className="isr-intro-p">
          这里是 <strong>{t}</strong> 的专属书页。从左侧书架抽出典籍，或从桌面翻开手账时，周遭会像停顿一拍般安静下来。
        </p>
        <p className="isr-intro-p">每一个模块，都是一页可以被温柔阅读与书写的陪伴。</p>
      </>
    );
  }, [active]);

  const siblingBooks = useMemo(() => {
    return siblingShelfIds.map((id, shelfIdx) => {
      const spine = SIBLING_SPINE[id] ?? {
        label: id,
        iconClass: 'fa-solid fa-book',
        heightPx: 158,
        compact: true as const,
      };
      const paletteIndex = 7 + shelfIdx;
      const tip = SIBLING_TOOLTIP_TITLE[id] ?? id;
      return (
        <BookSpine
          key={id}
          heightPx={spine.heightPx}
          background={spineMacaron(paletteIndex)}
          label={spine.label}
          iconClass={spine.iconClass}
          compact={spine.compact}
          spineTitle={`${tip}（请先点开书桌疗愈平板，再点此跳转）`}
          onOpen={() => relaySiblingIfTabletOpen(id)}
        />
      );
    });
  }, [siblingShelfIds, relaySiblingIfTabletOpen]);

  const handleCornerLauncherSelect = useCallback(
    (id: string) => {
      if (isTabletOpen) {
        relayOpenAppToMac(id);
        return;
      }
      setIsTabletOpen(true);
      /** 仿 Mac 尚未挂载：待打开平板后派发 */
      window.setTimeout(() => relayOpenAppToMac(id), 420);
    },
    [isTabletOpen, relayOpenAppToMac],
  );

  const bookshelf = (
    <>
      <div className="isr-shelf-row">
        <span className="isr-shelf-label">I. 纸本·慢读</span>
        <BookSpine
          heightPx={176}
          background={spineMacaron(0)}
          label="知识小课堂"
          iconClass="fa-solid fa-book-open-reader"
          spineTitle="在实体书本交互区摊开词条读物"
          onOpen={() => enterBook('knowledgeClassroom')}
        />
        <BookSpine
          heightPx={168}
          background={spineMacaron(1)}
          label="项目说明"
          iconClass="fa-solid fa-circle-info"
          spineTitle="在实体书本交互区阅读项目说明"
          onOpen={() => enterBook('resume')}
        />
        <BookSpine
          heightPx={162}
          background={spineMacaron(2)}
          label="我的手账"
          iconClass="fa-solid fa-book-open"
          spineTitle="在手帐页面摊开"
          onOpen={() => enterBook('journal')}
        />
      </div>
      <div className="isr-shelf-row">
        <span className="isr-shelf-label">II. 练习册</span>
        <BookSpine
          heightPx={170}
          background={spineMacaron(3)}
          label="当年错题"
          iconClass="fa-solid fa-pen-fancy"
          spineTitle="在实体书本交互区写给当年的错题"
          onOpen={() => enterBook('wrongAnswer')}
        />
        <BookSpine
          heightPx={154}
          background={spineMacaron(4)}
          label="视角切换"
          iconClass="fa-solid fa-arrows-rotate"
          spineTitle="在手帐页面摊开"
          onOpen={() => enterBook('perspective')}
        />
        <BookSpine
          heightPx={168}
          background={spineMacaron(5)}
          label="5-4-3-2-1"
          iconClass="fa-solid fa-hand-sparkles"
          spineTitle="在实体书本交互区展开着陆练习"
          onOpen={() => enterBook('grounding')}
        />
      </div>
      <div className="isr-shelf-row">
        <span className="isr-shelf-label">IV. 姊妹书房</span>
        {siblingBooks}
      </div>
    </>
  );

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <AppCornerLauncher
        containInParent={false}
        currentId="healingToolboxHub"
        onSelectApp={handleCornerLauncherSelect}
      />
      <HeartFlowerRoomProvider>
        <ImmersiveStudyRoomLayout
          bookshelf={bookshelf}
          scene={scene}
          activeTitle={MODULE_TITLE[active]}
          introParagraphs={introParagraphs}
          isProjectorDown={isProjectorDown}
          onToggleProjector={toggleProjector}
          onNotebookClick={openNotebook}
          onBackFromBook={backToRoom}
          cocoonMode={false}
          windowScenerySrc={null}
          deskExtras={
            isTabletOpen ? (
              <div className="hts-desk-tablet-spacer" aria-hidden />
            ) : (
              <HealingToolboxDeskTabletClosed onOpen={openTablet} />
            )
          }
        >
          {content}
        </ImmersiveStudyRoomLayout>
      </HeartFlowerRoomProvider>
      {isTabletOpen ? <HealingToolboxTabletModal onClose={closeTablet} /> : null}
    </div>
  );
}

export { HealingToolboxHubApp as AppRoot };
