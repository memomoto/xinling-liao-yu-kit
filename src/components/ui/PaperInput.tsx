import { useCallback, useId, useLayoutEffect, useRef } from 'react';
import type { InputHTMLAttributes } from 'react';

import './paper-components.css';

export type PaperInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

export function PaperInput({ label, className = '', id, ...props }: PaperInputProps) {
  const uid = useId();
  const inputId = id ?? (label ? uid : undefined);
  return (
    <div className={`paper-input-wrap ${className}`.trim()}>
      {label ? (
        <label className="paper-input-label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <input id={inputId} className="paper-input" {...props} />
    </div>
  );
}
