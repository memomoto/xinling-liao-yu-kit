/**
 * 姐妹谈心 — 小窗口内手机框布局；选项在手机屏区域滚动；支持放大阅读子层。
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

const FONT = '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif';
const WINDOW_TITLE_FONT = FONT;
const STORAGE_KEY = 'hk:relationshipRadarDraft';

const PHONE_SKIN_SRC = '/assets/apps/sisters-phone-skin.png';

const PHONE_LCD = {
  left: '18%',
  top: '31%',
  width: '64%',
  height: '46%',
} as const;

const REFLECTION_PROMPTS = [
  '这一刻你心里是什么感受？',
  '你有没有听见自己心里很轻的一声？',
  '这跟 TA 的节奏、与你的边界相比，你觉得安顿吗？',
  '这件事对你的心情或身体有影响吗？',
  '你会不会因为这个瞬间觉得生活还是有点甜的？',
  '你会不会觉得自己有被认真对待、被爱？',
  '它有没有帮你少一点赌气式的花钱或暴食？',
  '这一刻你有没有多一点爱惜自己的感觉？',
] as const;

const REASON_OPTIONS: { key: string; label: string }[] = [
  { key: 'look', label: '脸好看 / 气质对味，第一眼就上头' },
  { key: 'gifts', label: '舍得给你花钱、会准备小惊喜' },
  { key: 'shared', label: '一起经历过事儿，聊到一块去' },
  { key: 'humor', label: '幽默感在线，待着不尴不尬' },
  { key: 'care', label: '会惦记你，小细节挺到位' },
  { key: 'money', label: '工作稳定、对经济有规划（俗气但实在）' },
  { key: 'safe', label: '待一块儿心里踏实，像有个靠得住的人' },
];

const FEEL_OPTIONS: { value: string; label: string }[] = [
  { value: 'ease', label: '大部分时候挺松弛，能说人话做自己' },
  { value: 'supported', label: '感觉有人站我这边，会认真听我讲' },
  { value: 'unsure', label: '时而好时而迷，说不上来哪种占上风' },
  { value: 'tense', label: '总得端着，怕一说错就收不了场' },
  { value: 'anxious', label: '老在猜他心思，特别怕凉凉' },
];

type TimelineField = 'metDate' | 'hungryText' | 'thirstyText' | 'intimateRespectText';

const TIMELINE_META: {
  field: TimelineField;
  title: string;
  lead: string;
  placeholder: string;
  kind: 'month' | 'textarea';
}[] = [
  {
    field: 'metDate',
    title: '先锚个时间',
    lead: '大概啥时候认识 / 开始留意 TA？',
    placeholder: '',
    kind: 'month',
  },
  {
    field: 'hungryText',
    title: '饿到不行想吃饭时',
    lead: 'TA 一般会怎么做？',
    placeholder: '简短几句就够～',
    kind: 'textarea',
  },
  {
    field: 'thirstyText',
    title: '渴了 / 不舒服时',
    lead: '想递水或歇会儿时 TA 通常？',
    placeholder: '同上',
    kind: 'textarea',
  },
  {
    field: 'intimateRespectText',
    title: '边界与节奏',
    lead: '亲密接触或你想停下时，TA 有无在意你的感受？有没有跟得上你的节奏？',
    placeholder: '可写「还没走到那步」',
    kind: 'textarea',
  },
];

type FormState = {
  metDate: string;
  hungryText: string;
  thirstyText: string;
  intimateRespectText: string;
  whyFreeText: string;
  reasons: Set<string>;
  togetherFeel: string;
  respectLevel: number;
};

const initialForm: FormState = {
  metDate: '',
  hungryText: '',
  thirstyText: '',
  intimateRespectText: '',
  whyFreeText: '',
  reasons: new Set(),
  togetherFeel: '',
  respectLevel: 3,
};

type PersistShape = FormState & {
  timelineIndex: number;
  timelinePhase: 'type' | 'reflect';
  choicePhase: 'idle' | 'done';
};

const miniBtn: React.CSSProperties = {
  padding: '8px 14px',
  fontSize: 12,
  fontFamily: 'Tahoma, "MS Sans Serif", "Microsoft YaHei", sans-serif',
  background: 'linear-gradient(180deg, #fff 0%, #ffe4f3 100%)',
  border: '1px solid #e8a4c8',
  borderRadius: 10,
  cursor: 'pointer',
  color: '#4a2349',
  fontWeight: 600,
};

function parseFormFromSession(raw: string | null): FormState {
  if (!raw) return initialForm;
  try {
    const p = JSON.parse(raw) as Record<string, unknown>;
    const reasonsArr = Array.isArray(p.reasons) ? (p.reasons as string[]) : [];
    return {
      metDate: String(p.metDate ?? ''),
      hungryText: String(p.hungryText ?? ''),
      thirstyText: String(p.thirstyText ?? ''),
      intimateRespectText: String(p.intimateRespectText ?? ''),
      whyFreeText: String(p.whyFreeText ?? ''),
      reasons: new Set(reasonsArr),
      togetherFeel: String(p.togetherFeel ?? ''),
      respectLevel:
        Number(p.respectLevel) >= 1 && Number(p.respectLevel) <= 5 ? Number(p.respectLevel) : 3,
    };
  } catch {
    return initialForm;
  }
}

function buildPaperText(form: FormState): string {
  const lines: string[] = [];
  TIMELINE_META.forEach((m) => {
    const v = m.field === 'metDate' ? form.metDate : form[m.field];
    lines.push(`【${m.title}】`);
    lines.push(m.lead);
    lines.push(v.trim() || '（未填）');
    lines.push('');
  });
  lines.push('【静下来问问自己】');
  REFLECTION_PROMPTS.forEach((t, i) => lines.push(`${i + 1}. ${t}`));
  lines.push('');
  lines.push('【为啥是他 · 待着啥感觉】');
  const rs = [...form.reasons].map((k) => REASON_OPTIONS.find((o) => o.key === k)?.label ?? k);
  lines.push(`栽 TA 的点：${rs.length ? rs.join('；') : '（未选）'}`);
  lines.push(`大白话：${form.whyFreeText.trim() || '（未填）'}`);
  lines.push(
    `待着时更像：${FEEL_OPTIONS.find((o) => o.value === form.togetherFeel)?.label ?? '（未选）'}`,
  );
  lines.push(`「被认真对待」：${form.respectLevel} / 5`);
  return lines.join('\n');
}

function xpWinBtn(label: string, opts: { danger?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        opts.onClick();
      }}
      style={{
        width: 21,
        height: 21,
        padding: 0,
        fontSize: 10,
        lineHeight: '19px',
        border: '1px solid #fff',
        borderRadius: 3,
        cursor: 'pointer',
        background: opts.danger
          ? 'linear-gradient(180deg,#e87c7c,#c53030)'
          : 'linear-gradient(180deg,#e8e8e8,#b8b8b8)',
        color: opts.danger ? '#fff' : '#000',
        fontFamily: WINDOW_TITLE_FONT,
      }}
    >
      {label}
    </button>
  );
}

/** 经典 XP 子窗口：浅色遮罩仍可隐约看见桌面；标题栏 _ □ ✕；正文大字 */
function PaperZoomModal({ open, text, onClose }: { open: boolean; text: string; onClose: () => void }) {
  const [wide, setWide] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) setWide(false);
  }, [open]);

  if (!open || typeof document === 'undefined') return null;

  const node = (
    <div
      role="dialog"
      aria-modal
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483646,
        background: 'rgba(0, 0, 0, 0.22)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        boxSizing: 'border-box',
      }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: wide ? 'min(920px, 96vw)' : 'min(560px, 94vw)',
          maxHeight: '86vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '4px 4px 18px rgba(0,0,0,0.45)',
          border: '2px solid #083a70',
          borderRadius: '6px 6px 0 0',
          overflow: 'hidden',
          fontFamily: WINDOW_TITLE_FONT,
        }}
      >
        <div
          style={{
            flexShrink: 0,
            background: 'linear-gradient(180deg, #0997ff 0%, #055fb3 52%, #04498c 100%)',
            padding: '4px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            borderBottom: '1px solid #022d52',
            cursor: 'default',
          }}
        >
          <span style={{ flex: 1, color: '#fff', fontSize: 12, fontWeight: 'bold', textShadow: '1px 1px 0 #022' }}>
            放大阅读 — 姐妹谈心
          </span>
          <div style={{ display: 'flex', gap: 3 }} data-zoom-win-controls>
            {xpWinBtn('_', { onClick: onClose })}
            {xpWinBtn(wide ? '❐' : '□', { onClick: () => setWide((w) => !w) })}
            {xpWinBtn('✕', { danger: true, onClick: onClose })}
          </div>
        </div>
        <div
          style={{
            flex: 1,
            minHeight: 200,
            overflowY: 'auto',
            background: '#ece9d8',
            padding: '18px 20px 22px',
            fontSize: 17,
            lineHeight: 1.72,
            color: '#1a1520',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: FONT,
            borderTop: '1px solid #fff',
          }}
        >
          {text.trim() || '（暂无内容）'}
        </div>
      </div>
    </div>
  );

  return createPortal(node, document.body);
}

