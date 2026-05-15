import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';

import {
  BalloonOutsideWindow,
  ShredderOnDesk,
  StudyRoomWidgetsProvider,
  XiaonuanWallSpot,
} from '@/components/hub-shell/study-room-widgets';
import { PhysicalRoomDeskDrawer, PhysicalRoomWallEntities } from '@/components/hub-shell/physical-room-healing-widgets';
import { ProjectorScreenPanel } from '@/components/hub-shell/projector-screen-panel';
import { Scrapbook3D } from '@/components/hub-shell/scrapbook-3d';

import './immersive-study-room.css';

/** Only local Vite paths (e.g. `/photo/foo.jpg`); never `http(s)://` — network images are rejected. */
function safeWindowScenerySrc(src: string | null | undefined): string | null {
  if (src == null) return null;
  const t = src.trim();
  if (!t) return null;
  if (/^https?:\/\//i.test(t)) return null;
  return t;
}

const STARRY_CURTAIN_STARS: ReadonlyArray<{
  x: string;
  y: string;
  s: number;
  cls: 'a' | 'b' | 'c';
  dur: string;
  delay: string;
}> = [
  { x: '8%', y: '12%', s: 3, cls: 'a', dur: '2.6s', delay: '0s' },
  { x: '14%', y: '38%', s: 2, cls: 'b', dur: '3.4s', delay: '0.5s' },
  { x: '22%', y: '8%', s: 2.5, cls: 'c', dur: '4.2s', delay: '1.1s' },
  { x: '6%', y: '62%', s: 1.8, cls: 'a', dur: '3.0s', delay: '0.3s' },
  { x: '30%', y: '24%', s: 2, cls: 'b', dur: '2.9s', delay: '1.8s' },
  { x: '72%', y: '10%', s: 3, cls: 'a', dur: '3.7s', delay: '0.7s' },
  { x: '80%', y: '34%', s: 2, cls: 'c', dur: '2.8s', delay: '0.2s' },
  { x: '88%', y: '58%', s: 2.5, cls: 'b', dur: '4.0s', delay: '1.4s' },
  { x: '76%', y: '72%', s: 1.8, cls: 'a', dur: '3.2s', delay: '0.9s' },
  { x: '92%', y: '20%', s: 2, cls: 'c', dur: '3.6s', delay: '0.4s' },
  { x: '18%', y: '78%', s: 1.5, cls: 'b', dur: '2.7s', delay: '2.0s' },
  { x: '85%', y: '80%', s: 1.5, cls: 'a', dur: '3.9s', delay: '1.6s' },
];

const CURTAIN_FRAC_MIN = 0.03;
const CURTAIN_FRAC_MAX = 0.5;
const CURTAIN_FRAC_DEFAULT = 0.38;

function clampCurtainFrac(n: number): number {
  return Math.min(CURTAIN_FRAC_MAX, Math.max(CURTAIN_FRAC_MIN, n));
}

/** 星光薄纱窗帘：叠在窗内风景之上；布面 `pointer-events: none` 以便点击气球，仅拉手可拖曳 */
function StudyRoomStarryCurtain() {
  const sparklesRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const [leftFrac, setLeftFrac] = useState(CURTAIN_FRAC_DEFAULT);
  const [rightFrac, setRightFrac] = useState(CURTAIN_FRAC_DEFAULT);
  const [dragging, setDragging] = useState<'L' | 'R' | null>(null);
  const dragStartXRef = useRef(0);
  const dragStartLeftRef = useRef(CURTAIN_FRAC_DEFAULT);
  const dragStartRightRef = useRef(CURTAIN_FRAC_DEFAULT);
  const areaWRef = useRef(1);

  useEffect(() => {
    const sparklesContainer = sparklesRef.current;
    if (!sparklesContainer) return;

    const fragment = document.createDocumentFragment();
    for (const s of STARRY_CURTAIN_STARS) {
      const el = document.createElement('div');
      el.className = `star ${s.cls}`;
      el.style.cssText = `left:${s.x}; top:${s.y}; width:${s.s}px; height:${s.s}px; --dur:${s.dur}; --delay:${s.delay};`;
      fragment.appendChild(el);
    }
    sparklesContainer.appendChild(fragment);

    return () => {
      sparklesContainer.replaceChildren();
    };
  }, []);

  useEffect(() => {
    if (!dragging) return;

    const onPointerMove = (e: PointerEvent) => {
      e.preventDefault();
      const areaW = areaWRef.current || 1;
      const dx = e.clientX - dragStartXRef.current;
      const dFrac = dx / areaW;
      if (dragging === 'L') {
        setLeftFrac(clampCurtainFrac(dragStartLeftRef.current + dFrac));
      } else {
        setRightFrac(clampCurtainFrac(dragStartRightRef.current - dFrac));
      }
    };

    const endDrag = () => {
      setDragging(null);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
    };
  }, [dragging]);

  const beginDragLeft = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const area = areaRef.current?.getBoundingClientRect();
    areaWRef.current = area?.width ?? 1;
    dragStartXRef.current = e.clientX;
    dragStartLeftRef.current = leftFrac;
    setDragging('L');
  };

  const beginDragRight = (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const area = areaRef.current?.getBoundingClientRect();
    areaWRef.current = area?.width ?? 1;
    dragStartXRef.current = e.clientX;
    dragStartRightRef.current = rightFrac;
    setDragging('R');
  };

  return (
    <div className="curtain-wrapper" aria-hidden>
      <div className="isr-curtain-area" ref={areaRef}>
        <div
          className="curtain-cloth curtain-left isr-curtain-cloth"
          style={{ width: `${leftFrac * 100}%` }}
        >
          <div className="curtain-content" />
        </div>
        <div
          className="curtain-cloth curtain-right isr-curtain-cloth"
          style={{ width: `${rightFrac * 100}%` }}
        >
          <div className="curtain-content" />
        </div>
        <div className="starry-sparkles" ref={sparklesRef} />
        <button
          type="button"
          className={`isr-curtain-handle handle handle-right${dragging === 'L' ? ' isr-curtain-handle--dragging' : ''}`}
          aria-label="Drag to resize left curtain"
          style={{ left: `${leftFrac * 100}%`, transform: 'translateX(-50%)' }}
          onPointerDown={beginDragLeft}
        />
        <button
          type="button"
          className={`isr-curtain-handle handle handle-left${dragging === 'R' ? ' isr-curtain-handle--dragging' : ''}`}
          aria-label="Drag to resize right curtain"
          style={{ left: `${(1 - rightFrac) * 100}%`, transform: 'translateX(-50%)' }}
          onPointerDown={beginDragRight}
        />
      </div>
    </div>
  );
}

