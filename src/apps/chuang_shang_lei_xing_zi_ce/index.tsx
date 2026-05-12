/**
 * 创伤类型自测 — 与独立 HTML trauma_type_assessment.html 同源逻辑；持久化键见 jin_du_cun_chu.ts。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './chuang_shang_lei_xing_zi_ce.css';
import {
  computeScores,
  DIM_DISPLAY_ORDER,
  DIM_LABELS,
  DIM_MAX,
  dimDesc,
  QUESTIONS,
  topDimSuggestion,
  type QuizQuestion,
} from './zi_ce_ti_mu';
import type { Dim } from './lei_xing';
import {
  emptyAnswers,
  loadQuizPersist,
  saveQuizPersist,
  type QuizPersist,
} from './jin_du_cun_chu';
import {
  loadQuizAutoAdvancePref,
  saveQuizAutoAdvancePref,
} from '@/lib/wen_juan_zi_dong_qian_jin_pei_zhi';
import { QuizProtectiveHoldRibbon } from '@/components/healing-motifs';
import { getSpeechRecognitionCtor } from '@/apps/healing-interactions/speech';

function speakTraumaQuestion(text: string, note?: string) {
  if (typeof window === 'undefined') return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(note ? `${text}（提示）${note}` : text);
  u.lang = 'zh-CN';
  window.speechSynthesis.speak(u);
}

/** 口述分值：2 / 1 / 0，与题目选项语义对齐（近似匹配） */
function parseTraumaVoice(raw: string): number | null {
  const t = raw.trim().replace(/\s/g, '');
  if (!t) return null;
  if (/不太符合|没有或很少|没有这种感觉|^否|^不是|^没有|很少/.test(t)) return 0;
  if (/偶尔|有时|有一些|有一点/.test(t)) return 1;
  if (/非常符合|是的|经常|符合|^是|^对|^有/.test(t)) return 2;
  return null;
}

const TOTAL = QUESTIONS.length;

function dimQuizBadgeClass(dim: Dim): string {
  const base = 'ttaDimLbl ';
  switch (dim) {
    case 'family':
      return `${base}ttaDimFamily`;
    case 'relation':
      return `${base}ttaDimRelation`;
    default:
      return `${base}ttaDimExternal`;
  }
}

function barExtraClass(dim: Dim): string {
  switch (dim) {
    case 'family':
      return 'ttaBarFamily';
    case 'relation':
      return 'ttaBarRelation';
    default:
      return 'ttaBarExternal';
  }
}

function levelTextClass(dim: Dim): string {
  switch (dim) {
    case 'family':
      return 'ttaDimLvl ttaLvlFamily';
    case 'relation':
      return 'ttaDimLvl ttaLvlRelation';
    default:
      return 'ttaDimLvl ttaLvlExternal';
  }
}

