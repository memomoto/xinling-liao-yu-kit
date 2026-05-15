import * as React from 'react';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';

import '@/mac-desktop/styles/mac-shell.css';

export function ContextMenu(props: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root {...props} />;
}

export function ContextMenuTrigger(props: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return <ContextMenuPrimitive.Trigger {...props} />;
}

export function ContextMenuContent({
  className = '',
  style,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        className={`mac-cm-content ${className}`}
        style={style}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  );
}

export function ContextMenuItem({
  className = '',
  variant = 'default',
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
  variant?: 'default' | 'destructive';
}) {
  return (
    <ContextMenuPrimitive.Item
      className={`mac-cm-item ${variant === 'destructive' ? 'mac-cm-item--destructive' : ''} ${className}`}
      {...props}
    />
  );
}

export function ContextMenuSeparator(props: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return <ContextMenuPrimitive.Separator className="mac-cm-sep" {...props} />;
}