/** 窗外夜景层：`z-index: 1`，低于气球 (5) 与星光窗帘 (10) */
function NightSkyLayer() {
  return (
    <div className="night-sky-layer" aria-hidden>
      <div className="sky-gradient" />
      <svg
        className="night-sky-svg"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <radialGradient id="night-sky-moon" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffef5" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#f5f0dc" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#e8e4d4" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="72" cy="58" r="28" fill="url(#night-sky-moon)" opacity="0.9" />
        <circle cx="64" cy="52" r="26" fill="#1a1530" opacity="0.35" />
        <g fill="#ffffff" opacity="0.85">
          <circle cx="120" cy="40" r="1.2" />
          <circle cx="160" cy="28" r="0.9" />
          <circle cx="200" cy="52" r="1.1" />
          <circle cx="248" cy="36" r="0.8" />
          <circle cx="290" cy="22" r="1" />
          <circle cx="330" cy="48" r="0.9" />
          <circle cx="360" cy="32" r="1.2" />
          <circle cx="88" cy="120" r="0.7" />
          <circle cx="140" cy="100" r="0.8" />
          <circle cx="310" cy="110" r="0.7" />
          <circle cx="42" cy="200" r="0.9" />
          <circle cx="220" cy="180" r="0.8" />
          <circle cx="350" cy="210" r="0.7" />
        </g>
      </svg>
    </div>
  );
}

type ImmersiveStudyRoomLayoutProps = {
  /** 三层书架：由父组件用 `isr-shelf-row` 拼装 */
  bookshelf: ReactNode;
  /** 特写书页右侧：当前功能模块 */
  children: ReactNode;
  /** room = 全景书房；book = 翻开书本 */
  scene: 'room' | 'book';
  activeTitle: string;
  activeLead?: string;
  /** 书页左侧说明段落 */
  introParagraphs: ReactNode;
  isProjectorDown: boolean;
  onToggleProjector: () => void;
  onNotebookClick: () => void;
  onBackFromBook: () => void;
  cocoonMode?: boolean;
  /**
   * 窗外风景图：仅本地路径（如 `/photo/back.jpg`），与 `public/` 下的静态资源一致；禁止 http(s)。
   * 不传则仅用 CSS `url(/photo/back.jpg)`。
   */
  windowScenerySrc?: string | null;
  /** 3D 手账封面相框图片（可换为你的素材 URL） */
  scrapbookCoverImageSrc?: string;
  /** 封面毛笔大字 */
  scrapbookCoverTitle?: string;
  /** 封面翻开后的反面寄语 */
  scrapbookCoverMotto?: string;
  /** 铺在书桌区域：关态为小平板，开态为占位块（实际大屏为 `portal`） */
  deskExtras?: ReactNode;
};

