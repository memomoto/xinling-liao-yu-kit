/**
 * 心理边界防火墙 — 意象：把「心理入侵」登记并拦截（非技术防火墙）。
 */

import { useCallback, useMemo, useState } from 'react';

const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';

type Row = { id: string; text: string; status: 'pending' | 'blocked' | 'quarantined' };

const PRESETS = [
  '未经许可评价我的身体或外貌',
  '用内疚让我取消自己的安排',
  '越过我说好的界限还要继续施压',
];

export function BoundaryFirewallApp() {
  const [rows, setRows] = useState<Row[]>(() =>
    PRESETS.map((text, i) => ({ id: `p-${i}`, text, status: 'pending' as const })),
  );
  const [draft, setDraft] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const pending = useMemo(() => rows.filter((r) => r.status === 'pending'), [rows]);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3800);
  }, []);

  const addRule = () => {
    const t = draft.trim();
    if (!t) return;
    setRows((r) => [...r, { id: `u-${Date.now()}`, text: t, status: 'pending' }]);
    setDraft('');
  };

  const block = (id: string) => {
    const row = rows.find((x) => x.id === id);
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status: 'blocked' } : x)));
    flash(`已拦截：「${row?.text ?? ''}」——这条不合理的心理入侵已被系统隔离在边界外。`);
  };

  const quarantine = (id: string) => {
    const row = rows.find((x) => x.id === id);
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status: 'quarantined' } : x)));
    flash(`已隔离观察：「${row?.text ?? ''}」。你可以稍后再决定如何处理这段关系里的张力。`);
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: FONT,
        background: 'linear-gradient(180deg, #f6f7fa 0%, #eef1f6 100%)',
        color: '#1d1d1f',
        minHeight: 0,
        position: 'relative',
      }}
    >
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#86868b', letterSpacing: '0.06em' }}>
          SECURITY · boundaries
        </div>
        <h1 style={{ margin: '6px 0 0', fontSize: 17 }}>心理边界防火墙</h1>
        <p style={{ margin: '8px 0 0', fontSize: 12, lineHeight: 1.55, color: '#515154' }}>
          写下那些让你感到被闯入、被勒索或被否定的瞬间——点击<strong>拦截</strong>或<strong>隔离</strong>，用符号动作练习「我的边界有效」。
        </p>
      </div>

      <div style={{ padding: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="描述一种「心理入侵」…"
          style={{
            flex: '1 1 200px',
            padding: '8px 11px',
            borderRadius: 8,
            border: '1px solid rgba(0,0,0,0.12)',
            fontSize: 13,
          }}
        />
        <button
          type="button"
          onClick={addRule}
          style={{
            padding: '8px 16px',
            borderRadius: 999,
            border: 'none',
            background: '#007aff',
            color: '#fff',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          添加到列表
        </button>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: '4px 12px 16px' }}>
        {rows.map((r) => (
          <div
            key={r.id}
            style={{
              marginBottom: 10,
              padding: '11px 12px',
              borderRadius: 12,
              background: '#fff',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ fontSize: 13, lineHeight: 1.5 }}>{r.text}</div>
            <div style={{ marginTop: 8, fontSize: 11, color: '#86868b' }}>
              状态：
              {r.status === 'pending' ? '待处理' : r.status === 'blocked' ? '已拦截' : '隔离观察'}
            </div>
            {r.status === 'pending' ? (
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => block(r.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: '#34c759',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  拦截
                </button>
                <button
                  type="button"
                  onClick={() => quarantine(r.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 8,
                    border: '1px solid rgba(0,0,0,0.12)',
                    background: '#fff',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  隔离
                </button>
              </div>
            ) : null}
          </div>
        ))}
        {!rows.length ? <p style={{ fontSize: 13, color: '#86868b' }}>列表为空。</p> : null}
      </div>

      {toast ? (
        <div
          role="status"
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 16,
            padding: '12px 14px',
            borderRadius: 12,
            background: 'rgba(28,28,30,0.92)',
            color: '#fff',
            fontSize: 13,
            lineHeight: 1.5,
            boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
            zIndex: 10,
          }}
        >
          {toast}
        </div>
      ) : null}

      <div style={{ padding: '0 12px 12px', fontSize: 11, color: '#86868b', lineHeight: 1.45 }}>
        待处理条目：{pending.length}。这只是自助练习，遭遇现实暴力或跟踪请优先争取人身安全与专业支持。
      </div>
    </div>
  );
}
