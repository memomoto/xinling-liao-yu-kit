/**
 * 心之花温室 — SVG 花型（尖瓣 ↔ 圆瓣双层渐变）、浇水 Canvas 粒子、少女浅底色。
 */

import type { CSSProperties, MouseEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useHeartFlowerSyncedOrLocalCare } from '@/contexts/heart-flower-room-sync';
import {
  emptyHeartFlowerCare,
  heartFlowerMorphT,
  HEART_FLOWER_SPECS,
  type HeartFlowerId,
  type HeartFlowerSpec,
} from '@/lib/heart-flower-model';

import { HeartFlowerSvg } from './heart-flower-visual';
import { NOISE_BG } from './noise';

type Drop = { x: number; y: number; vy: number; r: number; life: number };

export function HeartFlowerGreenhouse() {
  const { care, setCare } = useHeartFlowerSyncedOrLocalCare();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dropsRef = useRef<Drop[]>([]);
  const rafRef = useRef<number>(0);

  const breathRafRef = useRef(0);
  const breathAudioCtxRef = useRef<AudioContext | null>(null);
  const breathStreamRef = useRef<MediaStream | null>(null);
  const breathAnalyserRef = useRef<AnalyserNode | null>(null);
  const breathDataRef = useRef<Uint8Array | null>(null);
  const smoothedRef = useRef(0);
  const prevSmoothedRef = useRef(0);
  const lastExhaleRef = useRef(0);
  const exhaleIdxRef = useRef(0);
  const breathFrameRef = useRef(0);
  const [breathOn, setBreathOn] = useState(false);
  const [breathScale, setBreathScale] = useState(1);
  const [breathErr, setBreathErr] = useState<string | null>(null);
  const [tiltOn, setTiltOn] = useState(false);
  const [tiltErr, setTiltErr] = useState<string | null>(null);
  const lastTiltWaterRef = useRef(0);

  const stars = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: `${(Math.sin(i * 7.13) * 0.5 + 0.5) * 92}%`,
        top: `${(Math.cos(i * 5.91) * 0.5 + 0.5) * 55}%`,
        delay: `${(i * 0.17) % 3}s`,
        dur: `${2.6 + (i % 5) * 0.35}s`,
      })),
    [],
  );

  const tickDrops = useCallback(() => {
    const c = canvasRef.current;
    const wrap = wrapRef.current;
    if (!c || !wrap) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const { width, height } = wrap.getBoundingClientRect();
    ctx.clearRect(0, 0, width, height);
    dropsRef.current = dropsRef.current.filter((d) => {
      d.y += d.vy;
      d.vy += 0.35;
      d.life -= 0.02;
      if (d.life <= 0) return false;
      ctx.beginPath();
      ctx.fillStyle = `rgba(180, 220, 255, ${0.15 + d.life * 0.45})`;
      ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
      ctx.fill();
      return true;
    });
    if (dropsRef.current.length) rafRef.current = requestAnimationFrame(tickDrops);
  }, []);

  const spawnWater = useCallback(
    (clientX: number, clientY: number) => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const r = wrap.getBoundingClientRect();
      const x = clientX - r.left;
      const y = clientY - r.top;
      for (let i = 0; i < 14; i++) {
        dropsRef.current.push({
          x: x + (Math.random() - 0.5) * 40,
          y: y + (Math.random() - 0.5) * 16,
          vy: 1 + Math.random() * 2.5,
          r: 1.2 + Math.random() * 2.2,
          life: 0.85 + Math.random() * 0.35,
        });
      }
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tickDrops);
    },
    [tickDrops],
  );

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(breathRafRef.current);
      breathStreamRef.current?.getTracks().forEach((t) => t.stop());
      void breathAudioCtxRef.current?.close();
    };
  }, []);

  useEffect(() => {
    const resize = () => {
      const wrap = wrapRef.current;
      const c = canvasRef.current;
      if (!wrap || !c) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = wrap.getBoundingClientRect();
      c.width = Math.floor(width * dpr);
      c.height = Math.floor(height * dpr);
      c.style.width = `${width}px`;
      c.style.height = `${height}px`;
      const ctx = c.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const water = (id: HeartFlowerId, e: MouseEvent) => {
    setCare((prev) => ({
      ...prev,
      [id]: { ...prev[id], water: Math.min(3, prev[id].water + 1) },
    }));
    spawnWater(e.clientX, e.clientY);
  };

  const hug = (id: HeartFlowerId) => {
    setCare((prev) => ({
      ...prev,
      [id]: { ...prev[id], hug: Math.min(3, prev[id].hug + 1) },
    }));
  };

  const breathActiveRef = useRef(false);

  const stopBreath = useCallback(() => {
    cancelAnimationFrame(breathRafRef.current);
    breathRafRef.current = 0;
    breathStreamRef.current?.getTracks().forEach((t) => t.stop());
    breathStreamRef.current = null;
    void breathAudioCtxRef.current?.close();
    breathAudioCtxRef.current = null;
    breathAnalyserRef.current = null;
    breathDataRef.current = null;
    breathActiveRef.current = false;
    setBreathOn(false);
    setBreathScale(1);
    smoothedRef.current = 0;
    prevSmoothedRef.current = 0;
    setBreathErr(null);
  }, []);

  const startBreath = useCallback(async () => {
    if (breathActiveRef.current) return;
    setBreathErr(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      breathStreamRef.current = stream;
      const ctx = new AudioContext();
      await ctx.resume();
      breathAudioCtxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 512;
      an.smoothingTimeConstant = 0.62;
      src.connect(an);
      breathAnalyserRef.current = an;
      breathDataRef.current = new Uint8Array(an.fftSize);
      smoothedRef.current = 0;
      prevSmoothedRef.current = 0;
      lastExhaleRef.current = 0;
      breathFrameRef.current = 0;
      breathActiveRef.current = true;
      setBreathOn(true);

      const tick = () => {
        const analyser = breathAnalyserRef.current;
        const data = breathDataRef.current;
        if (!analyser || !data) return;
        analyser.getByteTimeDomainData(data as Uint8Array<ArrayBuffer>);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] ?? 128) - 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / data.length);
        const norm = Math.min(1, rms / 36);
        const sm = smoothedRef.current * 0.82 + norm * 0.18;
        smoothedRef.current = sm;

        const scale = 0.87 + sm * 0.18;
        breathFrameRef.current += 1;
        if (breathFrameRef.current % 2 === 0) setBreathScale(scale);

        const now = performance.now();
        if (sm > 0.28 && prevSmoothedRef.current < 0.16 && now - lastExhaleRef.current > 800) {
          lastExhaleRef.current = now;
          const idx = exhaleIdxRef.current % HEART_FLOWER_SPECS.length;
          exhaleIdxRef.current += 1;
          const fid = HEART_FLOWER_SPECS[idx]!.id;
          setCare((prev) => ({
            ...prev,
            [fid]: { ...prev[fid], water: Math.min(3, prev[fid].water + 1) },
          }));
          const wrap = wrapRef.current;
          if (wrap) {
            const r = wrap.getBoundingClientRect();
            spawnWater(r.left + r.width * (0.32 + idx * 0.12), r.top + r.height * 0.4);
          }
        }
        prevSmoothedRef.current = sm;

        breathRafRef.current = requestAnimationFrame(tick);
      };
      breathRafRef.current = requestAnimationFrame(tick);
    } catch {
      breathActiveRef.current = false;
      setBreathErr('麦克风不可用或未授权——仍可用手势浇水 / 拥抱。');
      setBreathOn(false);
    }
  }, [spawnWater]);

  useEffect(() => {
    if (!tiltOn) return;
    setTiltErr(null);
    let cancelled = false;
    const onOrient = (e: DeviceOrientationEvent) => {
      if (cancelled) return;
      const beta = e.beta ?? 0;
      const gamma = e.gamma ?? 0;
      const tiltAmp = Math.abs(beta - 70) + Math.abs(gamma);
      const now = performance.now();
      if (tiltAmp > 44 && now - lastTiltWaterRef.current > 1400) {
        lastTiltWaterRef.current = now;
        const idx = exhaleIdxRef.current % HEART_FLOWER_SPECS.length;
        exhaleIdxRef.current += 1;
        const fid = HEART_FLOWER_SPECS[idx]!.id;
        setCare((prev) => ({
          ...prev,
          [fid]: { ...prev[fid], water: Math.min(3, prev[fid].water + 1) },
        }));
        const wrap = wrapRef.current;
        if (wrap) {
          const r = wrap.getBoundingClientRect();
          spawnWater(r.left + r.width * (0.28 + idx * 0.14), r.top + r.height * 0.38);
        }
      }
    };
    window.addEventListener('deviceorientation', onOrient);
    return () => {
      cancelled = true;
      window.removeEventListener('deviceorientation', onOrient);
    };
  }, [tiltOn, spawnWater]);

  const toggleTilt = async () => {
    setTiltErr(null);
    if (tiltOn) {
      setTiltOn(false);
      return;
    }
    const DO = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };
    if (typeof DO.requestPermission === 'function') {
      try {
        const r = await DO.requestPermission();
        if (r !== 'granted') {
          setTiltErr('未获准使用陀螺仪——仍可用手势浇水或呼吸浇水。');
          return;
        }
      } catch {
        setTiltErr('无法请求陀螺仪权限。');
        return;
      }
    }
    setTiltOn(true);
  };

  const reset = useCallback(() => {
    stopBreath();
    setTiltOn(false);
    setTiltErr(null);
    setCare(emptyHeartFlowerCare());
  }, [stopBreath]);

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative',
        borderRadius: 18,
        backgroundColor: '#FFF8F5',
        backgroundImage: NOISE_BG,
        overflow: 'hidden',
        minHeight: 420,
        fontFamily: '"Songti SC", SimSun, Georgia, serif',
      }}
    >
      <style>{`
        @keyframes hjTwinkle {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 0.92; }
        }
      `}</style>

      {stars.map((s) => (
        <span
          key={s.id}
          aria-hidden
          style={{
            position: 'absolute',
            left: s.left,
            top: s.top,
            width: 3,
            height: 3,
            borderRadius: '50%',
            background: 'rgba(255, 190, 210, 0.65)',
            boxShadow: '0 0 6px rgba(255,200,230,0.8)',
            animation: `hjTwinkle ${s.dur} ease-in-out infinite`,
            animationDelay: s.delay,
          }}
        />
      ))}

      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 3,
        }}
        aria-hidden
      />

      <div style={{ position: 'relative', zIndex: 2, padding: '18px 16px 22px' }}>
        <p
          style={{
            margin: '0 0 14px',
            fontSize: 13,
            lineHeight: 1.75,
            color: '#6b5a58',
          }}
        >
          这里没有「拔掉杂草」。每一朵花都是一种情绪的化身——<strong>浇水</strong>会有水珠落下，<strong>拥抱</strong>时尖瓣会换成温柔的圆弧。
          也可以<strong>开启呼吸浇水</strong>：呼气时花体会轻轻鼓起，气息流过会像一阵细雨轮流滋润四盆花。
          若在手机上<strong>轻轻倾斜设备</strong>，也可触发「阵雨」意象浇水（需浏览器允许陀螺仪）。
        </p>

        <div style={{ marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => (breathOn ? stopBreath() : void startBreath())}
            style={miniBtn(breathOn ? '#ffd6e8' : '#d8f0ff')}
          >
            {breathOn ? '关闭呼吸浇水' : '开启呼吸浇水（麦克风一次授权）'}
          </button>
          {breathErr ? (
            <span style={{ fontSize: 12, color: '#b85868', maxWidth: 280 }}>{breathErr}</span>
          ) : null}
          <button
            type="button"
            onClick={() => void toggleTilt()}
            style={miniBtn(tiltOn ? '#ffe8cc' : '#e8f5e9')}
          >
            {tiltOn ? '关闭倾斜浇水' : '开启倾斜浇水（陀螺仪）'}
          </button>
          {tiltErr ? (
            <span style={{ fontSize: 12, color: '#b85868', maxWidth: 260 }}>{tiltErr}</span>
          ) : null}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))',
            gap: 16,
          }}
        >
          {HEART_FLOWER_SPECS.map((f: HeartFlowerSpec) => {
            const t = heartFlowerMorphT(care[f.id]);
            const glow = t >= 0.72;
            return (
              <div
                key={f.id}
                style={{
                  padding: 12,
                  borderRadius: 16,
                  border: '1px solid rgba(232, 197, 255, 0.35)',
                  background: 'rgba(255,255,255,0.55)',
                  boxShadow: glow ? '0 8px 28px rgba(255, 183, 213, 0.25)' : '0 4px 14px rgba(80,60,90,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <HeartFlowerSvg spec={f} t={t} glow={glow} breathScale={breathOn ? breathScale : 1} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#5c4550' }}>{f.label}</div>
                  <div style={{ fontSize: 11, color: '#9a8588', marginTop: 2 }}>{f.hint}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button type="button" onClick={(e) => water(f.id, e)} style={miniBtn('#c8e4ff')}>
                    浇水
                  </button>
                  <button type="button" onClick={() => hug(f.id)} style={miniBtn('#ffd6e8')}>
                    拥抱
                  </button>
                </div>
                {glow ? (
                  <p style={{ margin: 0, fontSize: 11, color: '#b87898', lineHeight: 1.55 }}>
                    它还在这里，只是学会了温柔地发光。
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" onClick={reset} style={miniBtn('rgba(255,255,255,0.65)', true)}>
            重新照料温室
          </button>
        </div>
      </div>
    </div>
  );
}

function miniBtn(bg: string, ghost?: boolean): CSSProperties {
  return {
    padding: '7px 14px',
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 999,
    border: ghost ? '1px solid rgba(200,160,180,0.45)' : '1px solid rgba(255,255,255,0.65)',
    background: bg,
    color: '#4a3d42',
    cursor: 'pointer',
    fontFamily: '"Songti SC", SimSun, "PingFang SC", sans-serif',
  };
}