function ReflectionBlock() {
  return (
    <div
      style={{
        marginTop: 8,
        padding: '9px 9px 11px',
        borderRadius: 10,
        background: 'rgba(255, 182, 215, 0.22)',
        border: '1px dashed #e8a0c8',
        fontSize: 12,
        lineHeight: 1.55,
        color: '#5c3855',
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 6, color: '#8b4578' }}>静下来问问自己（没有标准答案）</div>
      <ul style={{ margin: 0, paddingLeft: 18 }}>
        {REFLECTION_PROMPTS.map((t, i) => (
          <li key={i} style={{ marginBottom: 5 }}>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PhoneScreen({
  scrollBody,
  footer,
  onOpenPaper,
}: {
  scrollBody: ReactNode;
  footer?: ReactNode | null;
  onOpenPaper?: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [scrollBody]);

  const handleScreenClick = (e: React.MouseEvent) => {
    if (!onOpenPaper) return;
    const el = e.target as HTMLElement;
    if (el.closest('button') || el.closest('textarea') || el.closest('input') || el.closest('select')) return;
    if (el.closest('label')) return;
    onOpenPaper();
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: PHONE_LCD.left,
        top: PHONE_LCD.top,
        width: PHONE_LCD.width,
        height: PHONE_LCD.height,
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'auto',
        zIndex: 2,
      }}
    >
      <button
        type="button"
        title="打开放大阅读窗口"
        onClick={(e) => {
          e.stopPropagation();
          onOpenPaper?.();
        }}
        style={{
          position: 'absolute',
          right: 4,
          top: 2,
          zIndex: 6,
          padding: '3px 7px',
          fontSize: 10,
          fontWeight: 700,
          cursor: 'pointer',
          borderRadius: 8,
          border: '1px solid rgba(200,120,160,0.6)',
          background: 'rgba(255,255,255,0.85)',
          color: '#8b4578',
          fontFamily: FONT,
        }}
      >
        A+
      </button>

      <div
        ref={scrollRef}
        onClick={handleScreenClick}
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: '7px 8px 9px',
          paddingRight: 36,
          fontSize: 13,
          lineHeight: 1.52,
          color: '#2d1828',
          boxSizing: 'border-box',
          WebkitOverflowScrolling: 'touch',
          cursor: onOpenPaper ? 'pointer' : 'default',
        }}
      >
        <div style={{ fontSize: 10, opacity: 0.78, marginBottom: 6, lineHeight: 1.35 }}>
          点屏幕文字区域（不含输入框）或右上角 A+ → 放大阅读
        </div>
        {scrollBody}
      </div>
      {footer != null && footer !== false ? (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            flexShrink: 0,
            padding: '7px 7px 9px',
            borderTop: '1px solid rgba(220, 160, 200, 0.35)',
            background: 'linear-gradient(180deg, rgba(255, 251, 254, 0.92), rgba(255, 236, 246, 0.95))',
            borderRadius: '0 0 10px 10px',
          }}
        >
          {footer}
        </div>
      ) : null}
    </div>
  );
}

