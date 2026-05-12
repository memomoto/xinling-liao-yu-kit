/**
 * 避风港静默室 — 深蓝夜空 + 纸张 + Canvas 星光粒子；
 * 可选 Web Speech API：边说边出字，静音约 3 秒自动放飞。
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { getSpeechRecognitionCtor, type AnySpeechRecognition } from './speech';

type Particle = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  r: number;
  g: number;
  b: number;
  settled: boolean;
};

type Star = { x: number; y: number; tw: number };

const SILENCE_MS = 2800;

export function HarborQuietRoom() {
  const paperRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef(0);
  const [released, setReleased] = useState(false);
  const [stars, setStars] = useState<Star[]>([]);

  const recognitionRef = useRef<AnySpeechRecognition | null>(null);
  const silenceTimerRef = useRef<number | null>(null);
  const finalTranscriptRef = useRef('');
  const voiceDesiredRef = useRef(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [voiceHint, setVoiceHint] = useState<string | null>(null);

  useEffect(() => {
    setStars(
      Array.from({ length: 40 }, () => ({
        x: Math.random() * 94 + 3,
        y: Math.random() * 72 + 6,
        tw: 2.2 + Math.random() * 2.5,
      })),
    );
  }, []);

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const release = useCallback(() => {
    const paper = paperRef.current;
    const root = rootRef.current;
    if (!paper || !root) return;
    const raw = paper.innerText.replace(/\u00a0/g, ' ').trim();
    if (!raw) return;
    if (stars.length === 0) return;

    clearSilenceTimer();
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    setVoiceOn(false);
    voiceDesiredRef.current = false;

    const pr = paper.getBoundingClientRect();
    const rr = root.getBoundingClientRect();

    const W = 560;
    const H = 320;
    const oc = document.createElement('canvas');
    oc.width = W;
    oc.height = H;
    const ctx = oc.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFF9F0';
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#3D2B1F';
    ctx.textBaseline = 'top';
    ctx.font = '28px STKaiti, KaiTi, "Songti SC", SimSun, serif';

    const pad = 18;
    const maxW = W - pad * 2;
    const lines: string[] = [];
    for (const paragraph of raw.split(/\n+/)) {
      let line = '';
      for (const ch of Array.from(paragraph)) {
        const test = line + ch;
        if (ctx.measureText(test).width > maxW && line) {
          lines.push(line);
          line = ch;
        } else {
          line = test;
        }
      }
      if (line) lines.push(line);
    }

    let y = pad;
    const lh = 38;
    for (const ln of lines) {
      ctx.fillText(ln, pad, y);
      y += lh;
      if (y > H - lh) break;
    }

    const { data, width, height } = ctx.getImageData(0, 0, W, H);
    const parts: Particle[] = [];
    const step = 3;
    const ox = pr.left - rr.left;
    const oy = pr.top - rr.top;
    const sx = pr.width / W;
    const sy = pr.height / H;

    for (let py = 0; py < height; py += step) {
      for (let px = 0; px < width; px += step) {
        const i = (py * width + px) * 4;
        const a = data[i + 3] ?? 0;
        if (a < 96) continue;
        const r = data[i] ?? 0;
        const gCh = data[i + 1] ?? 0;
        const b = data[i + 2] ?? 0;
        const star = stars[(parts.length + px + py) % Math.max(stars.length, 1)] ?? {
          x: 50,
          y: 40,
          tw: 3,
        };
        const tx = (star.x / 100) * rr.width;
        const ty = (star.y / 100) * rr.height;
        parts.push({
          x: ox + px * sx,
          y: oy + py * sy,
          tx,
          ty,
          r,
          g: gCh,
          b,
          settled: false,
        });
      }
    }

    particlesRef.current = parts.slice(0, 3200);
    paper.innerHTML = '';
    finalTranscriptRef.current = '';
    setReleased(true);

    const loop = () => {
      const canvas = canvasRef.current;
      const rt = rootRef.current;
      if (!canvas || !rt) return;
      const cctx = canvas.getContext('2d');
      if (!cctx) return;

      const rw = rt.clientWidth;
      const rh = rt.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rw * dpr;
      canvas.height = rh * dpr;
      canvas.style.width = `${rw}px`;
      canvas.style.height = `${rh}px`;
      cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cctx.clearRect(0, 0, rw, rh);

      const now = performance.now();

      for (const p of particlesRef.current) {
        if (p.settled) {
          const twinkle = 0.3 + 0.45 * Math.sin(now / 520 + p.x * 0.02 + p.y * 0.02);
          cctx.fillStyle = `rgba(255, 217, 236, ${twinkle})`;
          cctx.fillRect(p.x, p.y, 2.2, 2.2);
          continue;
        }
        p.x += (p.tx - p.x) * 0.054;
        p.y += (p.ty - p.y) * 0.054;
        if (Math.hypot(p.tx - p.x, p.ty - p.y) < 3.5) {
          p.settled = true;
          p.x = p.tx;
          p.y = p.ty;
        }
        const lr = p.r + (255 - p.r) * 0.38;
        const lg = p.g + (217 - p.g) * 0.38;
        const lb = p.b + (236 - p.b) * 0.38;
        cctx.fillStyle = `rgba(${lr},${lg},${lb},0.88)`;
        cctx.fillRect(p.x, p.y, 2, 2);
      }

      if (particlesRef.current.length) {
        rafRef.current = requestAnimationFrame(loop);
      }
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(loop);
  }, [stars, clearSilenceTimer]);

  const scheduleAutoRelease = useCallback(() => {
    clearSilenceTimer();
    silenceTimerRef.current = window.setTimeout(() => {
      silenceTimerRef.current = null;
      const paper = paperRef.current;
      const text = paper?.innerText.replace(/\u00a0/g, ' ').trim() ?? '';
      if (text.length > 0) {
        release();
      }
    }, SILENCE_MS);
  }, [clearSilenceTimer, release]);

  const stopVoice = useCallback(() => {
    voiceDesiredRef.current = false;
    clearSilenceTimer();
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;
    setVoiceOn(false);
    setVoiceHint(null);
  }, [clearSilenceTimer]);

  const startVoice = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setVoiceHint('当前浏览器不支持语音识别（试试 Chrome / Edge）。');
      return;
    }
    setVoiceHint(null);
    finalTranscriptRef.current = '';
    voiceDesiredRef.current = true;

    const rec = new Ctor();
    recognitionRef.current = rec;
    rec.lang = 'zh-CN';
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (event: Event) => {
      const e = event as unknown as {
        resultIndex: number;
        results: { length: number; [k: number]: { 0: { transcript: string }; isFinal: boolean } };
      };
      let interim = '';
      let finalChunk = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const piece = res[0]?.transcript ?? '';
        if (res.isFinal) finalChunk += piece;
        else interim += piece;
      }
      if (finalChunk) finalTranscriptRef.current += finalChunk;

      const paper = paperRef.current;
      if (paper && !released) {
        const merged = (finalTranscriptRef.current + interim).trim();
        paper.innerText = merged || '';
      }
      scheduleAutoRelease();
    };

    rec.onerror = () => {
      setVoiceHint('麦克风或语音识别中断，可改用手写输入。');
      stopVoice();
    };

    rec.onend = () => {
      if (!voiceDesiredRef.current) return;
      try {
        rec.start();
      } catch {
        /* ignore */
      }
    };

    try {
      rec.start();
      setVoiceOn(true);
      scheduleAutoRelease();
    } catch {
      voiceDesiredRef.current = false;
      setVoiceHint('无法启动语音识别，请检查麦克风权限。');
      recognitionRef.current = null;
      setVoiceOn(false);
    }
  }, [released, scheduleAutoRelease, stopVoice]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);
  useEffect(
    () => () => {
      clearSilenceTimer();
      try {
        recognitionRef.current?.abort();
      } catch {
        /* ignore */
      }
    },
    [clearSilenceTimer],
  );

  const speechSupported = typeof window !== 'undefined' && !!getSpeechRecognitionCtor();

  return (
    <div
      ref={rootRef}
      style={{
        position: 'relative',
        minHeight: 440,
        borderRadius: 18,
        overflow: 'hidden',
        background: 'linear-gradient(165deg, #0A0A1A 0%, #1A0A2E 55%, #12081f 100%)',
        fontFamily: 'STKaiti, KaiTi, "Songti SC", SimSun, serif',
      }}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 6 }} />

      <style>{`
        @keyframes hqTw {
          0%, 100% { opacity: 0.22; transform: scale(1); }
          50% { opacity: 0.92; transform: scale(1.28); }
        }
        .hq-paper[contenteditable='true']:empty:before {
          content: attr(data-placeholder);
          color: rgba(61, 43, 31, 0.34);
          pointer-events: none;
        }
      `}</style>

      {stars.map((s, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: 2,
            height: 2,
            borderRadius: '50%',
            background: 'rgba(255,230,250,0.55)',
            animation: `hqTw ${s.tw}s ease-in-out infinite`,
            animationDelay: `${(i % 8) * 0.15}s`,
          }}
        />
      ))}

      <div style={{ position: 'relative', zIndex: 4, padding: '18px 18px 100px' }}>
        <p
          style={{
            margin: '0 0 12px',
            fontSize: 12,
            color: 'rgba(210,190,230,0.65)',
            fontFamily: '"PingFang SC", sans-serif',
            lineHeight: 1.55,
          }}
        >
          写几句话给此刻的自己，或使用<strong>语音</strong>轻声说出来——说完停顿约 {SILENCE_MS / 1000}{' '}
          秒会自动「放飞」成星光（也可手动点按钮）。内容仅在本地浏览器处理。
        </p>

        <div style={{ marginBottom: 10, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {speechSupported ? (
            <button
              type="button"
              disabled={released}
              onClick={() => (voiceOn ? stopVoice() : startVoice())}
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                border: voiceOn ? '1px solid rgba(255,160,200,0.8)' : '1px solid rgba(200,180,230,0.45)',
                background: voiceOn ? 'rgba(255,120,160,0.25)' : 'rgba(255,255,255,0.08)',
                color: released ? 'rgba(160,140,180,0.45)' : 'rgba(240,220,250,0.95)',
                cursor: released ? 'default' : 'pointer',
                fontSize: 13,
                fontFamily: '"PingFang SC", sans-serif',
              }}
            >
              {voiceOn ? '🎤 聆听中…（点按结束）' : '🎤 用语音填写'}
            </button>
          ) : (
            <span style={{ fontSize: 12, color: 'rgba(200,180,220,0.55)', fontFamily: '"PingFang SC", sans-serif' }}>
              当前环境不支持语音 API，请直接输入文字。
            </span>
          )}
          {voiceHint ? (
            <span style={{ fontSize: 11, color: 'rgba(255,190,200,0.85)', fontFamily: '"PingFang SC", sans-serif' }}>
              {voiceHint}
            </span>
          ) : null}
        </div>

        <div
          style={{
            position: 'relative',
            borderRadius: 14,
            padding: 3,
            background: 'linear-gradient(135deg, rgba(255,210,230,0.35), rgba(200,230,255,0.25))',
          }}
        >
          <div
            ref={paperRef}
            className="hq-paper"
            contentEditable={!released}
            suppressContentEditableWarning
            role="textbox"
            aria-multiline
            data-placeholder="在这里写下心事…"
            style={{
              minHeight: 200,
              padding: '18px 20px',
              borderRadius: 12,
              background: '#FFF9F0',
              color: '#3D2B1F',
              fontSize: 26,
              lineHeight: 1.65,
              outline: 'none',
              boxShadow: 'inset 0 0 40px rgba(255,255,255,0.35)',
            }}
          />
        </div>

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={release}
            disabled={released}
            style={{
              padding: '10px 22px',
              borderRadius: 999,
              border: '1px solid rgba(255,210,240,0.45)',
              background: released ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #ffe8f8, #e8f0ff)',
              color: released ? 'rgba(200,180,210,0.5)' : '#5a4060',
              cursor: released ? 'default' : 'pointer',
              fontSize: 14,
              fontFamily: '"PingFang SC", sans-serif',
              boxShadow: released ? 'none' : '0 6px 18px rgba(80,40,90,0.2)',
            }}
          >
            ✦ 放飞 ✦
          </button>
          <button
            type="button"
            onClick={() => {
              stopVoice();
              setReleased(false);
              particlesRef.current = [];
              finalTranscriptRef.current = '';
              if (paperRef.current) paperRef.current.innerHTML = '';
              cancelAnimationFrame(rafRef.current);
            }}
            style={{
              padding: '10px 16px',
              borderRadius: 999,
              border: '1px solid rgba(180,170,220,0.35)',
              background: 'transparent',
              color: 'rgba(210,195,235,0.85)',
              cursor: 'pointer',
              fontSize: 13,
              fontFamily: '"PingFang SC", sans-serif',
            }}
          >
            再写一页
          </button>
        </div>
      </div>
    </div>
  );
}
