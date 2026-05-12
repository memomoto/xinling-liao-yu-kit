/**
 * 5-4-3-2-1 感官着陆（Grounding）。
 * 圆点符号为占位；贴图请在 `mei_shu_zhan_wei.ts` → `GROUNDING_ASSET_REPLACE` 填路径替换。
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import './zhuo_lu_ji_jiu_xiang.css';
import { GROUNDING_ASSET_REPLACE } from './mei_shu_zhan_wei';
import { CrisisSafeHarbourHeader } from '@/components/healing-motifs';
import { faSongHuaYuanGrow } from '@/lib/zhi_yu_hua_yuan_xin_hao';

function todayISO(): string {
  const d = new Date();
  const z = (n: number) => `${n < 10 ? '0' : ''}${n}`;
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

type Phase = 'intro' | 'exercise' | 'done';

const STEPS = [
  {
    n: 5,
    title: '5 件你能看到的事物',
    lead: '慢慢转动视线——颜色、光影、小细节都可以。把注意力放在外部环境上。',
    hint: '请逐行列出，至少写满 5 条。',
    areaPh: '例：白墙上的小斑点\n桌面上反射的光',
  },
  {
    n: 4,
    title: '4 件你能摸到的事物',
    lead: '注意质地、温度和压力——衣角、扶手、手背都可以。',
    hint: '请逐行列出，至少写满 4 条。',
    areaPh: '例：布料的触感\n指腹下的温度',
  },
  {
    n: 3,
    title: '3 种你能听到的声音',
    lead: '远或近都行：鸟鸣、低频电器声、远处的车声——不评判好坏，只是辨认。',
    hint: '请逐行列出，至少写满 3 条。',
    areaPh: '例：空调的风声\n窗外隐约的人声',
  },
  {
    n: 2,
    title: '2 种你能闻到的气味',
    lead: '若气味很淡，也可以写环境里淡淡的味道或「新鲜空气」。',
    hint: '请逐行列出，至少写满 2 条。',
    areaPh: '例：洗衣液残留\n清茶',
  },
  {
    n: 1,
    title: '1 件你现在能尝到或感受到的味道',
    lead: '口腔里淡淡的水味、茶香、涩感都算，让身体再次变得具体。',
    hint: '写出至少 1 条。',
    areaPh: '例：口里的一点涩\n清水',
  },
] as const;

function countBullets(raw: string): number {
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean).length;
}

export function GroundingToolkitApp() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [stepIdx, setStepIdx] = useState(0);
  const [texts, setTexts] = useState<string[]>(() => STEPS.map(() => ''));
  const gardenRewardRef = useRef(false);

  useEffect(() => {
    if (phase !== 'done') {
      gardenRewardRef.current = false;
      return;
    }
    if (gardenRewardRef.current) return;
    gardenRewardRef.current = true;
    faSongHuaYuanGrow({ source: 'zhuo_lu_wan_cheng', day: todayISO() });
  }, [phase]);

  const cur = STEPS[stepIdx]!;
  const curText = texts[stepIdx] ?? '';
  const curCount = countBullets(curText);
  const canNext = curCount >= cur.n;

  const setCurText = useCallback(
    (v: string) => {
      setTexts((prev) => {
        const next = [...prev];
        next[stepIdx] = v;
        return next;
      });
    },
    [stepIdx],
  );

  const decorUrl = GROUNDING_ASSET_REPLACE.cornerDecor;
  const noiseUrl = GROUNDING_ASSET_REPLACE.stepBgNoise;

  const startExercise = () => {
    setPhase('exercise');
    setStepIdx(0);
    setTexts(STEPS.map(() => ''));
  };

  const goNextStep = () => {
    if (!canNext) return;
    if (stepIdx >= STEPS.length - 1) setPhase('done');
    else setStepIdx((i) => i + 1);
  };

  const goPrevStep = () => {
    if (stepIdx <= 0) setPhase('intro');
    else setStepIdx((i) => i - 1);
  };

  const areaId = `grounding-area-${stepIdx}`;

  return (
    <div
      className="gtRoot mac-os-scrollbar"
      style={
        noiseUrl
          ? {
              backgroundImage: `linear-gradient(rgba(245,249,248,0.92),rgba(245,249,248,0.92)), url(${noiseUrl})`,
              backgroundSize: 'auto',
            }
          : undefined
      }
    >
      <CrisisSafeHarbourHeader />

      <div className="gtSymbolRow" aria-hidden="true">
        {decorUrl ? (
          <img src={decorUrl} alt="" width={42} height={42} />
        ) : (
          <>
            {[5, 4, 3, 2, 1].map((num) => (
              <span key={num} className="gtSymbolBadge">
                {num}
              </span>
            ))}
          </>
        )}
      </div>

      {!decorUrl ? (
        <p className="gtReplaceHint">
          占位：上方数字圆点仅为临时符号。若你有水彩风小插画，请放到 public 并把
          mei_shu_zhan_wei.ts 里的 GROUNDING_ASSET_REPLACE.cornerDecor 设为图片路径；
          stepBgNoise 可放极低对比的纸张肌理（可不填）。
        </p>
      ) : null}

      <div className="gtCard">
        {phase === 'intro' ? (
          <>
            <div className="gtEyebrow">Grounding · 感官着陆</div>
            <h1 className="gtTitle">5-4-3-2-1 着陆急救箱</h1>
            <p className="gtLead">
              当你感到恐慌、头脑发懵或像在飘走时，可以用这个方法把注意力轻轻拉回周围环境。
              没有对错，慢一点也没关系。
            </p>
            <p className="gtMuted">
              依次留意：看见的、摸到的、听到的、闻到的，以及口里的一点味道。随时可以停在某一步深呼吸。
            </p>
            <div className="gtNav">
              <button type="button" className="gtBtnPrimary" onClick={startExercise}>
                开始着陆练习
              </button>
            </div>
          </>
        ) : null}

        {phase === 'exercise' ? (
          <>
            <div className="gtEyebrow">
              第 {stepIdx + 1} / {STEPS.length} 步
            </div>
            <h2 className="gtTitle">{cur.title}</h2>
            <p className="gtLead">{cur.lead}</p>
            <label className="gtLabel" htmlFor={areaId}>
              {cur.hint}
            </label>
            <textarea
              id={areaId}
              className="gtArea"
              value={curText}
              onChange={(e) => setCurText(e.target.value)}
              placeholder={cur.areaPh}
              spellCheck={false}
              autoComplete="off"
            />
            <div className="gtHintBelow">
              {curCount >= cur.n
                ? '可以前进到下一步了。'
                : `已记下 ${curCount} 条，还差 ${cur.n - curCount} 条。`}
            </div>
            <div className="gtNav">
              <button type="button" className="gtBtnGhost" onClick={goPrevStep}>
                {stepIdx === 0 ? '返回说明' : '上一步'}
              </button>
              <button type="button" className="gtBtnPrimary" disabled={!canNext} onClick={goNextStep}>
                {stepIdx >= STEPS.length - 1 ? '完成这一圈' : '下一步'}
              </button>
            </div>
          </>
        ) : null}

        {phase === 'done' ? (
          <>
            <div className="gtEyebrow">完成这一轮</div>
            <h2 className="gtTitle">你做得很好</h2>
            <p className="gtLead">
              把注意力带回了身体和周围。
              {' '}
              可以再慢慢呼吸几次，让肩颈、下颌也轻轻放松一下。
            </p>
            <div className="gtNav">
              <button type="button" className="gtBtnPrimary" onClick={startExercise}>
                再做一轮
              </button>
              <button type="button" className="gtBtnGhost" onClick={() => setPhase('intro')}>
                回到开场说明
              </button>
            </div>
          </>
        ) : null}

        <p className="gtEmergency">
          若正处于强烈危机或有伤害自己的冲动，请先联系身边人、心理危机热线或急救服务——此工具不能替代专业救助。
        </p>
      </div>

      {phase === 'exercise' ? (
        <div className="gtProgressDots">
          {STEPS.map((_, i) => (
            <span key={i} className={`gtDot${i === stepIdx ? ' gtDotOn' : ''}`} aria-hidden />
          ))}
        </div>
      ) : null}
    </div>
  );
}
