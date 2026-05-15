import { useCallback, useLayoutEffect, useRef } from 'react';
import type { TextareaHTMLAttributes } from 'react';

import './paper-components.css';

export type PaperTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

/** 随内容增高，横线信纸背景；无 max-height，不靠内部滚动条截断长文 */
export function PaperTextarea({ className = '', value, defaultValue, onChange, ...props }: PaperTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const syncHeight = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useLayoutEffect(() => {
    syncHeight();
  }, [value, defaultValue, syncHeight]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e);
    requestAnimationFrame(syncHeight);
  };

  const isControlled = value !== undefined;

  return (
    <textarea
      ref={ref}
      className={`paper-textarea ${className}`.trim()}
      {...props}
      {...(isControlled ? { value } : defaultValue !== undefined ? { defaultValue } : {})}
      onChange={handleChange}
    />
  );
}
