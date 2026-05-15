/**
 * 记忆属性修改器 — 把一段回忆「归档」：勾选隐喻属性（非存储真实文件）。
 */

import { useMemo, useState } from 'react';

import { PaperLinedInput, PaperMultiSelect } from '@/components/hub-shell/paper-book-widgets';

const FONT = '"Noto Serif SC", "Songti SC", "PingFang SC", "Microsoft YaHei", serif';

const ATTRS = [
  { key: 'expired', label: '已过期（不等于当下的全部现实）' },
  { key: 'readonly', label: '仅限读取（不再单独驱动当下的决定）' },
  { key: 'archive', label: '存档于过去（允许它待在后台）' },
  { key: 'processing', label: '已纳入疗愈进程（我在学着与它共处）' },
] as const;

const PAPER_ITEMS = ATTRS.map((a) => ({ id: a.key, label: a.label }));

export function MemoryAttributeEditorApp() {
  const [name, setName] = useState('');
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const toggle = (k: string) => setPicked((p) => ({ ...p, [k]: !p[k] }));

  const summary = useMemo(
    () =>
      ATTRS.filter((a) => picked[a.key])
        .map((a) => a.label)
        .join(' · '),
    [picked],
  );

  const apply = () => {
    if (!name.trim()) return;
    setSavedAt(new Date().toLocaleString());
  };

  return (
    <div style={{ height: '100%', fontFamily: FONT, background: 'transparent', padding: 4, overflow: 'auto' }}>
      <h1
        style={{
          margin: '0 0 8px',
          fontSize: 'clamp(1.05rem, 2.2vw, 1.25rem)',
          color: '#4e342e',
          fontWeight: 700,
        }}
      >
        记忆属性
      </h1>
      <p
        style={{
          margin: '0 0 18px',
          fontSize: 13,
          color: '#5d4037',
          lineHeight: 1.75,
          textAlign: 'justify',
          textIndent: '2em',
        }}
      >
        给一段难忘的经历起一个文件名，再在下列句子里点选你愿意赋予它的<strong>心理标签</strong>——像在纸上做标记一样，完成一次符号化的归档。这里没有方框勾选，只有笔迹般的痕迹。
      </p>

      <div style={{ marginBottom: 18 }}>
        <label className="isr-paper-field-label" htmlFor="mem-attr-name">
          记忆标签 / 文件名
        </label>
        <PaperLinedInput
          id="mem-attr-name"
          value={name}
          onChange={setName}
          placeholder="例如：那次争吵 · 高三教室"
          aria-label="记忆标签或文件名"
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <PaperMultiSelect
          items={PAPER_ITEMS}
          selected={picked}
          onToggle={toggle}
          legend="属性（可点选多行）"
          aria-label="心理属性"
        />
      </div>

      <div style={{ fontSize: 11, color: '#8d6e63', marginBottom: 14, lineHeight: 1.5 }}>
        创建时间：过去 · 修改时间：现在 · {summary ? `已选：${summary}` : '尚未点选'}
      </div>

      <button type="button" className="isr-paper-ink-btn" onClick={apply}>
        确定（意象归档）
      </button>

      {savedAt ? (
        <p style={{ marginTop: 16, fontSize: 13, color: '#2e7d32', lineHeight: 1.65 }}>
          已在心里完成一次归档仪式（{savedAt}）。你随时可以关掉窗口，不必说服自己「应该」好起来。
        </p>
      ) : null}
    </div>
  );
}