export function ImmersiveStudyRoomLayout({
  bookshelf,
  children,
  scene,
  activeTitle,
  activeLead = '翻开了这本落满灰尘的档案册…',
  introParagraphs,
  isProjectorDown,
  onToggleProjector,
  onNotebookClick,
  onBackFromBook,
  cocoonMode = false,
  windowScenerySrc = null,
  scrapbookCoverImageSrc,
  scrapbookCoverTitle,
  scrapbookCoverMotto,
  deskExtras,
}: ImmersiveStudyRoomLayoutProps) {
  const [isNightMode, setIsNightMode] = useState(false);
  const safeScenery = safeWindowScenerySrc(windowScenerySrc);
  const sceneryStyle: CSSProperties | undefined = safeScenery
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(135, 206, 235, 0.15) 0%, transparent 45%), url(${safeScenery})`,
      }
    : undefined;

  useEffect(() => {
    document.body.classList.toggle('night-mode', isNightMode);
    return () => {
      document.body.classList.remove('night-mode');
    };
  }, [isNightMode]);

  return (
    <div style={{ position: 'relative', flex: 1, minHeight: 0, height: '100%', overflow: 'hidden' }}>
      {scene === 'room' ? (
        <StudyRoomWidgetsProvider>
          <div className="isr-room-container">
            <div className={`isr-lights-out ${isProjectorDown ? 'isr-lights-out--on' : ''}`} aria-hidden />

            <div className="isr-bookshelf-area">{bookshelf}</div>

            <div className="isr-wall-desk-area">
              <div className="isr-wall">
                <div className="isr-floating-shelf isr-floating-shelf--left">
                  <span className="isr-floating-shelf-bracket isr-floating-shelf-bracket--l" />
                  <span className="isr-floating-shelf-bracket isr-floating-shelf-bracket--r" />
                  <XiaonuanWallSpot />
                </div>

                <div className="isr-window-frame">
                  <div className="isr-window-scenery" style={sceneryStyle}>
                    <NightSkyLayer />
                    <BalloonOutsideWindow />
                  </div>
                  <StudyRoomStarryCurtain />
                </div>

                <PhysicalRoomWallEntities />

                <div className="isr-projector-housing" />
                <div className={`isr-projector-frame${isProjectorDown ? '' : ' isr-projector-frame--shut'}`}>
                  <span className="pink-bow-icon" aria-hidden="true">
                    <span className="pink-bow-knot" />
                  </span>
                  <div
                    className={`isr-projector-screen ${isProjectorDown ? 'isr-projector-screen--down' : 'isr-projector-screen--up'}`}
                  >
                    {isProjectorDown ? (
                      <div className="isr-video-container">
                        <ProjectorScreenPanel deskTitle={activeTitle} deskLead={activeLead} />
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div
                className={`isr-desk ${cocoonMode ? 'isr-desk--cocoon' : ''}${deskExtras ? ' isr-desk--with-laptop' : ''}`}
              >
                {cocoonMode ? (
                  <span
                    id="isr-cocoon-notice"
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
                <button type="button" className="isr-closed-notebook" onClick={onNotebookClick} aria-label="打开我的手账" />
                <button type="button" className="isr-remote" onClick={onToggleProjector} aria-label="投影幕布升降">
                  <span className={`isr-remote-btn ${isProjectorDown ? 'isr-remote-btn--on' : ''}`} />
                  <span className="isr-remote-label">
                    PROJECTOR
                    <br />
                    POWER
                  </span>
                </button>
                <ShredderOnDesk />
                <button
                  type="button"
                  id="healing-lamp"
                  aria-pressed={isNightMode}
                  aria-label={isNightMode ? '关闭深夜疗愈模式' : '开启深夜疗愈模式'}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsNightMode((v) => !v);
                  }}
                >
                  <span className="lamp-glow" aria-hidden />
                  <span className="lamp-icon" aria-hidden>
                    🪔
                  </span>
                </button>
                <PhysicalRoomDeskDrawer />
                {deskExtras ? <div className="isr-desk-extras">{deskExtras}</div> : null}
              </div>
            </div>
            <div id="room-dark-mask" aria-hidden />
          </div>
        </StudyRoomWidgetsProvider>
      ) : (
        <div
          className={`isr-zoomed ${cocoonMode ? 'isr-zoomed--cocoon' : ''}`}
          aria-describedby={cocoonMode ? 'isr-cocoon-notice-book' : undefined}
        >
          {cocoonMode ? (
            <span
              id="isr-cocoon-notice-book"
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
          <button type="button" className="isr-back" onClick={onBackFromBook}>
            <i className="fa-solid fa-arrow-left" style={{ marginRight: 8 }} aria-hidden />
            合上书本，返回房间
          </button>

          <Scrapbook3D
            key={activeTitle}
            activeTitle={activeTitle}
            activeLead={activeLead}
            introParagraphs={introParagraphs}
            coverImageSrc={scrapbookCoverImageSrc}
            coverBookTitle={scrapbookCoverTitle}
            coverBackMotto={scrapbookCoverMotto}
          >
            {children}
          </Scrapbook3D>
        </div>
      )}
    </div>
  );
}
