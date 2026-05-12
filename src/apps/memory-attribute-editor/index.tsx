/**
 * 记忆属性修改器 — 把一段回忆「归档」：勾选隐喻属性（非存储真实文件）。
 */

import { useMemo, useState } from 'react';

const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';

const ATTRS = [
  { key: 'expired', label: '已过期（不等于当下的全部现实）' },
  { key: 'readonly', label: '仅限读取（不再单独驱动当下的决定）' },
  { key: 'archive', label: '存档于过去（允许它待在后台）' },
  { key: 'processing', label: '已纳入疗愈进程（我在学着与它共处）' },
] as const;

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
    <div style={{ height: '100%', fontFamily: FONT, background: '#fbfbfd', padding: 16, overflow: 'auto' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: 17 }}>记忆属性</h1>
      <p style={{ margin: '0 0 14px', fontSize: 12, color: '#515154', lineHeight: 1.55 }}>
        给一段难忘的经历起一个文件名，勾选你愿意赋予它的<strong>心理标签</strong>——像在资源管理器里修改属性一样，完成一次符号化的归档。
      </p>

      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, fontWeight: 600 }}>记忆标签 / 文件名</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例如：那次争吵 · 高三教室"
          style={{
            display: 'block',
            width: '100%',
            marginTop: 6,
            padding: '10px 11px',
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,0.12)',
            fontSize: 14,
            boxSizing: 'border-box',
          }}
        />
      </div>

      <div
        style={{
          padding: 14,
          borderRadius: 12,
          background: '#fff',
          border: '1px solid rgba(0,0,0,0.06)',
          marginBottom: 14,
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>属性</div>
        {ATTRS.map((a) => (
          <label
            key={a.key}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              marginBottom: 10,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <input type="checkbox" checked={!!picked[a.key]} onChange={() => toggle(a.key)} />
            <span>{a.label}</span>
          </label>
        ))}
      </div>

      <div style={{ fontSize: 11, color: '#86868b', marginBottom: 12 }}>
        创建时间：过去 · 修改时间：现在 · {summary ? `已选：${summary}` : '尚未勾选'}
      </div>

      <button
        type="button"
        onClick={apply}
        style={{
          padding: '10px 20px',
          borderRadius: 999,
          border: 'none',
          background: '#007aff',
          color: '#fff',
          fontWeight: 600,
          fontSize: 14,
          cursor: 'pointer',
        }}
      >
        确定（意象归档）
      </button>

      {savedAt ? (
        <p style={{ marginTop: 14, fontSize: 13, color: '#34c759' }}>
          已在心里完成一次归档仪式（{savedAt}）。你随时可以关掉窗口，不必说服自己「应该」好起来。
        </p>
      ) : null}
    </div>
  );
}
