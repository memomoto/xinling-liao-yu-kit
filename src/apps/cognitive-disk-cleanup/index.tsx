/**
 * 认知磁盘清理 — 陈旧信念扫描 + 「更新为现实版本」对话框（CPT 卡点意象）。
 */

import { useCallback, useState } from 'react';

import { PaperButton, PaperCard, PaperTextarea } from '@/components/ui';

import './cdc.css';

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
    <div className="paper-app-surface cdc-root">
      <header className="cdc-header">
        <h1 className="cdc-title">认知磁盘清理</h1>
        <p className="cdc-lead">
          扫描到的「旧版本信念」不会粗暴删除——邀请你写成更符合当下的<strong>现实版本</strong>。
        </p>
      </header>

      <div className="cdc-main paper-app-scroll">
        {phase === 'intro' ? (
          <PaperButton variant="primary" onClick={startScan}>
            开始扫描陈旧认知文件…
          </PaperButton>
        ) : null}

        {phase === 'scan' ? (
          <div>
            <div className="cdc-scan-title">正在扫描记忆分区…</div>
            <div className="cdc-progress">
              <div
                className="cdc-progress-fill"
                style={{ width: `${(revealed / DEFAULT_FILES.length) * 100}%` }}
              />
            </div>
            <ul className="cdc-file-list">
              {DEFAULT_FILES.slice(0, revealed).map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {phase === 'list' ? (
          <div className="cdc-stack">
            {DEFAULT_FILES.map((f) => (
              <PaperCard key={f} elevation="raised" className="cdc-file-row">
                <span className="cdc-file-name">{f}</span>
                <div className="cdc-file-actions">
                  {updates[f] ? <span className="cdc-updated">已更新</span> : null}
                  <PaperButton variant="secondary" className="cdc-update-btn" onClick={() => openUpdate(f)}>
                    更新版本
                  </PaperButton>
                </div>
              </PaperCard>
            ))}
          </div>
        ) : null}
      </div>

      {dialogFile ? (
        <div className="cdc-dialog-backdrop">
          <PaperCard
            elevation="floating"
            className="cdc-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="cdc-dialog-title"
          >
            <h2 id="cdc-dialog-title" className="cdc-dialog-title">
              文件版本过旧
            </h2>
            <p className="cdc-dialog-body">
              检测到旧版本：<strong className="cdc-dialog-file">{dialogFile}</strong>
              <br />
              它可能诞生于过去的处境，不一定适用于<strong>此刻的现实</strong>。是否写成新版本？
            </p>
            <PaperTextarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="例如：那件事有多重因素，并不全然是我的责任…"
            />
            <div className="cdc-dialog-actions">
              <PaperButton variant="secondary" onClick={() => setDialogFile(null)}>
                稍后再说
              </PaperButton>
              <PaperButton variant="primary" onClick={saveUpdate} disabled={!draft.trim()}>
                保存新版本
              </PaperButton>
            </div>
          </PaperCard>
        </div>
      ) : null}
    </div>
  );
}
