/**
 * 知识小课堂 — 与 knowledge_classroom.html 同源（本目录拼音名 zhi_shi_xiao_ke_tang）：搜索、标签筛选、文章阅读器。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  KnowledgeArticle,
  KnowledgeArticleTag,
  KnowledgeTagFilter,
} from './ke_tang_ke_wen';
import { KNOWLEDGE_ARTICLES, KNOWLEDGE_TAG_FILTERS } from './ke_tang_ke_wen';
import './zhi_shi_xiao_ke_tang.css';
import { faSongHuaYuanGrow } from '@/lib/zhi_yu_hua_yuan_xin_hao';

function tagColorClass(tag: KnowledgeArticleTag): string {
  switch (tag) {
    case '原生家庭':
      return 'kcTFamily';
    case '亲密关系':
      return 'kcTRelation';
    case '心态':
      return 'kcTMindset';
    case 'PTSD':
      return 'kcTPtsd';
    default:
      return 'kcTBoundary';
  }
}

function filterArticles(filter: KnowledgeTagFilter, query: string): KnowledgeArticle[] {
  const q = query.trim().toLowerCase();
  return KNOWLEDGE_ARTICLES.filter((a) => {
    const matchTag = filter === '全部' || a.tag === filter;
    const matchQ =
      !q ||
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.tag.toLowerCase().includes(q);
    return matchTag && matchQ;
  });
}

const DWELL_OPEN_MS = 1500;

function ArticleCardButton({
  article,
  onOpen,
}: {
  article: KnowledgeArticle;
  onOpen: (a: KnowledgeArticle) => void;
}) {
  const dwellTimerRef = useRef<number | null>(null);

  const clearDwell = useCallback(() => {
    if (dwellTimerRef.current != null) {
      window.clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearDwell(), [clearDwell]);

  const armDwell = useCallback(() => {
    clearDwell();
    dwellTimerRef.current = window.setTimeout(() => {
      dwellTimerRef.current = null;
      onOpen(article);
    }, DWELL_OPEN_MS);
  }, [article, clearDwell, onOpen]);

  return (
    <button
      type="button"
      className="kcCard"
      onPointerDown={armDwell}
      onPointerUp={clearDwell}
      onPointerLeave={clearDwell}
      onPointerCancel={clearDwell}
      onClick={() => onOpen(article)}
    >
      <span className={`kcArtTag ${tagColorClass(article.tag)}`}>{article.tag}</span>
      <div className="kcArtTitle">{article.title}</div>
      <div className="kcArtSummary">{article.summary}</div>
      <div className="kcArtMeta">阅读约 {article.readTime}</div>
    </button>
  );
}

export function KnowledgeClassroomApp() {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<KnowledgeTagFilter>('全部');
  const [reading, setReading] = useState<KnowledgeArticle | null>(null);

  const filtered = useMemo(
    () => filterArticles(activeTag, query),
    [activeTag, query],
  );

  const openArticle = useCallback((a: KnowledgeArticle) => {
    setReading(a);
    queueMicrotask(() => {
      faSongHuaYuanGrow({ source: 'kepu_yue_du', articleId: String(a.id) });
    });
  }, []);

  const closeReader = useCallback(() => setReading(null), []);

  const inReader = reading !== null;

  return (
    <div className="kcRoot mac-os-scrollbar kcHelpSkin">
      <h2 className="kcHidden">帮助与支持：创伤相关心理词条</h2>

      {!inReader ? (
        <div className="kcHelpTopBanner">
          <div className="kcHelpTopTitle">帮助与支持 · 心理词条库</div>
          <div className="kcHelpTopSub">像查系统帮助一样浏览——左侧选主题，右侧读短文；也可搜索关键词。</div>
        </div>
      ) : null}

      <div className={inReader ? 'kcHelpBodySingle' : 'kcHelpBody'}>
        {!inReader ? (
          <aside className="kcHelpAside mac-os-scrollbar">
            <div className="kcHelpAsideTitle">主题</div>
            {KNOWLEDGE_TAG_FILTERS.map((tag) => (
              <button
                key={tag}
                type="button"
                className={`kcAsideBtn${tag === activeTag ? ' kcAsideBtnOn' : ''}`}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </button>
            ))}
          </aside>
        ) : null}

        <div className="kcPage">
        {!inReader ? (
          <>
            <div className="kcSearch">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索帮助词条…"
                aria-label="搜索文章"
              />
            </div>

            <p className="kcDwellHint" role="note">
              轻触可立即打开；把指尖停在卡片上约 {DWELL_OPEN_MS / 1000} 秒，也会自动展开文章（少一次点击）。
            </p>

            {!filtered.length ? (
              <div className="kcEmpty">没有找到相关词条</div>
            ) : (
              <div className="kcArticles">
                {filtered.map((a) => (
                  <ArticleCardButton key={a.id} article={a} onOpen={openArticle} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div>
            <button type="button" className="kcBack" onClick={closeReader}>
              ← 返回
            </button>
            <span className={`kcArticleTag ${tagColorClass(reading.tag)}`}>
              {reading.tag}
            </span>
            <div className="kcArticleTitle">{reading.title}</div>
            <div className="kcArticleMeta">阅读约 {reading.readTime}</div>
            {/* 正文为仓库内静态 HTML，与同目录离线页一致 */}
            <div
              className="kcArticleBody"
              dangerouslySetInnerHTML={{ __html: reading.bodyHtml }}
            />
            <div className="kcActionBox">
              <div className="kcActionTitle">今天可以做的一件事</div>
              <div className="kcActionText">{reading.action}</div>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
