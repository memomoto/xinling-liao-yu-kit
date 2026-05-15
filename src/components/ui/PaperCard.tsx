import type { HTMLAttributes } from 'react';

import './paper-components.css';

export type PaperCardProps = HTMLAttributes<HTMLDivElement> & {
  elevation?: 'flat' | 'raised' | 'floating';
};

export function PaperCard({
  children,
  className = '',
  elevation = 'raised',
  ...props
}: PaperCardProps) {
  return (
    <div className={`paper-card paper-card--${elevation} ${className}`.trim()} {...props}>
      {children}
    </div>
  );
}
