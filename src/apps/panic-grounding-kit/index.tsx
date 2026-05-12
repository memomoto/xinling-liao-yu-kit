/**
 * 蓝屏急救包 — 惊恐 / 解离时的柔和「系统修复」意象 + 分步接地引导（运行于 Mac 风格窗口内容区内）。
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { faSongHuaYuanGrow } from '@/lib/zhi_yu_hua_yuan_xin_hao';

function todayISO(): string {
  const d = new Date();
  const z = (n: number) => `${n < 10 ? '0' : ''}${n}`;
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

const FONT_UI =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';
const FONT_MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace';

type Phase = 'intro' | 'run' | 'done';

const STEPS: readonly { hint: string; ms: number }[] = [
  { hint: '看看四周：在心里数出 3 个你能看到的红色物体（没有红色也没关系，换任意颜色）。', ms: 16000 },
  { hint: '捏一下前臂或手背，感受皮肤的温度和阻力——让身体确认「我在这里」。', ms: 12000 },
  { hint: '慢慢吸气，再轻轻呼气。留意鼻尖或胸腔的一点触觉就好，不必评判快慢。', ms: 14000 },
  { hint: '竖起耳朵：你现在能听到几种不同的声音？远处也算，很轻也算。', ms: 15000 },
  { hint: '对自己说一遍：此刻的时间是现在的时刻；这段难关不会永远以同一种强度停留。', ms: 14000 },
  { hint: '若你愿意，把脚掌轻轻踩实地面，感受受力——重力还在托住你。', ms: 12000 },
];

export function PanicGroundingKitApp() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [stepIdx, setStepIdx] = useState(0);
  const mountedRef = useRef(true);
  const gardenRewardRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (phase !== 'done') {
      gardenRewardRef.current = false;
      return;
    }
    if (gardenRewardRef.current) return;
    gardenRewardRef.current = true;
    faSongHuaYuanGrow({ source: 'zhuo_lu_wan_cheng', day: todayISO() });
  }, [phase]);

  useEffect(() => {
    if (phase !== 'run') return;
    const step = STEPS[stepIdx];
    if (!step) {
      setPhase('done');
      return;
    }
    const id = window.setTimeout(() => {
      if (!mountedRef.current) return;
      if (stepIdx >= STEPS.length - 1) setPhase('done');
      else setStepIdx((i) => i + 1);
    }, step.ms);
    return () => window.clearTimeout(id);
  }, [phase, stepIdx]);

  const start = useCallback(() => {
    setStepIdx(0);
    setPhase('run');
  }, []);

  const resetIntro = useCallback(() => {
    setPhase('intro');
    setStepIdx(0);
  }, []);

  const step = phase === 'run' ? STEPS[stepIdx] : null;
  const progressPct =
    phase === 'run' && step ? Math.round(((stepIdx + 1) / STEPS.length) * 100) : 0;

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(165deg, #102a63 0%, #1c4ed8 38%, #1e40af 100%)',
        color: 'rgba(255,255,255,0.94)',
        fontFamily: FONT_UI,
        userSelect: 'none',
      }}
    >
      <style>{`
        @keyframes pgmticker {
          from { transform: scaleX(0); transform-origin: left center; }
          to { transform: scaleX(1); transform-origin: left center; }
        }
      `}</style>

      <div style={{ padding: '14px 18px 10px', flexShrink: 0 }}>
        <div style={{ fontFamily: FONT_MONO, fontSize: 11, opacity: 0.72, letterSpacing: '0.04em' }}>
          SYSTEM_RESTORATION · gentle mode
        </div>
        <h2 style={{ margin: '6px 0 0', fontSize: 17, fontWeight: 600 }}>蓝屏急救包</h2>
        <p style={{ margin: '8px 0 0', fontSize: 12, lineHeight: 1.55, opacity: 0.82, maxWidth: 520 }}>
          仅供情绪自救与陪伴；若你正处在危机中，请联系身边可信的人或当地紧急援助热线。这不是医疗处置界面。
        </p>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: '12px 18px 18px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {phase === 'intro' ? (
          <>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.75, opacity: 0.92 }}>
              如果你感到惊恐、发麻、飘走或「不像在现实里」，可以把它当成一次温和的「系统自检」——跟着文字做就好，不必做得完美。
            </p>
            <button
              type="button"
              onClick={start}
              style={{
                marginTop: 22,
                alignSelf: 'flex-start',
                padding: '11px 22px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.45)',
                background: 'rgba(255,255,255,0.16)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 8px 28px rgba(0,0,0,0.2)',
              }}
            >
              开始修复流程
            </button>
          </>
        ) : null}

        {phase === 'run' && step ? (
          <>
            <div style={{ fontFamily: FONT_MONO, fontSize: 12, opacity: 0.65, marginBottom: 10 }}>
              STEP {stepIdx + 1} / {STEPS.length}
            </div>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.75, fontWeight: 500 }}>{step.hint}</p>
            <div
              style={{
                marginTop: 22,
                height: 4,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.22)',
                overflow: 'hidden',
              }}
            >
              <div
                key={stepIdx}
                style={{
                  height: '100%',
                  width: '100%',
                  background: 'rgba(255,255,255,0.92)',
                  animationName: 'pgmticker',
                  animationDuration: `${step.ms}ms`,
                  animationTimingFunction: 'linear',
                  animationFillMode: 'forwards',
                }}
              />
            </div>
            <div style={{ marginTop: 14, fontSize: 11, opacity: 0.55 }}>
              进度约 {progressPct}% · 每步结束会自动前进；也可随时关窗暂停。
            </div>
            <button
              type="button"
              onClick={() => setPhase('done')}
              style={{
                marginTop: 18,
                alignSelf: 'flex-start',
                padding: '8px 16px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.35)',
                background: 'transparent',
                color: 'rgba(255,255,255,0.88)',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              我好一点了，结束流程
            </button>
          </>
        ) : null}

        {phase === 'done' ? (
          <>
            <p style={{ margin: 0, fontSize: 16, lineHeight: 1.75 }}>
              流程已结束。你已经照顾自己跨过这一轮风浪。可以再慢一点关掉窗口，喝口水，或打开「5-4-3-2-1 着陆箱」重温几步。
            </p>
            <button
              type="button"
              onClick={resetIntro}
              style={{
                marginTop: 20,
                alignSelf: 'flex-start',
                padding: '10px 18px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.45)',
                background: 'rgba(255,255,255,0.14)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              返回封面
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