export function TraumaTypeAssessmentApp() {
  const [ready, setReady] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(() => emptyAnswers());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState<'quiz' | 'result'>('quiz');
  const [revealBars, setRevealBars] = useState(false);

  const autoAdvanceRef = useRef(false);
  const answersRef = useRef(answers);
  autoAdvanceRef.current = autoAdvance;
  answersRef.current = answers;
  /** SpeechRecognition 实例（仅 Chrome / Edge 等支持） */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const [voiceErr, setVoiceErr] = useState<string | null>(null);
  const [voiceListening, setVoiceListening] = useState(false);

  useEffect(() => {
    setAutoAdvance(loadQuizAutoAdvancePref());
    const persisted = loadQuizPersist();
    if (persisted) {
      setAnswers(persisted.answers);
      setCurrentIdx(persisted.currentIdx);
      setPhase(persisted.phase);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveQuizPersist({ answers, currentIdx, phase } satisfies QuizPersist);
  }, [answers, currentIdx, phase, ready]);

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop?.();
      } catch {
        /* noop */
      }
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (phase !== 'result') {
      setRevealBars(false);
      return;
    }
    setRevealBars(false);
    const id = window.setTimeout(() => setRevealBars(true), 100);
    return () => window.clearTimeout(id);
  }, [phase]);

  const answeredCount = useMemo(
    () => answers.reduce<number>((acc, a) => acc + (a !== null ? 1 : 0), 0),
    [answers],
  );

  const current: QuizQuestion = QUESTIONS[currentIdx]!;
  const currentAnswer = answers[currentIdx];

  const pickAnswer = useCallback((idx: number, score: number) => {
    const wasEmpty = answersRef.current[idx] === null;
    setAnswers((prev) => {
      const next = [...prev];
      next[idx] = score;
      return next;
    });
    if (!autoAdvanceRef.current || !wasEmpty) return;
    queueMicrotask(() => {
      if (idx >= TOTAL - 1) setPhase('result');
      else setCurrentIdx(idx + 1);
    });
  }, []);

  const goNext = useCallback(() => {
    if (currentAnswer === null) return;
    if (currentIdx >= TOTAL - 1) {
      setPhase('result');
      return;
    }
    setCurrentIdx((i) => i + 1);
  }, [currentAnswer, currentIdx]);

  const goPrev = useCallback(() => {
    setCurrentIdx((i) => (i <= 0 ? 0 : i - 1));
  }, []);

  const restart = useCallback(() => {
    window.speechSynthesis.cancel();
    try {
      recognitionRef.current?.stop?.();
    } catch {
      /* noop */
    }
    recognitionRef.current = null;
    setVoiceListening(false);
    setVoiceErr(null);
    setAnswers(emptyAnswers());
    setCurrentIdx(0);
    setPhase('quiz');
  }, []);

  const speakQuestion = useCallback(() => {
    speakTraumaQuestion(current.text, current.note);
  }, [current]);

  const toggleVoiceListen = useCallback(() => {
    if (voiceListening) {
      try {
        recognitionRef.current?.stop?.();
      } catch {
        /* noop */
      }
      recognitionRef.current = null;
      setVoiceListening(false);
      return;
    }

    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setVoiceErr('当前浏览器不支持语音识别（可试用 Chrome / Edge）。');
      return;
    }

    const idx = currentIdx;
    if (!QUESTIONS[idx]) return;

    setVoiceErr(null);
    try {
      recognitionRef.current?.stop?.();
    } catch {
      /* noop */
    }

    const rec = new Ctor();
    rec.lang = 'zh-CN';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (event: { results: SpeechRecognitionResultList }) => {
      const raw = event.results[0]?.[0]?.transcript ?? '';
      const score = parseTraumaVoice(raw);
      recognitionRef.current = null;
      setVoiceListening(false);
      if (score !== null) {
        pickAnswer(idx, score);
        setVoiceErr(null);
      } else {
        setVoiceErr(`听到了「${raw.trim()}」，试着说「是的」「偶尔」「没有」。`);
      }
    };
    rec.onerror = () => {
      recognitionRef.current = null;
      setVoiceListening(false);
      setVoiceErr('语音识别中断或未授权麦克风。');
    };
    rec.onend = () => {
      setVoiceListening(false);
      recognitionRef.current = null;
    };
    recognitionRef.current = rec;
    try {
      rec.start();
      setVoiceListening(true);
    } catch {
      setVoiceErr('无法启动语音识别。');
      setVoiceListening(false);
    }
  }, [voiceListening, currentIdx, pickAnswer]);

  const resultScores = useMemo(() => computeScores(answers), [answers]);
  const suggestionText = useMemo(() => topDimSuggestion(resultScores), [resultScores]);
  const progPct = Math.round((answeredCount / TOTAL) * 100);

  if (!ready) {
    return <div className="ttaRoot mac-os-scrollbar" aria-busy="true" />;
  }

  return (
    <div className="ttaRoot mac-os-scrollbar">
      <h2 className="ttaHidden">创伤类型自测，通过问答帮助了解自己可能经历的创伤类型</h2>

      <div className="ttaPage">
        <QuizProtectiveHoldRibbon />

        {phase === 'quiz' ? (
          <>
            <div className="ttaProgWrap">
              <div className="ttaProgBg">
                <div className="ttaProgFill" style={{ width: `${progPct}%` }} />
              </div>
              <div className="ttaProgTxt">
                {answeredCount} / {TOTAL}
              </div>
            </div>

            <label className="ttaPrefRow">
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => {
                  const on = e.target.checked;
                  setAutoAdvance(on);
                  saveQuizAutoAdvancePref(on);
                }}
              />
              <span>
                选完本题后自动下一题（可随时改；关闭后请用「下一题」手动前进）
              </span>
            </label>

            <div className="ttaVoicePanel">
              <button type="button" className="ttaVoiceBtn" onClick={speakQuestion}>
                朗读本题（系统语音）
              </button>
              <button
                type="button"
                className={`ttaVoiceBtn${voiceListening ? ' ttaVoiceBtnActive' : ''}`}
                onClick={toggleVoiceListen}
              >
                {voiceListening ? '停止听取' : '口述作答「是的／偶尔／没有」'}
              </button>
              {voiceErr ? <div className="ttaVoiceErr">{voiceErr}</div> : null}
            </div>

            <div>
              <div className={dimQuizBadgeClass(current.dim)}>{DIM_LABELS[current.dim]}</div>
              <div className="ttaQNum">
                问题 {currentIdx + 1} / {TOTAL}
              </div>
              <div className="ttaQText">{current.text}</div>
              {current.note ? <div className="ttaQNote">{current.note}</div> : null}

              <div className="ttaOpts" role="radiogroup" aria-label="本题选项">
                {current.options.map(({ score, label }) => (
                  <button
                    key={score}
                    type="button"
                    role="radio"
                    aria-checked={currentAnswer === score}
                    className={`ttaOpt${currentAnswer === score ? ' ttaOptSel' : ''}`}
                    onClick={() => pickAnswer(currentIdx, score)}
                  >
                    <span className="ttaOptDot" aria-hidden />
                    <span className="ttaOptLabel">{label}</span>
                  </button>
                ))}
              </div>

              <div className="ttaNav">
                <button
                  type="button"
                  className="ttaBtnBack"
                  onClick={goPrev}
                  disabled={currentIdx === 0}
                  style={{ visibility: currentIdx === 0 ? 'hidden' : 'visible' }}
                >
                  上一题
                </button>
                <button type="button" className="ttaBtnNext" disabled={currentAnswer === null} onClick={goNext}>
                  {currentIdx >= TOTAL - 1 ? '查看结果' : '下一题'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="ttaResult">
            <div className="ttaResTitle">你的创伤画像</div>
            <div className="ttaResSub">
              这不是诊断，只是帮助你更了解自己。每一种经历都值得被认真对待。
            </div>

            {DIM_DISPLAY_ORDER.map((dim) => {
              const raw = resultScores[dim];
              const pct = Math.round((raw / DIM_MAX) * 100);
              const widthPct = revealBars ? pct : 0;
              const { label: lvlLabel, text: lvlText } = dimDesc(dim, raw);
              return (
                <div key={dim} className="ttaDimCard">
                  <div className={`${dimQuizBadgeClass(dim)} ttaDimCardLbl`}>{DIM_LABELS[dim]}</div>
                  <div className="ttaBarWrap">
                    <div
                      className={`ttaBarFill ${barExtraClass(dim)}`}
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                  <div className={levelTextClass(dim)}>{lvlLabel}</div>
                  <div className="ttaDimDesc">{lvlText}</div>
                </div>
              );
            })}

            <div className="ttaSuggestBox">
              <div className="ttaSuggestTitle">给你的建议</div>
              <div className="ttaSuggestText">{suggestionText}</div>
            </div>

            <button type="button" className="ttaRestart" onClick={restart}>
              重新测试
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
