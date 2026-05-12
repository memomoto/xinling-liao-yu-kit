/**
 * 认知磁盘清理 — 陈旧信念扫描 + 「更新为现实版本」对话框（CPT 卡点意象）。
 */

import { useCallback, useState } from 'react';

const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';

const DEFAULT_FILES = [
  '全都是我的错.exe',
  '我不值得被爱.dll',
  '我太敏感了.sys',
  '我必须让所有人满意.bat',
] as const;

export function CognitiveDiskCleanupApp() {
  const [phase, setPhase] = useState<'intro' | 'scan' | 'list'>('intro');
  const [revealed, setRevealed] = useState(0);
  const [updates, setUpdates] = useState<Record<string, string>>({});
  const [dialogFile, setDialogFile] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const startScan = () => {
    setPhase('scan');
    setRevealed(0);
    let i = 0;
    const tick = () => {
      i += 1;
      setRevealed(i);
      if (i >= DEFAULT_FILES.length) {
        window.setTimeout(() => setPhase('list'), 400);
      } else window.setTimeout(tick, 520);
    };
    tick();
  };

  const openUpdate = (f: string) => {
    setDialogFile(f);
    setDraft(updates[f] ?? '');
  };

  const saveUpdate = useCallback(() => {
    if (!dialogFile) return;
    const v = draft.trim();
    if (!v) return;
    setUpdates((u) => ({ ...u, [dialogFile]: v }));
    setDialogFile(null);
    setDraft('');
  }, [dialogFile, draft]);

  return (
    <div
      className="cdc-root"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: FONT,
        background: '#f5f5f7',
        color: '#1d1d1f',
        position: 'relative',
      }}
    >
      <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <h1 style={{ margin: 0, fontSize: 17 }}>认知磁盘清理</h1>
        <p style={{ margin: '8px 0 0', fontSize: 12, lineHeight: 1.55, color: '#515154' }}>
          扫描到的「旧版本信念」不会粗暴删除——邀请你写成更符合当下的<strong>现实版本</strong>。
        </p>
      </div>

      <div className="cdc-main" style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 16 }}>
        {phase === 'intro' ? (
          <button
            type="button"
            onClick={startScan}
            style={{
              padding: '10px 18px',
              borderRadius: 999,
              border: 'none',
              background: '#007aff',
              color: '#fff',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            开始扫描陈旧认知文件…
          </button>
        ) : null}

        {phase === 'scan' ? (
          <div>
            <div style={{ fontSize: 13, marginBottom: 12 }}>正在扫描记忆分区…</div>
            <div
              style={{
                height: 6,
                borderRadius: 3,
                background: 'rgba(0,0,0,0.06)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${(revealed / DEFAULT_FILES.length) * 100}%`,
                  background: '#34c759',
                  transition: 'width 0.35s ease',
                }}
              />
            </div>
            <ul style={{ marginTop: 14, paddingLeft: 18, fontSize: 13 }}>
              {DEFAULT_FILES.slice(0, revealed).map((f) => (
                <li key={f} style={{ marginBottom: 6 }}>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {phase === 'list' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DEFAULT_FILES.map((f) => (
              <div
                key={f}
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: '#fff',
                  border: '1px solid rgba(0,0,0,0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 10,
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: 13 }}>{f}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {updates[f] ? (
                    <span style={{ fontSize: 11, color: '#34c759', maxWidth: 180 }}>已更新</span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => openUpdate(f)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 8,
                      border: 'none',
                      background: '#007aff',
                      color: '#fff',
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    更新版本
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {dialogFile ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            zIndex: 20,
          }}
        >
          <div
            style={{
              width: 'min(400px, 100%)',
              borderRadius: 14,
              background: '#fff',
              padding: 16,
              boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700 }}>文件版本过旧</div>
            <p style={{ margin: '8px 0', fontSize: 13, color: '#515154' }}>
              检测到旧版本：<strong style={{ color: '#c41e3a' }}>{dialogFile}</strong>
              <br />
              它可能诞生于过去的处境，不一定适用于<strong>此刻的现实</strong>。是否写成新版本？
            </p>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="例如：那件事有多重因素，并不全然是我的责任…"
              rows={4}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: 10,
                borderRadius: 8,
                border: '1px solid rgba(0,0,0,0.12)',
                fontSize: 13,
                fontFamily: FONT,
              }}
            />
            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button type="button" onClick={() => setDialogFile(null)} style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(0,0,0,0.12)', background: '#fff', cursor: 'pointer' }}>
                稍后再说
              </button>
              <button
                type="button"
                onClick={saveUpdate}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: '#34c759',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                保存新版本
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
