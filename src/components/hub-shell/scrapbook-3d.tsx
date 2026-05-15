import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import './scrapbook-3d.css';
import './paper-book-ui.css';

const TOTAL_PAGES = 3;

type PageNum = 1 | 2 | 3;

const INITIAL_Z: Record<PageNum, number> = { 3: 1, 2: 2, 1: 3 };

/** 与 HTML 演示一致：未翻时上书 z 最大；翻过后在动画半程把 z 降到 pageNum，翻回则恢复 total - pageNum + 1 */
function zAfterFlip(pageNum: PageNum, forward: boolean): number {
  return forward ? pageNum : TOTAL_PAGES - pageNum + 1;
}

export const DEFAULT_SCRAPBOOK_COVER_SRC =
  'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=600&q=80';

type Scrapbook3DProps = {
  /** 第二叠页：当前模块标题（书脊/章节名） */
  activeTitle: string;
  activeLead: string;
  introParagraphs: ReactNode;
  /** 封面主标题毛笔字 */
  coverBookTitle?: string;
  /** 封面相框图片；不传则用默认治愈系图 */
  coverImageSrc?: string;
  /** 封面反面寄语 */
  coverBackMotto?: string;
  children: ReactNode;
};

export function Scrapbook3D({
  activeTitle,
  activeLead,
  introParagraphs,
  coverBookTitle = '治愈手账',
  coverImageSrc = DEFAULT_SCRAPBOOK_COVER_SRC,
  coverBackMotto = '写给那个一直在努力讨好世界的自己。',
  children,
}: Scrapbook3DProps) {
  const [flipped, setFlipped] = useState<Record<PageNum, boolean>>({
    1: false,
    2: false,
    3: false,
  });
  const [zMap, setZMap] = useState<Record<PageNum, number>>({ ...INITIAL_Z });
  const flippedRef = useRef(flipped);
  flippedRef.current = flipped;

  const timeoutsRef = useRef<Set<number>>(new Set());

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      timeoutsRef.current.delete(id);
      fn();
    }, ms);
    timeoutsRef.current.add(id);
  }, []);

  useEffect(
    () => () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current.clear();
    },
    [],
  );

  const turnPage = useCallback(
    (pageNum: PageNum, isForward: boolean) => {
      setFlipped((prev) => ({ ...prev, [pageNum]: isForward }));
      schedule(() => {
        setZMap((prev) => ({
          ...prev,
          [pageNum]: zAfterFlip(pageNum, isForward),
        }));
      }, 600);
    },
    [schedule],
  );

  const closeBook = useCallback(() => {
    for (let i = TOTAL_PAGES; i >= 1; i--) {
      const p = i as PageNum;
      if (flippedRef.current[p]) {
        window.setTimeout(() => {
          turnPage(p, false);
        }, (TOTAL_PAGES - i) * 150);
      }
    }
  }, [turnPage]);

  const page = (n: PageNum, classExtra: string, inner: ReactNode) => (
    <div
      className={`isr-s3-page ${flipped[n] ? 'isr-s3-page--flipped' : ''} ${classExtra}`.trim()}
      style={{ zIndex: zMap[n] }}
    >
      {inner}
    </div>
  );

  return (
    <div className="isr-s3-wrap">
      <div className="isr-s3-stage">
        <div className="isr-s3-thickness" aria-hidden />
        <button
          type="button"
          className="isr-s3-bookmark"
          onClick={closeBook}
          title="一键按顺序合上所有内页"
          aria-label="一键合上书本"
        >
          <i className="fa-solid fa-bookmark" aria-hidden />
        </button>

        {page(
          3,
          '',
          <>
            <div className="isr-s3-face isr-s3-face--front isr-s3-face--spread">
              <div className="isr-s3-module-wrap">
                <h2 className="isr-s3-h2">工具与互动</h2>
                <p className="isr-s3-preface">
                  右侧为可操作区；若内容较长，可在此区域内滚动。红色书签可随时把纸页依次收回。
                </p>
                <div className="isr-page-scroll isr-s3-module-scroll isr-paper-surface">{children}</div>
              </div>
              <button type="button" className="isr-s3-hint isr-s3-hint--right" onClick={() => turnPage(3, true)}>
                翻页 · 结语 ➔
              </button>
            </div>
            <div className="isr-s3-face isr-s3-face--back">
              <h2 className="isr-s3-end-title">本章留白</h2>
              <p className="isr-s3-end-note">今日书写与练习先到此处即可。合上封面或点击书签，慢慢来。</p>
              <button type="button" className="isr-s3-hint isr-s3-hint--left" onClick={() => turnPage(3, false)}>
                ⬅ 翻回互动区
              </button>
            </div>
          </>,
        )}

        {page(
          2,
          '',
          <>
            <div className="isr-s3-face isr-s3-face--front isr-s3-face--spread">
              <h2 className="isr-s3-h2">{activeTitle}</h2>
              <p className="isr-page-lead isr-s3-lead">{activeLead}</p>
              <div className="isr-page-intro isr-s3-intro">{introParagraphs}</div>
              <button type="button" className="isr-s3-hint isr-s3-hint--right" onClick={() => turnPage(2, true)}>
                翻开下一页 ➔
              </button>
            </div>
            <div className="isr-s3-face isr-s3-face--back">
              <p className="isr-s3-bridge">再翻一层，便是具体的仪式与工具界面。</p>
              <button type="button" className="isr-s3-hint isr-s3-hint--left" onClick={() => turnPage(2, false)}>
                ⬅ 翻回导读
              </button>
            </div>
          </>,
        )}

        {page(
          1,
          'isr-s3-page--cover',
          <>
            <div className="isr-s3-face isr-s3-face--front isr-s3-cover-front">
              <div className="isr-s3-photo-frame">
                <img src={coverImageSrc} alt="" className="isr-s3-cover-img" draggable={false} />
              </div>
              <h1 className="isr-s3-cover-title">{coverBookTitle}</h1>
              <button type="button" className="isr-s3-hint isr-s3-hint--cover" onClick={() => turnPage(1, true)}>
                翻开日记本 ➔
              </button>
            </div>
            <div className="isr-s3-face isr-s3-face--back isr-s3-cover-back">
              <p className="isr-s3-cover-motto">&quot;{coverBackMotto}&quot;</p>
              <p className="isr-s3-cover-date">2026 · 絮语</p>
              <button type="button" className="isr-s3-hint isr-s3-hint--left" onClick={() => turnPage(1, false)}>
                ⬅ 合上封面
              </button>
            </div>
          </>,
        )}
      </div>
    </div>
  );
}
