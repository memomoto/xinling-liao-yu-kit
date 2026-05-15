import type { ButtonHTMLAttributes } from 'react';

import './paper-components.css';

export type PaperButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
};

export function PaperButton({
  variant = 'primary',
  children,
  className = '',
  type = 'button',
  ...props
}: PaperButtonProps) {
  return (
    <button type={type} className={`paper-btn paper-btn--${variant} ${className}`.trim()} {...props}>
      <span className="paper-btn__label">{children}</span>
    </button>
  );
}
