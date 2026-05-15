import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { createPortal } from 'react-dom';

import { HeartFlowerSvg } from '@/apps/healing-interactions/heart-flower-visual';
import { COMFORT_BOOK_SNIPPETS } from '@/apps/comfort-buddy/comfort-quotes';
import { useSyncedHeartFlowerNullable, useShelfHeartMirrorDisplay } from '@/contexts/heart-flower-room-sync';
import { useStudyRoomWidgets } from '@/components/hub-shell/study-room-widgets';
import {
  HEART_FLOWER_SPECS,
  emptyHeartFlowerCare,
  type HeartFlowerCareMap,
} from '@/lib/heart-flower-model';

import './physical-room-healing-widgets.css';

type StarBurstParticle = {
  delayMs: number;
  ux: number;
  uy: number;
};

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function easeOutCubic(v: number) {
  const t = clamp01(v);
  return 1 - (1 - t) ** 3;
}

function StarBurstCanvasLayer({
  originX,
  originY,
  particles,
  onDone,
}: {
  originX: number;
  originY: number;
  particles: StarBurstParticle[];
  onDone: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);

    let rafId = 0;
    let t0 = 0;
    const totalMs = 1520;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const frame = (now: number) => {
      if (!t0) t0 = now;
      const elapsed = now - t0;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const p of particles) {
        const lt = elapsed - p.delayMs;
        if (lt <= 0) continue;
        const prog = easeOutCubic(lt / 1180);
        const x = originX + p.ux * prog;
        const y = originY + p.uy * prog;
        const alpha = clamp01((1 - prog) * 1.08) * clamp01(Math.min(lt / 280, 1));
        const r = Math.max(0.6, (1 - prog * 0.92) * 3);

        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 232, 128, ${alpha * 0.95})`;
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (elapsed < totalMs) {
        rafId = requestAnimationFrame(frame);
      } else {
        window.removeEventListener('resize', resize);
        onDone();
      }
    };

    rafId = requestAnimationFrame(frame);
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(rafId);
    };
  }, [particles, originX, originY, onDone]);

  return (
    <canvas
      ref={canvasRef}
      className="isr-star-burst-canvas"
      aria-hidden
    />
  );
}

function bumpRandomFlowerWater(setCare: Dispatch<SetStateAction<HeartFlowerCareMap>>) {
  const idx = Math.floor(Math.random() * HEART_FLOWER_SPECS.length);
  const fid = HEART_FLOWER_SPECS[idx]!.id;
  setCare((prev) => ({
    ...prev,
    [fid]: { ...prev[fid], water: Math.min(3, prev[fid].water + 1) },
  }));
}

/** 墙面：日历、收音机、盆栽（互动层叠在墙纸之上，不挡窗内气球：仅小控件接管指针） */
export function PhysicalRoomWallEntities() {
  const { showToast } = useStudyRoomWidgets();
  const syncedRoom = useSyncedHeartFlowerNullable();
  const [soloCare, setSoloCare] = useState<HeartFlowerCareMap>(() => emptyHeartFlowerCare());
  const careForMirror = syncedRoom?.care ?? soloCare;
  const shelfVisual = useShelfHeartMirrorDisplay(careForMirror);

  const [radioOn, setRadioOn] = useState(false);


  const [radioTune, setRadioTune] = useState(false);

  const [waterKey, setWaterKey] = useState(0);
  const [heartKey, setHeartKey] = useState(0);
  const [calOpen, setCalOpen] = useState(false);

  const runRadioTune = () => {
    setRadioTune(true);
    window.setTimeout(() => setRadioTune(false), 300);
  };

  const toggleRadio = useCallback(() => {
    runRadioTune();
    setRadioOn((v) => {
      const next = !v;
      if (next) {
        const snippet = COMFORT_BOOK_SNIPPETS[Math.floor(Math.random() * COMFORT_BOOK_SNIPPETS.length)]!;
        showToast(`收音机频道：「${snippet}」`);
      } else {
        showToast('收音机已关闭');
      }
      return next;
    });
  }, [showToast]);

  const waterPlant = useCallback(() => {
    setWaterKey((k) => k + 1);
    window.setTimeout(() => {
      setHeartKey((k) => k + 1);
      bumpRandomFlowerWater(syncedRoom ? syncedRoom.setCare : setSoloCare);
      showToast(syncedRoom ? '浇水已与温室同步' : '浇水成功');
    }, 780);
  }, [showToast, syncedRoom]);

  const now = new Date();

  function monthEnShort(d: Date): string {
    return ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][d.getMonth()] ?? '—';
  }

  return (
    <>
      <div className="isr-physics-layer" aria-hidden={false}>
        <button
          type="button"
          className="isr-cal-widget"
          onClick={() => setCalOpen(true)}
          title="每日呼吸"
          aria-label="打开每日呼吸冥想"
        >
          <span className="isr-cal-widget-top">{monthEnShort(now)}</span>
          <span className="isr-cal-widget-day">{now.getDate()}</span>
          <span className="isr-cal-widget-desc">每日呼吸</span>
        </button>

        <div className="shelves-container">
          <div className="pink-lace-shelf" style={{ marginTop: 60 }}>
            <div id="physicalPlant">
              <button type="button" className="isr-plant-widget isr-shelf-hit" onClick={waterPlant} title="书桌盆栽" aria-label="给书桌盆栽浇水">
                <HeartFlowerSvg
                  spec={shelfVisual.spec}
                  t={shelfVisual.t}
                  glow={shelfVisual.glow}
                  width={72}
                  height={78}
                  breathScale={1}
                />
                <span key={`w${waterKey}`} className="isr-water-drop" aria-hidden />
                <span key={`h${heartKey}`} className="isr-heart-float" aria-hidden>
                  ❤
                </span>
              </button>
            </div>
          </div>
          <div className="pink-lace-shelf" style={{ marginTop: 100 }}>
            <div id="physicalRadio">
              <button
                type="button"
                className={`isr-radio-widget isr-shelf-hit${radioOn ? ' isr-radio-widget--on' : ''}${radioTune ? ' isr-radio-widget--tune' : ''}`}
                onClick={toggleRadio}
                aria-pressed={radioOn}
                title="声音胶囊"
                aria-label={radioOn ? '关闭收音机' : '打开收音机'}
              >
                <span className="isr-radio-antenna" aria-hidden />
                <span className="isr-radio-speaker" aria-hidden />
                <span className="isr-radio-dial" aria-hidden />
                {radioOn ? (
                  <span className="isr-radio-note" aria-hidden>
                    🎵
                  </span>
                ) : null}
              </button>
            </div>
          </div>
          <div className="pink-lace-shelf" style={{ marginTop: 100 }} />
        </div>
      </div>

      {calOpen
        ? createPortal(
            <div
              className="isr-pr-modal-overlay"
              role="presentation"
              onMouseDown={(e) => e.target === e.currentTarget && setCalOpen(false)}
            >
              <div className="isr-pr-modal" role="dialog" aria-modal="true" aria-labelledby="isr-pr-cal-title">
                <button type="button" className="isr-pr-modal-close" onClick={() => setCalOpen(false)} aria-label="关闭">
                  ×
                </button>
                <h3 id="isr-pr-cal-title" className="isr-pr-modal-h">
                  4-7-8 呼吸练习
                </h3>
                <p className="isr-pr-modal-p">跟着圆圈的节奏：吸气 4 秒，憋气 7 秒，呼气 8 秒。</p>
                <div className="isr-breathe-circle" aria-hidden />
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

/** 书桌：无法寄出的信（抽屉意象 + Canvas 星光） */
export function PhysicalRoomDeskDrawer() {
  const { showToast } = useStudyRoomWidgets();
  const [letterOpen, setLetterOpen] = useState(false);
  const [letterBody, setLetterBody] = useState('');
  const boxRef = useRef<HTMLDivElement>(null);
  const [burst, setBurst] = useState<{
    ox: number;
    oy: number;
    parts: StarBurstParticle[];
  } | null>(null);
  const sendLetter = useCallback(() => {
    const text = letterBody.trim();
    if (!text) {
      showToast('先写点什么吧～');
      return;
    }
    const rect = boxRef.current?.getBoundingClientRect();
    const ox = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const oy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2 - 120;
    setLetterOpen(false);
    setLetterBody('');
    showToast('信件已化为星光飘散');
    const parts: StarBurstParticle[] = [];
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 100 + Math.random() * 280;
      parts.push({
        delayMs: Math.random() * 450,
        ux: Math.cos(angle) * dist,
        uy: Math.sin(angle) * dist - 160,
      });
    }
    setBurst({ ox, oy, parts });
  }, [letterBody, showToast]);

  const clearBurst = useCallback(() => setBurst(null), []);

  const starPortal = burst;

  return (
    <>
      <button
        type="button"
        className="isr-drawer-widget"
        onClick={() => setLetterOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={letterOpen}
        title="无法寄出的信"
      >
        <span className="isr-drawer-label">无法寄出的信</span>
        <span className="isr-drawer-handle" aria-hidden />
      </button>

      {letterOpen
        ? createPortal(
            <div
              className="isr-pr-modal-overlay"
              role="presentation"
              onMouseDown={(e) => e.target === e.currentTarget && setLetterOpen(false)}
            >
              <div ref={boxRef} className="isr-pr-modal isr-pr-modal--letter" role="dialog" aria-modal="true">
                <button type="button" className="isr-pr-modal-close" onClick={() => setLetterOpen(false)} aria-label="关闭">
                  ×
                </button>
                <h3 className="isr-pr-modal-h">写下无法寄出的信</h3>
                <textarea
                  className="isr-letter-textarea"
                  value={letterBody}
                  onChange={(e) => setLetterBody(e.target.value)}
                  placeholder="把卡住的想法写在这里…"
                  rows={6}
                />
                <button type="button" className="isr-letter-send" onClick={sendLetter}>
                  化为星光放飞
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}

      {starPortal
        ? createPortal(
            <StarBurstCanvasLayer
              originX={starPortal.ox}
              originY={starPortal.oy}
              particles={starPortal.parts}
              onDone={clearBurst}
            />,
            document.body,
          )
        : null}
    </>
  );
}
