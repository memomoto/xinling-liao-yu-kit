/**
 * 疗愈小游戏：梦核轨道选主题 → 对应故事（或待创作）
 */

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { BadEndingAwakening } from './bad-ending-awakening';
import { DreamOrbitGarden } from './dream-orbit-garden';
import { getStoryBook, type StoryPage } from './healing-stories.config';
import { HEALING_THEMES } from './healing-themes';
import { resolveStoryBackground } from './story-backgrounds';
import { resolveStoryBookId, type StoryBookId } from './story-routes';

type Phase = 'playground' | 'read' | 'soon';

const FONT = '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif';

/** 绘本阅读时铺满窗口左右空隙的全幅背景（梦核/抽象插绘） */
const STORY_READER_FRAME_BG = '/assets/healing/story-reader-frame-bg.png';

function pairDescription(a: string, b: string): string {
  const ta = HEALING_THEMES.find((t) => t.id === a);
  const tb = HEALING_THEMES.find((t) => t.id === b);
  return `${ta?.shortLabel ?? a} × ${tb?.shortLabel ?? b}`;
}

export function HealingPictureBookApp() {
  const [phase, setPhase] = useState<Phase>('playground');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [pageId, setPageId] = useState<string | null>(null);
  const [activeBookId, setActiveBookId] = useState<StoryBookId | null>(null);
  const [pendingPairLabel, setPendingPairLabel] = useState('');

  const activeBook = activeBookId ? getStoryBook(activeBookId) : null;

  const toggleTheme = useCallback((id: string) => {
    setSelectedThemes((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) {
        const keep = prev[0];
        return keep !== undefined ? [keep, id] : [id];
      }
      return [...prev, id];
    });
  }, []);

  const tryEnterStory = useCallback(() => {
    if (selectedThemes.length !== 2) return;
    const [a, b] = [selectedThemes[0]!, selectedThemes[1]!];
    const bookId = resolveStoryBookId(a, b);
    setPendingPairLabel(pairDescription(a, b));
    if (bookId) {
      setActiveBookId(bookId);
      const book = getStoryBook(bookId);
      setPageId(book.startPageId);
      setPhase('read');
    } else {
      setActiveBookId(null);
      setPhase('soon');
    }
  }, [selectedThemes]);

  useEffect(() => {
    if (phase !== 'playground') return;
    if (selectedThemes.length !== 2) return;
    tryEnterStory();
  }, [phase, selectedThemes, tryEnterStory]);

  const backToPlayground = useCallback(() => {
    setPhase('playground');
    setPageId(null);
    setActiveBookId(null);
    setSelectedThemes([]);
  }, []);

  const restartStory = useCallback(() => {
    if (!activeBookId) return;
    const book = getStoryBook(activeBookId);
    setPageId(book.startPageId);
    setPhase('read');
  }, [activeBookId]);

  const page: StoryPage | null = useMemo(() => {
    if (!activeBook || !pageId) return null;
    return activeBook.pages[pageId] ?? null;
  }, [activeBook, pageId]);

  const advance = useCallback((nextId: string) => {
    setPageId(nextId);
  }, []);

  const introLine =
    phase === 'playground'
      ? `点选两颗围着她转的球（再点可取消），选满两颗会自动进入故事。（已选 ${selectedThemes.length}/2）`
      : phase === 'soon'
        ? '这一组的故事还在慢慢长出来。'
        : '';

  return (
    <div
      style={{
        fontFamily: FONT,
        flex: 1,
        minHeight: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
        overflow: 'hidden',
        padding: phase === 'read' ? 'clamp(6px, 1.2vmin, 12px)' : 'clamp(8px, 1.5vmin, 14px)',
        boxSizing: 'border-box',
      }}
    >
      {phase !== 'read' && (
        <header
          style={{
            flexShrink: 0,
            marginBottom: 8,
            width: '100%',
            boxSizing: 'border-box',
            paddingInline: 6,
            overflowX: 'auto',
            overflowY: 'hidden',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <p
            style={{
              margin: 0,
              textAlign: 'center',
              whiteSpace: 'nowrap',
              fontSize: 'clamp(10px, calc(0.28rem + 1.05vw), 14px)',
              fontWeight: 600,
              lineHeight: 1.5,
              color: '#9d174d',
              textShadow:
                '0 0 14px rgba(255,255,255,0.95), 0 0 24px rgba(252, 231, 243, 0.9), 0 1px 0 #fff',
            }}
          >
            {introLine}
          </p>
        </header>
      )}

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {phase === 'playground' && (
          <div
            style={{
              flex: 1,
              minHeight: 'min(440px, 60vh)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <DreamOrbitGarden selectedIds={selectedThemes} onToggleTheme={toggleTheme} />
          </div>
        )}

        {phase === 'soon' && (
          <ComingSoonPanel pairLabel={pendingPairLabel} onBack={backToPlayground} />
        )}

        {phase === 'read' && activeBook && page && (
          <StoryReader
            page={page}
            storyTitle={activeBook.title}
            onAdvance={advance}
            onRestartStory={restartStory}
            onBackToGarden={backToPlayground}
          />
        )}
      </div>
    </div>
  );
}

function ComingSoonPanel({ pairLabel, onBack }: { pairLabel: string; onBack: () => void }) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 280,
        borderRadius: 18,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        textAlign: 'center',
        background: `
          radial-gradient(ellipse 90% 70% at 50% 100%, rgba(251, 207, 232, 0.65) 0%, transparent 55%),
          linear-gradient(168deg, #fdf4ff 0%, #e0f2fe 45%, #fce7f3 100%)
        `,
        border: '1px solid rgba(244, 114, 182, 0.35)',
      }}
    >
      <div style={{ fontSize: 42, marginBottom: 12, opacity: 0.9 }}>☁️</div>
      <h2
        style={{
          margin: '0 0 12px',
          fontSize: 'clamp(16px, 2vmin, 20px)',
          color: '#86198f',
          fontWeight: 700,
        }}
      >
        这片云里，故事还在慢慢长出来
      </h2>
      <p
        style={{
          margin: '0 0 8px',
          maxWidth: 400,
          fontSize: 'clamp(13px, 1.5vmin, 15px)',
          lineHeight: 1.75,
          color: '#5b21b6',
        }}
      >
        你选的是「{pairLabel}」——我们为第一组主题准备了《小刺的柔软铠甲》，其它组合会陆续上线。
        <br />
        若你愿意，可以先回到花园，选 <strong style={{ color: '#f9a8d4' }}>CPTSD</strong> 与{' '}
        <strong style={{ color: '#7dd3fc' }}>原生家庭</strong> 两颗泡泡。
      </p>
      <button
        type="button"
        onClick={onBack}
        style={{
          marginTop: 20,
          padding: '12px 28px',
          fontSize: 14,
          fontWeight: 700,
          border: 'none',
          borderRadius: 999,
          cursor: 'pointer',
          background: 'linear-gradient(90deg, rgba(244, 114, 182, 0.9), rgba(129, 140, 248, 0.9))',
          color: '#fff',
          boxShadow: '0 4px 20px rgba(129, 140, 248, 0.35)',
        }}
      >
        飘回开场
      </button>
    </div>
  );
}

