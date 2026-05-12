/**
 * 复原力每日练习 — 嵌入桌面的小应用（与同目录外独立 HTML 共享 localStorage 键）。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './tan_xing_lian_xi.css';
import {
  dayHadAnyPractice,
  isoDate,
  loadResilienceStore,
  saveResilienceStore,
  streakCount,
  weekDatesContaining,
  type ResilienceStore,
} from './fu_yuan_li_cun_chu';
import { faSongHuaYuanGrow } from '@/lib/zhi_yu_hua_yuan_xin_hao';
import { ResilienceWeatherWeekSlots } from '@/components/healing-motifs';

const PHASES = [
  { label: '吸气', durationMs: 4000, scale: 1.4 },
  { label: '屏住', durationMs: 7000, scale: 1.4 },
  { label: '呼气', durationMs: 8000, scale: 1.0 },
] as const;

function todayISO(): string {
  return isoDate(new Date());
}

export function ResiliencePracticeApp() {
  const [store, setStore] = useState<ResilienceStore>({ days: {}, drafts: {} });
  const [storeReady, setStoreReady] = useState(false);
  /** 计时中：计时条区域显示 */
  const [timerAreas, setTimerAreas] = useState<Partial<Record<1 | 4, boolean>>>({});
  const [timerLeft, setTimerLeft] = useState<Partial<Record<1 | 4, number>>>({});
  const timerIntervals = useRef<Partial<Record<1 | 4, number>>>({});

  const breathTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const breathRoundRef = useRef(0);
  const breathPhaseRef = useRef(0);

  const [breathGuide, setBreathGuide] = useState(false);
  const [breathRunning, setBreathRunning] = useState(false);
  const [breathCircle, setBreathCircle] = useState({ text: '吸气', scale: 1 });
  const [breathSubtitle, setBreathSubtitle] = useState('准备好了吗？');

  /** 计时器是否在跑（必须用 state，仅靠 ref 不会触发界面更新） */
  const [runningTimerIds, setRunningTimerIds] = useState<{ 1?: boolean; 4?: boolean }>(
    {},
  );

  useEffect(() => {
    setStore(loadResilienceStore());
    setStoreReady(true);
  }, []);

  useEffect(() => {
    if (!storeReady) return;
    saveResilienceStore(store);
  }, [store, storeReady]);

  useEffect(() => {
    return () => {
      (Object.keys(timerIntervals.current) as unknown as (1 | 4)[]).forEach((id) => {
        const iv = timerIntervals.current[id];
        if (iv !== undefined) window.clearInterval(iv);
      });
      if (breathTimeoutRef.current) clearTimeout(breathTimeoutRef.current);
    };
  }, []);

  const dateLabel = useMemo(
    () => new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }),
    [],
  );

  const streak = streakCount(store);
  const td = todayISO();

  const week = useMemo(() => weekDatesContaining(new Date()), []);
  const todayRec = store.days[td] ?? {};

  const setDraft = useCallback((key: string, value: string) => {
    setStore((prev) => ({
      ...prev,
      drafts: { ...prev.drafts, [key]: value },
    }));
  }, []);

  const recordDoneKey = useCallback((key: string) => {
    setStore((prev) => {
      const t = todayISO();
      return {
        ...prev,
        days: {
          ...prev.days,
          [t]: { ...(prev.days[t] ?? {}), [key]: true },
        },
      };
    });
    queueMicrotask(() => {
      faSongHuaYuanGrow({ source: 'fu_yuan_li_wan_cheng', day: isoDate(new Date()) });
    });
  }, []);

  const markCardDone = useCallback(
    (id: number | 'breath') => {
      recordDoneKey(String(id));
    },
    [recordDoneKey],
  );

  const startTimer = useCallback(
    (id: 1 | 4, total: number) => {
      if (timerIntervals.current[id]) return;
      if (todayRec[String(id)]) return;
      setTimerAreas((prev) => ({ ...prev, [id]: true }));
      setTimerLeft((prev) => ({ ...prev, [id]: total }));
      setRunningTimerIds((prev) => ({ ...prev, [id]: true }));
      timerIntervals.current[id] = window.setInterval(() => {
        setTimerLeft((prev) => {
          const cur = prev[id];
          if (cur === undefined) return prev;
          const next = cur - 1;
          if (next <= 0) {
            const iv = timerIntervals.current[id];
            if (iv !== undefined) window.clearInterval(iv);
            delete timerIntervals.current[id];
            setRunningTimerIds((r) => ({ ...r, [id]: false }));
            queueMicrotask(() => markCardDone(id));
            return { ...prev, [id]: 0 };
          }
          return { ...prev, [id]: next };
        });
      }, 1000) as unknown as number;
    },
    [markCardDone, todayRec],
  );

  const cancelBreath = useCallback(() => {
    if (breathTimeoutRef.current) clearTimeout(breathTimeoutRef.current);
    breathTimeoutRef.current = null;
    breathRoundRef.current = 0;
    breathPhaseRef.current = 0;
    setBreathRunning(false);
    setBreathGuide(false);
    setBreathCircle({ text: '吸气', scale: 1 });
    setBreathSubtitle('准备好了吗？');
  }, []);

  const runBreathTick = useCallback(() => {
    if (breathRoundRef.current >= 3) {
      setBreathSubtitle('完成了，感受一下现在的状态');
      setBreathCircle({ text: '', scale: 1 });
      setBreathGuide(false);
      setBreathRunning(false);
      markCardDone('breath');
      breathTimeoutRef.current = null;
      return;
    }
    const pr = PHASES[breathPhaseRef.current];
    if (pr === undefined) return;
    setBreathCircle({ text: pr.label, scale: pr.scale });
    setBreathSubtitle(
      `第 ${breathRoundRef.current + 1} 轮 — ${pr.label} ${pr.durationMs / 1000} 秒`,
    );
    breathTimeoutRef.current = setTimeout(() => {
      breathPhaseRef.current += 1;
      if (breathPhaseRef.current >= PHASES.length) {
        breathPhaseRef.current = 0;
        breathRoundRef.current += 1;
      }
      runBreathTick();
    }, pr.durationMs);
  }, [markCardDone]);

  const toggleBreath = useCallback(() => {
    if (breathRunning) {
      cancelBreath();
      return;
    }
    if (todayRec.breath) return;
    breathRoundRef.current = 0;
    breathPhaseRef.current = 0;
    setBreathRunning(true);
    setBreathGuide(true);
    runBreathTick();
  }, [breathRunning, cancelBreath, runBreathTick, todayRec.breath]);

  const btnClass = useCallback((done: boolean) => `rpDoneBtn ${done ? 'rpDoneBtnDone' : ''}`, []);
  const pct = useCallback(
    (id: 1 | 4, total: number) => {
      const left = timerLeft[id];
      if (left === undefined) return 0;
      return Math.round((1 - left / total) * 100);
    },
    [timerLeft],
  );

  const timerDisplay = useCallback(
    (id: 1 | 4) => {
      const left = timerLeft[id];
      if (left === undefined) return '5:00';
      const m = Math.floor(left / 60);
      const s = left % 60;
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    },
    [timerLeft],
  );

  return (
    <div className="rpRoot mac-os-scrollbar">
      <h2 className="rpHidden">复原力练习，每日卡片与打卡</h2>

      <div className="rpScrollInner fmRpScrollInnerFit">
        <div className="fmRpMotifBleed" aria-hidden role="presentation" />
        <div className="rpHeader">
          <div className="rpHeaderTop">
            <div>
              <div className="rpTodayTitle">今日练习</div>
              <div className="rpDateLabel">{dateLabel}</div>
            </div>
            <div className="rpStreak">
              <span>{streak}</span> 天连续打卡
            </div>
          </div>
          <div>
            <ResilienceWeatherWeekSlots
              slots={week.map((ymd) => ({
                ymd,
                todayISO: td,
                done: dayHadAnyPractice(store, ymd),
              }))}
            />
            <p className="rpWeatherHint">
              心情像一周的<span className="rpWeatherHintStrong">天气预报</span>——晴天、云层、零星小雨都只说明「流经这里」，不是在给你打分。
            </p>
          </div>
        </div>

        <div className="rpSectionTitle">
          今天推荐 <span className="rpTodayBadge">每日一练</span>
        </div>

        <div className={`rpCard rpCardToday${todayRec.breath ? ' rpCardActive' : ''}`}>
          <div className="rpCardHeader">
            <div>
              <div className="rpCardTitle">4-7-8 呼吸法</div>
              <div className="rpCardDesc">
                吸气 4 秒，屏住 7 秒，缓缓呼气 8 秒。重复 3 次，帮助神经系统平静下来。
              </div>
              <div className="rpCardDuration">约 3 分钟</div>
            </div>
            <span className="rpTag rpTagBreath">呼吸</span>
          </div>
          <div className={`rpBreathGuide${breathGuide ? ' rpBreathGuideShow' : ''}`}>
            <div
              className="rpBreathCircle"
              style={{ transform: `scale(${breathCircle.scale})` }}
            >
              {breathCircle.text}
            </div>
            <div className="rpBreathPhase">{breathSubtitle}</div>
          </div>
          <button
            type="button"
            className={btnClass(!!todayRec.breath)}
            disabled={!!todayRec.breath}
            onClick={() => toggleBreath()}
          >
            {todayRec.breath ? (
              <>
                <span className="rpCheck rpCheckDone" /> 完成了
              </>
            ) : breathRunning ? (
              '停止'
            ) : (
              '开始练习'
            )}
          </button>
        </div>

        <div className="rpSectionTitle">全部练习库</div>

        <PracticeTimerCard
          title="身体扫描"
          desc="从脚趾到头顶，逐渐感受每个部位。不评判，只观察。创伤往往藏在身体里，扫描帮你重新连接自己。"
          duration="约 5 分钟"
          tagClass="rpTagBody"
          tagLabel="身体"
          done={!!todayRec['1']}
          areaShow={Boolean(timerAreas[1])}
          pct={pct(1, 300)}
          timerText={timerDisplay(1)}
          onStart={() => startTimer(1, 300)}
          running={!!runningTimerIds[1]}
          btnClass={btnClass}
        />

        <div className={`rpCard${todayRec['2'] ? ' rpCardActive' : ''}`}>
          <div className="rpCardHeader">
            <div>
              <div className="rpCardTitle">今天三件安全的事</div>
              <div className="rpCardDesc">
                写下今天让你感到安全、平静或被善待的三件事，哪怕很微小，比如一杯热茶、窗外的光。
              </div>
              <div className="rpCardDuration">约 5 分钟</div>
            </div>
            <span className="rpTag rpTagReflect">反思</span>
          </div>
          <textarea
            className="rpTa"
            rows={4}
            disabled={!!todayRec['2']}
            placeholder="1. &#10;2. &#10;3. "
            value={store.drafts['safe-things'] ?? ''}
            onChange={(e) => setDraft('safe-things', e.target.value)}
          />
          <button
            type="button"
            className={btnClass(!!todayRec['2'])}
            disabled={!!todayRec['2']}
            onClick={() => markCardDone(2)}
          >
            {todayRec['2'] ? (
              <>
                <span className="rpCheck rpCheckDone" /> 完成了
              </>
            ) : (
              '完成'
            )}
          </button>
        </div>

        <div className={`rpCard${todayRec['3'] ? ' rpCardActive' : ''}`}>
          <div className="rpCardHeader">
            <div>
              <div className="rpCardTitle">给自己写一句温柔的话</div>
              <div className="rpCardDesc">
                如果你最好的朋友正在经历你现在的处境，你会对她说什么？把那句话写给自己。
              </div>
              <div className="rpCardDuration">约 3 分钟</div>
            </div>
            <span className="rpTag rpTagWrite">书写</span>
          </div>
          <textarea
            className="rpTa"
            rows={3}
            disabled={!!todayRec['3']}
            placeholder="你今天已经很不容易了..."
            value={store.drafts['kind-word'] ?? ''}
            onChange={(e) => setDraft('kind-word', e.target.value)}
          />
          <button
            type="button"
            className={btnClass(!!todayRec['3'])}
            disabled={!!todayRec['3']}
            onClick={() => markCardDone(3)}
          >
            {todayRec['3'] ? (
              <>
                <span className="rpCheck rpCheckDone" /> 完成了
              </>
            ) : (
              '完成'
            )}
          </button>
        </div>

        <PracticeTimerCard
          title="舒适姿势停留"
          desc="找一个让你感觉最安全的姿势，可以蜷缩、可以躺下。用计时器停留 5 分钟，不必做任何事。"
          duration="约 5 分钟"
          tagClass="rpTagBody"
          tagLabel="身体"
          done={!!todayRec['4']}
          areaShow={Boolean(timerAreas[4])}
          pct={pct(4, 300)}
          timerText={timerDisplay(4)}
          onStart={() => startTimer(4, 300)}
          running={!!runningTimerIds[4]}
          btnClass={btnClass}
        />

        <div className={`rpCard${todayRec['5'] ? ' rpCardActive' : ''}`}>
          <div className="rpCardHeader">
            <div>
              <div className="rpCardTitle">今天有没有被善待？</div>
              <div className="rpCardDesc">
                回想今天有没有一个瞬间，你感到自己被尊重或被善待了——来自陌生人也算。
              </div>
              <div className="rpCardDuration">约 3 分钟</div>
            </div>
            <span className="rpTag rpTagReflect">反思</span>
          </div>
          <textarea
            className="rpTa"
            rows={3}
            disabled={!!todayRec['5']}
            placeholder="今天..."
            value={store.drafts.cared ?? ''}
            onChange={(e) => setDraft('cared', e.target.value)}
          />
          <button
            type="button"
            className={btnClass(!!todayRec['5'])}
            disabled={!!todayRec['5']}
            onClick={() => markCardDone(5)}
          >
            {todayRec['5'] ? (
              <>
                <span className="rpCheck rpCheckDone" /> 完成了
              </>
            ) : (
              '完成'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function PracticeTimerCard({
  title,
  desc,
  duration,
  tagClass,
  tagLabel,
  done,
  areaShow,
  pct,
  timerText,
  onStart,
  running,
  btnClass,
}: {
  title: string;
  desc: string;
  duration: string;
  tagClass: string;
  tagLabel: string;
  done: boolean;
  areaShow: boolean;
  pct: number;
  timerText: string;
  onStart: () => void;
  running: boolean;
  btnClass: (done: boolean) => string;
}) {
  return (
    <div className={`rpCard${done ? ' rpCardActive' : ''}`}>
      <div className="rpCardHeader">
        <div>
          <div className="rpCardTitle">{title}</div>
          <div className="rpCardDesc">{desc}</div>
          <div className="rpCardDuration">{duration}</div>
        </div>
        <span className={`rpTag ${tagClass}`}>{tagLabel}</span>
      </div>
      <div className={`rpTimerArea${areaShow ? ' rpTimerAreaShow' : ''}`}>
        <div className="rpTimerBarWrap">
          <div className="rpTimerBar" style={{ width: `${pct}%` }} />
        </div>
        <div className="rpTimerTxt">{timerText}</div>
      </div>
      <button
        type="button"
        className={btnClass(done)}
        disabled={done || running}
        onClick={onStart}
      >
        {done ? (
          <>
            <span className="rpCheck rpCheckDone" /> 完成了
          </>
        ) : running ? (
          '计时中…'
        ) : (
          '开始计时'
        )}
      </button>
    </div>
  );
}
