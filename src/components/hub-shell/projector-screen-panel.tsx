import { useCallback, useEffect, useRef, useState } from 'react';

import {
  clearStudyRoomDrawing,
  loadStudyRoomDrawing,
  saveStudyRoomDrawing,
  STUDY_ROOM_DRAWING_UPDATED_EVENT,
} from '@/lib/healing-study-room-screen';

export type ProjectorFolderId = 'draw' | 'media' | 'desk';

type ProjectorScreenPanelProps = {
  deskTitle: string;
  deskLead?: string;
};

export function ProjectorScreenPanel({ deskTitle, deskLead }: ProjectorScreenPanelProps) {
  const [folder, setFolder] = useState<ProjectorFolderId>('draw');
  const [drawingDataUrl, setDrawingDataUrl] = useState<string | null>(() => loadStudyRoomDrawing());
  const [drawMode, setDrawMode] = useState<'view' | 'edit'>(() =>
    loadStudyRoomDrawing() ? 'view' : 'edit',
  );

  useEffect(() => {
    const sync = () => {
      const next = loadStudyRoomDrawing();
      setDrawingDataUrl(next);
      if (next) setDrawMode('view');
    };
    window.addEventListener(STUDY_ROOM_DRAWING_UPDATED_EVENT, sync);
    return () => window.removeEventListener(STUDY_ROOM_DRAWING_UPDATED_EVENT, sync);
  }, []);

  useEffect(() => {
    if (folder !== 'draw') return;
    if (!drawingDataUrl) setDrawMode('edit');
  }, [folder, drawingDataUrl]);

  const tabs: { id: ProjectorFolderId; label: string; title: string }[] = [
    { id: 'draw', label: '手绘', title: '浅色文件夹 — 手绘签名' },
    { id: 'media', label: '媒体', title: '浅色文件夹 — 音视频' },
    { id: 'desk', label: '书案', title: '浅色文件夹 — 当前书页提示' },
  ];

  return (
    <div className="isr-pf-root">
      <div className="isr-pf-tabstrip" role="tablist" aria-label="幕布浅色文件夹">
        {tabs.map((t) => {
          const on = folder === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              title={t.title}
              aria-selected={on}
              className={`isr-pf-tab ${on ? 'isr-pf-tab--active' : ''}`}
              onClick={() => setFolder(t.id)}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div className="isr-pf-panel" role="tabpanel">
        {folder === 'draw' ? (
          <ProjectorDrawPane
            dataUrl={drawingDataUrl}
            mode={drawMode}
            onSwitchEdit={() => setDrawMode('edit')}
            onSaved={(url) => {
              setDrawingDataUrl(url);
              setDrawMode('view');
            }}
            onCleared={() => {
              setDrawingDataUrl(null);
              clearStudyRoomDrawing();
              setDrawMode('edit');
            }}
          />
        ) : null}
        {folder === 'media' ? <ProjectorMediaPane /> : null}
        {folder === 'desk' ? <ProjectorDeskPane title={deskTitle} lead={deskLead} /> : null}
      </div>
    </div>
  );
}

function ProjectorMediaPane() {
  return (
    <div className="isr-pf-placeholder">
      <i className="fa-solid fa-film isr-pf-icon" aria-hidden />
      <p className="isr-pf-lead">正在播放媒体信号…</p>
      <p className="isr-pf-muted">
        可在此嵌入疗愈音视频（video / iframe）。需要时把播放器组件挂到「媒体」文件夹内容区即可。
      </p>
    </div>
  );
}

function ProjectorDeskPane({ title, lead }: { title: string; lead?: string }) {
  return (
    <div className="isr-pf-placeholder isr-pf-placeholder--desk">
      <i className="fa-solid fa-book-open isr-pf-icon" aria-hidden />
      <p className="isr-pf-lead">当前书页：{title || '（尚未翻开）'}</p>
      {lead ? <p className="isr-pf-muted">{lead}</p> : null}
      <p className="isr-pf-muted">
        桌面手账与左侧书脊仍负责主操作；幕布上的「书案」夹只作轻量提示。
      </p>
    </div>
  );
}

function ProjectorDrawPane({
  dataUrl,
  mode,
  onSwitchEdit,
  onSaved,
  onCleared,
}: {
  dataUrl: string | null;
  mode: 'view' | 'edit';
  onSwitchEdit: () => void;
  onSaved: (url: string) => void;
  onCleared: () => void;
}) {
  if (mode === 'view' && dataUrl) {
    return (
      <div className="isr-pf-draw-view">
        <img src={dataUrl} alt="已保存的手绘签名" className="isr-pf-draw-img" />
        <div className="isr-pf-draw-actions">
          <button type="button" className="isr-pf-btn isr-pf-btn--ghost" onClick={onSwitchEdit}>
            ● 重新绘制
          </button>
          <button
            type="button"
            className="isr-pf-btn isr-pf-btn--warn"
            onClick={() => {
              onCleared();
            }}
          >
            ● 删除签名
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="isr-pf-draw-edit">
      <SignatureCanvas
        onSaved={(url) => {
          saveStudyRoomDrawing(url);
          onSaved(url);
        }}
      />
      <p className="isr-pf-hint">
        在下方纸本任意书写；点「挂到幕布」后，会显示在本夹层的预览（并写入本地，刷新后仍在）。
      </p>
    </div>
  );
}

function SignatureCanvas({ onSaved }: { onSaved: (dataUrl: string) => void }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastRef = useRef<{ x: number; y: number } | null>(null);

  const fitCanvas = useCallback(() => {
    const wrap = wrapRef.current;
    const el = canvasRef.current;
    if (!wrap || !el) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const { width, height } = wrap.getBoundingClientRect();
    const w = Math.max(120, Math.floor(width));
    const h = Math.max(160, Math.floor(height));
    el.width = Math.floor(w * dpr);
    el.height = Math.floor(h * dpr);
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;
    const ctx = el.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#faf6ef';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#2a2420';
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  useEffect(() => {
    fitCanvas();
    const ro = new ResizeObserver(() => fitCanvas());
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [fitCanvas]);

  const lineTo = (x: number, y: number) => {
    const el = canvasRef.current;
    if (!el) return;
    const ctx = el.getContext('2d');
    const last = lastRef.current;
    if (!ctx || !last) return;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastRef.current = { x, y };
  };

  return (
    <>
      <div ref={wrapRef} className="isr-pf-canvas-wrap">
        <canvas
          ref={canvasRef}
          className="isr-pf-canvas"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drawingRef.current = true;
            const el = e.currentTarget;
            const r = el.getBoundingClientRect();
            const x = e.clientX - r.left;
            const y = e.clientY - r.top;
            lastRef.current = { x, y };
            const ctx = el.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#2a2420';
              ctx.beginPath();
              ctx.arc(x, y, 1.15, 0, Math.PI * 2);
              ctx.fill();
            }
          }}
          onPointerMove={(e) => {
            if (!drawingRef.current) return;
            const r = e.currentTarget.getBoundingClientRect();
            lineTo(e.clientX - r.left, e.clientY - r.top);
          }}
          onPointerUp={(e) => {
            drawingRef.current = false;
            lastRef.current = null;
            try {
              e.currentTarget.releasePointerCapture(e.pointerId);
            } catch {
              /* ignore */
            }
          }}
          onPointerCancel={() => {
            drawingRef.current = false;
            lastRef.current = null;
          }}
        />
      </div>
      <div className="isr-pf-draw-actions">
        <button type="button" className="isr-pf-btn isr-pf-btn--ghost" onClick={() => fitCanvas()}>
          ● 清白纸
        </button>
        <button
          type="button"
          className="isr-pf-btn isr-pf-btn--primary"
          onClick={() => {
            const el = canvasRef.current;
            if (!el) return;
            onSaved(el.toDataURL('image/png'));
          }}
        >
          ● 挂到幕布
        </button>
      </div>
    </>
  );
}