export function RelationshipRadarApp() {
  const [paperOpen, setPaperOpen] = useState(false);
  const [paperText, setPaperText] = useState('');

  const openPaper = useCallback(() => {
    const form = parseFormFromSession(sessionStorage.getItem(STORAGE_KEY));
    setPaperText(buildPaperText(form));
    setPaperOpen(true);
  }, []);

  const [timelineIndex, setTimelineIndex] = useState(0);
  const [timelinePhase, setTimelinePhase] = useState<'type' | 'reflect'>('type');
  const [choicePhase, setChoicePhase] = useState<'idle' | 'done'>('idle');

  const [form, setForm] = useState<FormState>(() => {
    if (typeof window === 'undefined') return initialForm;
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return initialForm;
      const p = JSON.parse(raw) as Record<string, unknown>;
      const reasonsArr = Array.isArray(p.reasons) ? (p.reasons as string[]) : [];
      return {
        metDate: String(p.metDate ?? ''),
        hungryText: String(p.hungryText ?? ''),
        thirstyText: String(p.thirstyText ?? ''),
        intimateRespectText: String(p.intimateRespectText ?? ''),
        whyFreeText: String(p.whyFreeText ?? ''),
        reasons: new Set(reasonsArr),
        togetherFeel: String(p.togetherFeel ?? ''),
        respectLevel:
          Number(p.respectLevel) >= 1 && Number(p.respectLevel) <= 5 ? Number(p.respectLevel) : 3,
      };
    } catch {
      return initialForm;
    }
  });

  const persist = useCallback(
    (next: FormState, extra?: Partial<PersistShape>) => {
      const payload: PersistShape = {
        ...next,
        timelineIndex,
        timelinePhase,
        choicePhase,
        ...extra,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ ...payload, reasons: [...next.reasons] }));
    },
    [timelineIndex, timelinePhase, choicePhase],
  );

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const p = JSON.parse(raw) as Record<string, unknown>;
      if (typeof p.timelineIndex === 'number' && p.timelineIndex >= 0 && p.timelineIndex <= TIMELINE_META.length) {
        setTimelineIndex(p.timelineIndex);
      }
      if (p.timelinePhase === 'reflect' || p.timelinePhase === 'type') setTimelinePhase(p.timelinePhase);
      if (p.choicePhase === 'done' || p.choicePhase === 'idle') setChoicePhase(p.choicePhase);
    } catch {
      /* noop */
    }
  }, []);

  const patch = useCallback(
    (partial: Partial<FormState>) => {
      setForm((prev) => {
        const merged = { ...prev, ...partial } as FormState;
        persist(merged);
        return merged;
      });
    },
    [persist],
  );

  const toggleReason = (key: string) => {
    setForm((prev) => {
      const next = new Set(prev.reasons);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      const merged = { ...prev, reasons: next };
      persist(merged);
      return merged;
    });
  };

  const resetFlow = () => {
    const cleared: FormState = { ...initialForm, reasons: new Set<string>() };
    setForm(cleared);
    setTimelineIndex(0);
    setTimelinePhase('type');
    setChoicePhase('idle');
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...cleared,
        reasons: [],
        timelineIndex: 0,
        timelinePhase: 'type',
        choicePhase: 'idle',
      }),
    );
  };

  const meta = TIMELINE_META[timelineIndex];
  const timelineDone = timelineIndex >= TIMELINE_META.length;

  const fieldValue = (f: TimelineField): string => form[f];

  const setFieldValue = (f: TimelineField, v: string) => {
    if (f === 'metDate') patch({ metDate: v });
    else if (f === 'hungryText') patch({ hungryText: v });
    else if (f === 'thirstyText') patch({ thirstyText: v });
    else patch({ intimateRespectText: v });
  };

  const advanceTimelineAfterReflect = () => {
    const nextIdx = timelineIndex + 1;
    setTimelineIndex(nextIdx);
    setTimelinePhase('type');
    persist(form, { timelineIndex: nextIdx, timelinePhase: 'type' });
  };

  const submitTimelineAnswer = () => {
    setTimelinePhase('reflect');
    persist(form, { timelinePhase: 'reflect' });
  };

  const timelineScroll = (
    <>
      {TIMELINE_META.slice(0, timelineIndex).map((m) => {
        const key = m.field;
        const ans =
          key === 'metDate'
            ? form.metDate || '（未填）'
            : key === 'hungryText'
              ? form.hungryText || '（未填）'
              : key === 'thirstyText'
                ? form.thirstyText || '（未填）'
                : form.intimateRespectText || '（未填）';
        return (
          <div key={key} style={{ marginBottom: 13 }}>
            <div style={{ fontWeight: 700, color: '#8b4578', marginBottom: 4 }}>{m.title}</div>
            <div style={{ fontSize: 12, opacity: 0.92 }}>{m.lead}</div>
            <div style={{ marginTop: 6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{ans}</div>
            <ReflectionBlock />
          </div>
        );
      })}
      {!timelineDone && meta ? (
        <>
          <div style={{ fontWeight: 700, color: '#8b4578', marginBottom: 5 }}>{meta.title}</div>
          <div style={{ fontSize: 12, marginBottom: 9 }}>{meta.lead}</div>
          {timelinePhase === 'reflect' ? (
            <>
              <div style={{ marginTop: 4, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {meta.kind === 'month'
                  ? fieldValue('metDate') || '（未选月份）'
                  : fieldValue(meta.field) || '（未填）'}
              </div>
              <ReflectionBlock />
            </>
          ) : null}
        </>
      ) : null}
    </>
  );

  const timelineFooter =
    !timelineDone && meta ? (
      timelinePhase === 'type' ? (
        <>
          {meta.kind === 'month' ? (
            <input
              type="month"
              value={form.metDate}
              onChange={(e) => patch({ metDate: e.target.value })}
              style={{
                width: '100%',
                padding: 8,
                fontSize: 13,
                border: '1px solid #dda4c8',
                borderRadius: 8,
                marginBottom: 8,
                boxSizing: 'border-box',
              }}
            />
          ) : (
            <textarea
              value={fieldValue(meta.field)}
              onChange={(e) => setFieldValue(meta.field, e.target.value)}
              rows={3}
              placeholder={meta.placeholder}
              style={{
                width: '100%',
                padding: 8,
                resize: 'vertical',
                border: '1px solid #dda4c8',
                borderRadius: 8,
                boxSizing: 'border-box',
                fontSize: 12,
                marginBottom: 8,
              }}
            />
          )}
          <button type="button" style={{ ...miniBtn, width: '100%' }} onClick={submitTimelineAnswer}>
            写好了，看看下面的自问
          </button>
        </>
      ) : (
        <button type="button" style={{ ...miniBtn, width: '100%' }} onClick={advanceTimelineAfterReflect}>
          下一题 →
        </button>
      )
    ) : null;

  const choiceScroll = (
    <>
      <div style={{ fontWeight: 700, marginBottom: 8, color: '#a05290', fontSize: 12 }}>━━ 前面唠过的 ━━</div>
      {TIMELINE_META.map((m) => {
        const ans =
          m.field === 'metDate'
            ? form.metDate || '（未填）'
            : form[m.field] || '（未填）';
        return (
          <div key={m.field} style={{ marginBottom: 11, fontSize: 12 }}>
            <div style={{ fontWeight: 700, color: '#8b4578' }}>{m.title}</div>
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: 4 }}>{ans}</div>
          </div>
        );
      })}
      <div style={{ borderTop: '1px dashed #e8b8d8', margin: '14px 0', paddingTop: 12 }} />
      <div style={{ fontWeight: 700, marginBottom: 8, color: '#8b4578' }}>为啥是他 · 待着啥感觉</div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 12 }}>栽 TA 的点（可多选）</div>
        <div style={{ display: 'grid', gap: 7 }}>
          {REASON_OPTIONS.map((o) => (
            <label key={o.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', fontSize: 12 }}>
              <input type="checkbox" checked={form.reasons.has(o.key)} onChange={() => toggleReason(o.key)} style={{ marginTop: 3 }} />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      </div>

      <label style={{ display: 'block', marginBottom: 12 }}>
        <span style={{ fontWeight: 700, display: 'block', marginBottom: 5, fontSize: 12 }}>用大白话再来一句</span>
        <textarea
          value={form.whyFreeText}
          onChange={(e) => patch({ whyFreeText: e.target.value })}
          rows={3}
          placeholder="上头也算～"
          style={{
            width: '100%',
            padding: 8,
            resize: 'vertical',
            border: '1px solid #dda4c8',
            borderRadius: 8,
            boxSizing: 'border-box',
            fontSize: 12,
          }}
        />
      </label>

      <ReflectionBlock />

      <div style={{ marginTop: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 12 }}>待着时更像哪一种？</div>
        {FEEL_OPTIONS.map((o) => (
          <label key={o.value} style={{ display: 'flex', gap: 8, marginBottom: 8, cursor: 'pointer', fontSize: 12 }}>
            <input
              type="radio"
              name="togetherFeel"
              checked={form.togetherFeel === o.value}
              onChange={() => patch({ togetherFeel: o.value })}
              style={{ marginTop: 3 }}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 12 }}>有没有觉得「被认真对待」（1～5）</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              style={{
                cursor: 'pointer',
                padding: '7px 11px',
                borderRadius: 12,
                border: form.respectLevel === n ? '2px solid #e855a0' : '1px solid #e8bcd8',
                fontSize: 12,
              }}
            >
              <input
                type="radio"
                name="respectLevel"
                checked={form.respectLevel === n}
                onChange={() => patch({ respectLevel: n })}
              />{' '}
              <strong>{n}</strong>
            </label>
          ))}
        </div>
      </div>

      {choicePhase === 'done' ? (
        <div style={{ marginTop: 14, padding: 11, borderRadius: 10, background: 'rgba(255,220,235,0.35)', fontSize: 12 }}>
          就先记到这里啦。这里没有打分也没有 AI 总结，只是把你自己说的话留在本机浏览器里；需要专业支持请寻找可信赖的服务～
        </div>
      ) : null}
    </>
  );

  const choiceFooter =
    timelineDone && choicePhase === 'idle' ? (
      <button
        type="button"
        style={{ ...miniBtn, width: '100%', background: 'linear-gradient(180deg,#ffd6eb,#ffb8dc)' }}
        onClick={() => {
          setChoicePhase('done');
          persist(form, { choicePhase: 'done' });
        }}
      >
        好啦，先收到这儿
      </button>
    ) : timelineDone && choicePhase === 'done' ? (
      <button type="button" style={{ ...miniBtn, width: '100%' }} onClick={resetFlow}>
        清空重来
      </button>
    ) : null;

  return (
    <div
      style={{
        height: '100%',
        minHeight: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: FONT,
        backgroundColor: '#f4eaf2',
        background: 'linear-gradient(180deg, #faf4f9 0%, #ece6df 100%)',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '8px 8px 10px',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 'min(100%, 340px)',
          flex: '1 1 auto',
          minHeight: 200,
          aspectRatio: '575 / 1024',
          backgroundColor: '#fdf7fb',
          background: 'linear-gradient(165deg, #fffafd 0%, #f5e6ef 55%, #eee4dc 100%)',
          borderRadius: 10,
        }}
      >
        <img
          src={PHONE_SKIN_SRC}
          alt=""
          draggable={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            objectPosition: 'center',
            userSelect: 'none',
            pointerEvents: 'none',
            backgroundColor: 'transparent',
          }}
        />
        {!timelineDone ? (
          <PhoneScreen scrollBody={timelineScroll} footer={timelineFooter} onOpenPaper={openPaper} />
        ) : (
          <PhoneScreen scrollBody={choiceScroll} footer={choiceFooter} onOpenPaper={openPaper} />
        )}
      </div>

      <p
        style={{
          flexShrink: 0,
          margin: '8px 0 0',
          padding: '0 4px',
          fontSize: 10,
          lineHeight: 1.35,
          color: '#554',
          textAlign: 'center',
          maxWidth: 340,
        }}
      >
        非测验、非医疗；较真请找专业人员。窗边爱心是系统装饰～
      </p>

      <PaperZoomModal open={paperOpen} text={paperText} onClose={() => setPaperOpen(false)} />
    </div>
  );
}
