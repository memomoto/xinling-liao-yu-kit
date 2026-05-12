/**
 * 自愈档案 — 密钥校验与打字机叙事（无小游戏）。
 *
 * 第 1–6 章：原开机叙事「从孤岛到星光」。
 * 第 7–12 章：恢复与边界篇（正文由使用者撰写）。
 *
 * 治愈类互动见独立应用「治愈互动」。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ISLAND_INTRO_CHAPTERS, ISLAND_INTRO_DISCLAIMER } from '@/config/gu_dao_dao_xing_guang_copy';
import { faSongHuaYuanGrow } from '@/lib/zhi_yu_hua_yuan_xin_hao';

function journalTodayISO(): string {
  const d = new Date();
  const z = (n: number) => `${n < 10 ? '0' : ''}${n}`;
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

const ACCESS_SECRET = 'loveme';

const SERIF =
  '"Songti SC", "Source Han Serif SC", SimSun, Georgia, "Times New Roman", serif';

const SAN_UI =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';

const CHAPTERS: { title: string; body: string }[] = [
  ...ISLAND_INTRO_CHAPTERS.map(({ title, body }) => ({ title, body })),
  {
    title: '第七章：习惯了复杂的「小脑袋」',
    body:
      '我那习惯了复杂的「小脑袋」。在恢复创伤的过程中，最难过的是我发现自己很难放下戒备。由于长期的创伤，我的大脑习惯性地处理极其复杂的事情。从小开始，我要面临的就不只是简单的事，而是父母间的争吵、学校里的孤立。没人告诉我为什么会被孤立，我只能习惯性地去猜测、怀疑和恐惧未知，即便遍体鳞伤，在那种环境下我也根本无法停下脚步。',
  },
  {
    title: '第八章：「第六感」是双刃剑',
    body:
      '这种习惯延续到了我成年后的相处中。面对伴侣简单的玩笑，我可能会有激烈的反应，或者因为想得太多而导致感情受损。但我庆幸的是，长期的行为分析让我拥有了比别人更强的恢复力、抗压能力和独特的「第六感」。我学会了提取对我有利的部分，丢掉那些消耗我的偏执。',
  },
  {
    title: '第九章：我终于拥有的「离开权」',
    body:
      '我学会了相信：现在的我是安全的。小时候我无法逃离父母或学校，因为我没有生存能力。但现在作为成年人，我有资格离开任何一段让我不适的关系。如果对方无法改变，我离开就好，不需要想太多去处理那些不该由我负责的事。我开始时刻感受自己的内心，先问问自己：「这是我想要的吗？我的心觉得温暖吗？」',
  },
  {
    title: '第十章：我选择与自己相处',
    body:
      '我发现，当我为了结果不断自我批判、施加压力时，我的心就会枯萎。如果我感到交流让我伤心、甚至每天回去都会掉眼泪，我会选择停止和人交流。我学会了和自己对话，搞清楚心灵为什么受损。在能量恢复之前，我不急于和外界建立连接。我也学会了不再随便诉说创伤，保护好自己，避免遭到无意的二次伤害。',
  },
  {
    title: '第十一章：放下掌控他人的执念',
    body:
      '我曾有一个非比寻常的信念，觉得只要父母停止争吵，我就能得到幸福。但我现在意识到那是错误的，每个人的行为都该由自己掌控。那是父母的课题，不是我的。我停止了这种消耗自己的方式，转而拥抱我那些所谓的「缺点」。',
  },
  {
    title: '第十二章：给心里的花施肥',
    body:
      '我不再排斥负面情绪，因为每一种情绪都是我生命中绽放的花朵。如果不给这些花朵水分，我心灵深处就会枯萎。当我学会接纳并拥抱自己的不完美，我发现处理事情变得更加理性。这些经历是我生存中产生的真实想法，我写下来，是希望能救赎曾经那个无助的自己。',
  },
];

function useChapterTypewriter(chapterIndex: number, running: boolean, msPerChar = 19) {
  const full = useMemo(() => {
    const ch = CHAPTERS[chapterIndex];
    if (!ch) return '';
    return `${ch.title}\n\n${ch.body}`;
  }, [chapterIndex]);

  const [shown, setShown] = useState('');

  useEffect(() => {
    if (!running || !full) {
      setShown('');
      return;
    }

    let i = 0;
    setShown('');
    const id = window.setInterval(() => {
      i += 1;
      setShown(full.slice(0, i));
      if (i >= full.length) window.clearInterval(id);
    }, msPerChar);

    return () => window.clearInterval(id);
  }, [full, running, msPerChar]);

  return { shown, complete: shown.length > 0 && shown.length === full.length, full };
}

function PasswordGate({
  onUnlock,
}: {
  onUnlock: () => void;
}) {
  const [value, setValue] = useState('');
  const [err, setErr] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const submit = useCallback(() => {
    if (value.trim() === ACCESS_SECRET) {
      setErr(false);
      onUnlock();
      return;
    }
    setErr(true);
    setValue('');
    inputRef.current?.focus();
  }, [value, onUnlock]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        background: 'rgba(14, 18, 28, 0.42)',
        backdropFilter: 'blur(18px) saturate(140%)',
        WebkitBackdropFilter: 'blur(18px) saturate(140%)',
        zIndex: 5,
      }}
    >
      <div
        role="dialog"
        aria-modal
        aria-labelledby="hj-pw-label"
        style={{
          width: 'min(380px, 100%)',
          borderRadius: 12,
          padding: '22px 22px 18px',
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.65)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.04)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p
          id="hj-pw-label"
          style={{
            margin: '0 0 14px',
            fontSize: 13,
            fontWeight: 600,
            color: 'rgba(30,30,34,0.88)',
            letterSpacing: '0.02em',
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
          }}
        >
          请输入访问密钥以读取档案。
        </p>
        <input
          ref={inputRef}
          type="password"
          autoComplete="off"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (err) setErr(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          placeholder="访问密钥"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '10px 12px',
            fontSize: 14,
            borderRadius: 8,
            border: err ? '1px solid rgba(220,80,80,0.55)' : '1px solid rgba(0,0,0,0.12)',
            outline: 'none',
            background: 'rgba(255,255,255,0.95)',
            marginBottom: 10,
          }}
        />
        {err ? (
          <p style={{ margin: '0 0 10px', fontSize: 12, color: 'rgba(180,55,55,0.95)' }}>密钥不正确。</p>
        ) : (
          <div style={{ height: 22, marginBottom: 8 }} />
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            type="button"
            onClick={submit}
            style={{
              padding: '8px 18px',
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              color: '#fff',
              background: 'linear-gradient(180deg, #4c8dff 0%, #3478ee 100%)',
              boxShadow: '0 1px 0 rgba(255,255,255,0.25) inset, 0 8px 18px rgba(52,120,238,0.28)',
            }}
          >
            解锁档案
          </button>
        </div>
      </div>
    </div>
  );
}

export function HealingJournalApp() {
  const [unlocked, setUnlocked] = useState(false);
  const [chapterIndex, setChapterIndex] = useState(0);

  const { shown, complete, full } = useChapterTypewriter(chapterIndex, unlocked);

  const atEnd = unlocked && chapterIndex >= CHAPTERS.length - 1 && complete;

  return (
    <div
      style={{
        position: 'relative',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(165deg, rgba(28,32,44,0.92) 0%, rgba(18,22,34,0.94) 55%, rgba(22,26,38,0.96) 100%)',
        overflow: 'hidden',
      }}
    >
      {!unlocked ? <PasswordGate onUnlock={() => setUnlocked(true)} /> : null}

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          padding: '22px 26px 28px',
          position: 'relative',
          backdropFilter: unlocked ? 'blur(16px) saturate(125%)' : undefined,
          WebkitBackdropFilter: unlocked ? 'blur(16px) saturate(125%)' : undefined,
        }}
      >
        {unlocked ? (
          <>
            <header style={{ marginBottom: 18 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 17,
                  fontWeight: 600,
                  color: 'rgba(245, 240, 228, 0.94)',
                  letterSpacing: '0.06em',
                  fontFamily: SERIF,
                }}
              >
                我的自愈档案
              </h1>
              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: 12,
                  color: 'rgba(210, 206, 196, 0.55)',
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif',
                }}
              >
                My Healing Journal · 仅你可见的章节
              </p>
              <p
                style={{
                  margin: '14px 0 0',
                  fontSize: 11,
                  lineHeight: 1.65,
                  color: 'rgba(195, 190, 178, 0.72)',
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif',
                }}
              >
                {ISLAND_INTRO_DISCLAIMER}
              </p>
            </header>

            <article
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: SERIF,
                fontSize: 15,
                lineHeight: 1.78,
                color: 'rgba(242, 236, 224, 0.92)',
                textShadow: '0 1px 18px rgba(0,0,0,0.35)',
                userSelect: 'text',
                minHeight: 120,
              }}
            >
              {shown}
              {unlocked && shown.length < full.length ? (
                <span
                  aria-hidden
                  style={{
                    display: 'inline-block',
                    width: 2,
                    height: '1.1em',
                    marginLeft: 2,
                    verticalAlign: 'text-bottom',
                    background: 'rgba(245, 240, 228, 0.65)',
                    animation: 'hjCaret 0.95s steps(1) infinite',
                  }}
                />
              ) : null}
            </article>

            <style>{`
              @keyframes hjCaret {
                50% { opacity: 0; }
              }
              @keyframes hjGlowPulse {
                0%, 100% { box-shadow: 0 0 14px rgba(255, 248, 220, 0.22), 0 0 28px rgba(180, 210, 255, 0.12); }
                50% { box-shadow: 0 0 22px rgba(255, 248, 220, 0.38), 0 0 42px rgba(180, 210, 255, 0.22); }
              }
            `}</style>

            <div style={{ marginTop: 22, minHeight: 44 }}>
              {atEnd ? (
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: 'rgba(215, 208, 192, 0.62)',
                    fontFamily: SERIF,
                    fontStyle: 'italic',
                  }}
                >
                  —— 读到这里，不妨停留片刻，抱抱当时的自己。
                </p>
              ) : null}
              {complete && !atEnd ? (
                <button
                  type="button"
                  onClick={() => {
                    setChapterIndex((i) => Math.min(i + 1, CHAPTERS.length - 1));
                    faSongHuaYuanGrow({ source: 'zi_yu_dang_an_jin_du', day: journalTodayISO() });
                  }}
                  style={{
                    padding: '10px 22px',
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    borderRadius: 999,
                    border: '1px solid rgba(255, 248, 230, 0.35)',
                    cursor: 'pointer',
                    color: 'rgba(252, 246, 232, 0.95)',
                    background: 'rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(10px)',
                    animation: 'hjGlowPulse 2.8s ease-in-out infinite',
                    fontFamily: SAN_UI,
                  }}
                >
                  读取下一章
                </button>
              ) : null}
            </div>
          </>
        ) : (
          <div aria-hidden style={{ opacity: 0.35, fontFamily: SERIF, fontSize: 13, color: 'rgba(230,224,210,0.7)' }}>
            ……
          </div>
        )}
      </div>
    </div>
  );
}
