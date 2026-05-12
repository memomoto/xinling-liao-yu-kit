/**
 * 麦克风：粗略区分「吹气」（偏低频能量）与环境声 / 说话。
 * 不录音、不上传；仅本地 AnalyserNode。
 */

import { useEffect, useRef, useState } from 'react';

export type BreathMicState = {
  intensity: number;
  /** 当前帧判定为吹气 */
  isBlowing: boolean;
  /** 启动失败原因 */
  error: string | null;
  /** 正在请求权限或校准 */
  busy: boolean;
};

export function useBreathMic(enabled: boolean): BreathMicState {
  const [intensity, setIntensity] = useState(0);
  const [isBlowing, setIsBlowing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const rafRef = useRef<number | null>(null);
  const noiseRef = useRef(18);

  useEffect(() => {
    if (!enabled) {
      setIntensity(0);
      setIsBlowing(false);
      setError(null);
      setBusy(false);
      return;
    }

    let stream: MediaStream | null = null;
    let ctx: AudioContext | null = null;
    let cancelled = false;

    const start = async () => {
      setBusy(true);
      setError(null);
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true },
          video: false,
        });
        if (cancelled) return;

        ctx = new AudioContext();
        const src = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.78;
        src.connect(analyser);
        const buf = new Uint8Array(analyser.frequencyBinCount);

        const calibUntil = performance.now() + 900;
        let noiseAcc = 0;
        let noiseN = 0;

        const tick = () => {
          if (cancelled || !ctx || !analyser) return;
          analyser.getByteFrequencyData(buf);
          const n = buf.length;
          let sum = 0;
          for (let i = 0; i < n; i++) sum += buf[i]!;
          const vol = sum / n;

          let low = 0;
          const lowEnd = Math.min(14, n);
          for (let i = 0; i < lowEnd; i++) low += buf[i]!;
          low /= lowEnd;

          let high = 0;
          const h0 = Math.min(24, n);
          const h1 = Math.min(90, n);
          for (let i = h0; i < h1; i++) high += buf[i]!;
          high /= Math.max(1, h1 - h0);

          if (performance.now() < calibUntil) {
            noiseAcc += vol;
            noiseN++;
            noiseRef.current = noiseAcc / Math.max(1, noiseN) + 12;
          }

          const floor = noiseRef.current;
          const blowing = vol > floor + 14 && low > high * 1.35;
          const inten = Math.min(1, Math.max(0, (vol - floor) / 55));

          setIsBlowing(blowing);
          setIntensity((prev) => {
            if (blowing) return Math.min(1, prev * 0.82 + inten * 0.35 + 0.12);
            return Math.max(0, prev * 0.9 - 0.02);
          });

          rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : '无法访问麦克风');
      } finally {
        if (!cancelled) setBusy(false);
      }
    };

    void start();

    return () => {
      cancelled = true;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      void ctx?.close();
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [enabled]);

  return { intensity, isBlowing, error, busy };
}
