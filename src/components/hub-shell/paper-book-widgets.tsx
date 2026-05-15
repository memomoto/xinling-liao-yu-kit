import type { ReactNode } from 'react';

import './paper-book-ui.css';

export type PaperMultiItem = { id: string; label: string };

type PaperMultiSelectProps = {
  items: readonly PaperMultiItem[];
  selected: ReadonlySet<string> | Record<string, boolean>;
  onToggle: (id: string) => void;
  legend?: ReactNode;
  'aria-label'?: string;
};

function isSelected(selected: PaperMultiSelectProps['selected'], id: string): boolean {
  if (selected instanceof Set) return selected.has(id);
  return !!selected[id];
}

/** 书本化多选：序号列表 + 整行点击，选中为墨绿字 + 手写感下划线 */
export function PaperMultiSelect({
  items,
  selected,
  onToggle,
  legend,
  'aria-label': ariaLabel,
}: PaperMultiSelectProps) {
  return (
    <div role="group" aria-label={ariaLabel ?? '可多选'}>
      {legend ? <div className="isr-paper-multi__legend">{legend}</div> : null}
      <ul className="isr-paper-multi__list">
        {items.map((it, index) => {
          const on = isSelected(selected, it.id);
          return (
            <li key={it.id}>
              <button
                type="button"
                className={`isr-paper-multi__item ${on ? 'isr-paper-multi__item--selected' : ''}`}
                onClick={() => onToggle(it.id)}
                aria-pressed={on}
              >
                <span className="isr-paper-multi__num">{index + 1}.</span>
                <span className="isr-paper-multi__text">{it.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type PaperLinedTextareaProps = {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  singleLine?: boolean;
  'aria-label'?: string;
};

/** 横线作文纸 textarea（无描边） */
export function PaperLinedTextarea({
  id,
  value,
  onChange,
  placeholder,
  rows = 5,
  singleLine = false,
  'aria-label': ariaLabel,
}: PaperLinedTextareaProps) {
  return (
    <textarea
      id={id}
      className={`isr-paper-lined${singleLine ? ' isr-paper-lined--single' : ''}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      spellCheck={false}
      autoComplete="off"
      aria-label={ariaLabel}
    />
  );
}

type PaperLinedInputProps = {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  'aria-label'?: string;
};

export function PaperLinedInput({ id, value, onChange, placeholder, 'aria-label': ariaLabel }: PaperLinedInputProps) {
  return (
    <input
      id={id}
      type="text"
      className="isr-paper-lined isr-paper-lined--single"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoComplete="off"
      aria-label={ariaLabel}
    />
  );
}