function StoryReader({
  page,
  storyTitle,
  onAdvance,
  onRestartStory,
  onBackToGarden,
}: {
  page: StoryPage;
  storyTitle: string;
  onAdvance: (nextId: string) => void;
  onRestartStory: () => void;
  onBackToGarden: () => void;
}) {
  const emoji = page.placeholderEmoji ?? '📖';
  const artSrc = resolveStoryBackground(page.id, page.image);
  const isChoice = page.kind === 'choice';
  const isAwakeningBadEnd =
    page.kind === 'ending' && !page.success && page.id === 'end_bad';
  const badEndBlurb =
    page.kind === 'ending' && page.text
      ? page.text
          .split('\n\n')[0]!
          .replace(/\n/g, ' ')
          .trim()
      : '';

  const choiceBtnStyle: CSSProperties = {
    padding: '11px 14px',
    fontSize: 'clamp(11px, 1.35vmin, 14px)',
    textAlign: 'left',
    borderRadius: 14,
    border: '1px solid rgba(192, 132, 252, 0.55)',
    background: 'rgba(255, 253, 252, 0.98)',
    cursor: 'pointer',
    color: '#4c1d95',
    fontWeight: 600,
    lineHeight: 1.45,
    maxWidth: '100%',
    width: 'min(100%, min(340px, 42vw))',
    alignSelf: 'flex-end',
    boxShadow: '0 4px 18px rgba(0,0,0,0.12)',
  };

  return (
    <div
      style={{
        position: 'relative',
        flex: 1,
        minHeight: 0,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#fdf2f8',
      }}
    >
      <img
        src={STORY_READER_FRAME_BG}
        alt=""
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center center',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: 'min(960px, 100%)',
          margin: '0 auto',
          minWidth: 0,
        }}
      >
        <div
          style={{
            flexShrink: 0,
            fontSize: 'clamp(10px, 1.2vmin, 12px)',
            color: '#6b21a8',
            marginBottom: 8,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span style={{ fontWeight: 600 }}>{storyTitle}</span>
          <button
            type="button"
            onClick={onBackToGarden}
            style={{
              background: 'rgba(255,255,255,0.85)',
              color: '#7c3aed',
              cursor: 'pointer',
              fontSize: 11,
              flexShrink: 0,
              padding: '6px 10px',
              borderRadius: 8,
              border: '1px solid rgba(196, 181, 253, 0.55)',
            }}
          >
            返回开场
          </button>
        </div>

        <div
          style={{
            position: 'relative',
            flex: 1,
            minHeight: 280,
            borderRadius: 16,
            overflow: 'hidden',
            border: '2px solid rgba(196, 181, 253, 0.45)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.35)',
            background: '#1e1b2e',
          }}
        >
          {isAwakeningBadEnd ? (
            <BadEndingAwakening
              title={page.kind === 'ending' ? page.title : undefined}
              storyBlurb={badEndBlurb}
              artSrc={artSrc}
              onReplay={onRestartStory}
            />
          ) : (
            <>
              {artSrc ? (
                <img
                  src={artSrc}
                  alt=""
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center center',
                  }}
                />
              ) : (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, #fdf4ff 0%, #e0e7ff 50%, #cffafe 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 64,
                  }}
                >
                  {emoji}
                </div>
              )}

              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  bottom: 0,
                  width: 'min(200px, 42%)',
                  height: 72,
                  background: 'linear-gradient(to top left, rgba(255,255,255,0.5), transparent)',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 2,
                  maxHeight: isChoice ? '62%' : '55%',
                  overflowY: 'auto',
                  padding: '28px 14px 16px',
                  background:
                    'linear-gradient(to top, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.94) 38%, rgba(255,255,255,0.72) 68%, rgba(255,255,255,0.2) 92%, transparent 100%)',
                }}
              >
                {page.kind === 'ending' && page.title && (
                  <h3
                    style={{
                      margin: '0 0 10px',
                      fontSize: 15,
                      color: page.success ? '#15803d' : '#b45309',
                      textShadow: '0 0 12px rgba(255,255,255,0.95)',
                    }}
                  >
                    {page.title}
                  </h3>
                )}
                <p
                  style={{
                    margin: 0,
                    fontSize: 'clamp(13px, 1.5vmin, 17px)',
                    lineHeight: 1.75,
                    color: '#1e293b',
                    whiteSpace: 'pre-wrap',
                    textShadow: '0 1px 0 rgba(255,255,255,0.85), 0 0 20px rgba(255,255,255,0.75)',
                  }}
                >
                  {page.text}
                </p>

                {page.kind === 'page' && (
                  <div
                    style={{
                      marginTop: 16,
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onAdvance(page.next)}
                      style={{
                        padding: '11px 22px',
                        fontSize: 14,
                        fontWeight: 600,
                        border: 'none',
                        borderRadius: 14,
                        cursor: 'pointer',
                        background: 'linear-gradient(90deg, #ec4899, #a855f7)',
                        color: '#fff',
                        boxShadow: '0 4px 16px rgba(168, 85, 247, 0.45)',
                      }}
                    >
                      下一页
                    </button>
                  </div>
                )}

                {page.kind === 'choice' && (
                  <div
                    style={{
                      marginTop: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      alignItems: 'flex-end',
                    }}
                  >
                    {page.options.map((opt) => (
                      <button
                        key={opt.nextId}
                        type="button"
                        onClick={() => onAdvance(opt.nextId)}
                        style={choiceBtnStyle}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {page.kind === 'ending' && (
                  <div
                    style={{
                      marginTop: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      alignItems: 'flex-end',
                    }}
                  >
                    <button
                      type="button"
                      onClick={onRestartStory}
                      style={{
                        ...choiceBtnStyle,
                        textAlign: 'center',
                        background: 'linear-gradient(90deg, #c084fc, #818cf8)',
                        color: '#fff',
                        border: 'none',
                        fontWeight: 700,
                      }}
                    >
                      从头再玩一次
                    </button>
                    <button
                      type="button"
                      onClick={onBackToGarden}
                      style={{
                        ...choiceBtnStyle,
                        textAlign: 'center',
                        background: 'rgba(248, 250, 252, 0.98)',
                        color: '#64748b',
                        fontWeight: 600,
                      }}
                    >
                      返回开场
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <p
          style={{
            flexShrink: 0,
            marginTop: 10,
            fontSize: 'clamp(9px, 1.1vmin, 11px)',
            color: 'rgba(148, 163, 184, 0.85)',
            textAlign: 'center',
            textShadow: '0 0 10px rgba(255,255,255,0.95), 0 1px 0 #fff',
          }}
        >
          本内容仅供情绪自助与陪伴，不能替代专业诊断或治疗。危机时请拨打当地心理援助热线或紧急电话。
        </p>
      </div>
    </div>
  );
}
