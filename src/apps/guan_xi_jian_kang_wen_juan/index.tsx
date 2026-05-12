/**
 * 关系健康问卷 — 与同目录独立 HTML 逻辑一致；localStorage 键见 jin_du_cun_chu.ts。
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './guan_xi_jian_kang_wen_juan.css';
import {
  buildSuggestions,
  computeScores,
  DIM_DISPLAY_ORDER,
  DIM_LABELS,
  getLevel,
  INSIGHTS,
  OVERALL_BAND_COPY,
  overallBand,
  QUESTIONS,
  SCORE_OPTIONS,
  type OverallBand,
} from './wen_juan_shu_ju';
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

const TOTAL = QUESTIONS.length;

function dimBadgeClass(dim: Dim): string {
  const base = 'rhqDimBadge ';
  switch (dim) {
    case 'respect':
      return base + 'rhqDimRespect';
    case 'boundary':
      return base + 'rhqDimBoundary';
    case 'give':
      return base + 'rhqDimGive';
    default:
      return base + 'rhqDimSelf';
  }
}

function barExtraClass(dim: Dim): string {
  switch (dim) {
    case 'respect':
      return 'rhqBarRespect';
    case 'boundary':
      return 'rhqBarBoundary';
    case 'give':
      return 'rhqBarGive';
    default:
      return 'rhqBarSelf';
  }
}

function overallPanelClass(band: OverallBand): string {
  switch (band) {
    case 'healthy':
      return 'rhqOverallBand rhqBandHealthy';
    case 'caution':
      return 'rhqOverallBand rhqBandCaution';
    default:
      return 'rhqOverallBand rhqBandConcern';
  }
}

export function RelationshipHealthQuizApp() {
  const [ready, setReady] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [sliderSheet, setSliderSheet] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(() => emptyAnswers());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [phase, setPhase] = useState<'quiz' | 'result'>('quiz');
  const [revealBars, setRevealBars] = useState(false);

  const autoAdvanceRef = useRef(false);
  const answersRef = useRef(answers);
  autoAdvanceRef.current = autoAdvance;
  answersRef.current = answers;

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
    const p: QuizPersist = {
      answers,
      currentIdx,
      phase,
    };
    saveQuizPersist(p);
  }, [answers, currentIdx, phase, ready]);

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
    () =>
      answers.reduce<number>((acc, a) => acc + (a !== null ? 1 : 0), 0),
    [answers],
  );

  const current = QUESTIONS[currentIdx]!;
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
    const fresh = emptyAnswers();
    setAnswers(fresh);
    setCurrentIdx(0);
    setPhase('quiz');
  }, []);

  const resultScores = useMemo(() => computeScores(answers), [answers]);
  const totalScore = useMemo(() => DIM_DISPLAY_ORDER.reduce((s, d) => s + resultScores[d], 0), [resultScores]);
  const band = useMemo(() => overallBand(totalScore), [totalScore]);
  const suggestions = useMemo(() => buildSuggestions(resultScores), [resultScores]);

  const progPct = Math.round((answeredCount / TOTAL) * 100);

  if (!ready) {
    return <div className="rhqRoot mac-os-scrollbar" aria-busy="true" />;
  }

  return (
    <div className="rhqRoot mac-os-scrollbar">
      <h2 className="rhqHidden">关系健康问卷，帮助了解自己在亲密关系中的模式</h2>

      <div className="rhqPage">
        <QuizProtectiveHoldRibbon />

        {phase === 'quiz' ? (
          <>
            <div className="rhqProgWrap">
              <div className="rhqProgBg">
                <div className="rhqProgFill" style={{ width: `${progPct}%` }} />
              </div>
              <div className="rhqProgTxt">
                {answeredCount} / {TOTAL}
              </div>
            </div>

            <label className="rhqPrefRow">
              <input
                type="checkbox"
                checked={sliderSheet}
                onChange={(e) => setSliderSheet(e.target.checked)}
              />
              <span>一页滑条作答（整页拖动刻度，少翻页；可随时切回逐题）</span>
            </label>

            {!sliderSheet ? (
            <label className="rhqPrefRow">
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
            ) : null}

            {!sliderSheet ? (
            <div>
              <div className={dimBadgeClass(current.dim)}>{DIM_LABELS[current.dim]}</div>
              <div className="rhqQNum">
                问题 {currentIdx + 1} / {TOTAL}
              </div>
              <div className="rhqQText">{current.text}</div>

              <div className="rhqOpts" role="radiogroup" aria-label="本题选项">
                {SCORE_OPTIONS.map(({ score, label }) => (
                  <button
                    key={score}
                    type="button"
                    role="radio"
                    aria-checked={currentAnswer === score}
                    className={`rhqOpt${currentAnswer === score ? ' rhqOptSelected' : ''}`}
                    onClick={() => pickAnswer(currentIdx, score)}
                  >
                    <span className="rhqOptDot" aria-hidden />
                    <span className="rhqOptLabel">{label}</span>
                  </button>
                ))}
              </div>

              <div className="rhqNav">
                <button
                  type="button"
                  className="rhqBtnBack"
                  onClick={goPrev}
                  disabled={currentIdx === 0}
                  style={{ visibility: currentIdx === 0 ? 'hidden' : 'visible' }}
                >
                  上一题
                </button>
                <button
                  type="button"
                  className="rhqBtnNext"
                  disabled={currentAnswer === null}
                  onClick={goNext}
                >
                  {currentIdx >= TOTAL - 1 ? '查看报告' : '下一题'}
                </button>
              </div>
            </div>
            ) : (
              <>
                <div className="rhqSliderSheet mac-os-scrollbar">
                  {QUESTIONS.map((q, i) => {
                    const v = answers[i];
                    const sliderVal = v ?? 1;
                    const label =
                      v !== null
                        ? (SCORE_OPTIONS.find((o) => o.score === v)?.label ?? '')
                        : '请拖动确认';
                    return (
                      <div key={i} className={`rhqSliderBlock${v !== null ? ' rhqSliderBlockDone' : ''}`}>
                        <span className={dimBadgeClass(q.dim)}>{DIM_LABELS[q.dim]}</span>
                        <div className="rhqSliderMeta">
                          题目 {i + 1} / {TOTAL}
                        </div>
                        <div className="rhqSliderQ">{q.text}</div>
                        <div className="rhqSliderRow">
                          <span className="rhqSliderEnd" aria-hidden>
                            很少
                          </span>
                          <input
                            type="range"
                            min={0}
                            max={3}
                            step={1}
                            value={sliderVal}
                            aria-valuetext={label}
                            onChange={(e) => {
                              const score = Number(e.target.value);
                              setAnswers((prev) => {
                                const next = [...prev];
                                next[i] = score;
                                return next;
                              });
                            }}
                            className="rhqSliderInput"
                          />
                          <span className="rhqSliderEnd" aria-hidden>
                            总是
                          </span>
                        </div>
                        <div className="rhqSliderCur">{label}</div>
                      </div>
                    );
                  })}
                </div>
                <button
                  type="button"
                  className="rhqSliderSubmit"
                  disabled={answeredCount < TOTAL}
                  onClick={() => setPhase('result')}
                >
                  查看报告 {answeredCount < TOTAL ? `（还差 ${TOTAL - answeredCount} 题）` : ''}
                </button>
              </>
            )}
          </>
        ) : (
          <div className="rhqResult">
            <div className="rhqResTitle">你的关系健康报告</div>
            <div className="rhqResSub">
              这份报告帮你看清这段关系里的模式，不是评判，而是认识自己的起点。
            </div>

            <div className={overallPanelClass(band)}>
              <div className="rhqBandTitle">{OVERALL_BAND_COPY[band].title}</div>
              <div className="rhqBandDesc">{OVERALL_BAND_COPY[band].desc}</div>
            </div>

            <div className="rhqDimGrid">
              {DIM_DISPLAY_ORDER.map((dim) => {
                const s = resultScores[dim];
                const pct = Math.round((s / 12) * 100);
                const widthPct = revealBars ? pct : 0;
                return (
                  <div key={dim} className="rhqDimCard">
                    <div className="rhqDimCardTop">
                      <span className="rhqDimCardTitle">{DIM_LABELS[dim]}</span>
                      <span className="rhqDimScoreLabel">
                        {s} / 12
                      </span>
                    </div>
                    <div className="rhqBarWrap">
                      <div
                        className={`rhqBarFill ${barExtraClass(dim)}`}
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>
                    <div className="rhqDimInsight">{INSIGHTS[dim][getLevel(s)]}</div>
                  </div>
                );
              })}
            </div>

            <div className="rhqSuggestBox">
              <div className="rhqSuggestTitle">给你的建议</div>
              {suggestions.map((t, i) => (
                <div key={i} className="rhqSuggestItem">
                  {t}
                </div>
              ))}
            </div>

            <button type="button" className="rhqRestartBtn" onClick={restart}>
              重新测试
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
