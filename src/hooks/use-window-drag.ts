import type React from 'react';
import { useCallback, useRef } from 'react';

import { MAC_DOCK_PX, MAC_MENU_BAR_PX } from '@/config/ping_guo_ke_jie_mian_chi_cun';

export interface DragPosition {
  x: number;
  y: number;
}

interface UseWindowDragOptions {
  position: DragPosition;
  onPositionChange: (pos: DragPosition) => void;
  onDragStart?: () => void;
}

export function useWindowDrag({ position, onPositionChange, onDragStart }: UseWindowDragOptions) {
  const dragOffset = useRef<{ dx: number; dy: number } | null>(null);

  const handleTitlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).closest('[data-window-btn]')) return;

      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);

      dragOffset.current = {
        dx: e.clientX - position.x,
        dy: e.clientY - position.y,
      };

      onDragStart?.();

      const bottomChrome = MAC_DOCK_PX;

      const onMove = (ev: PointerEvent) => {
        if (!dragOffset.current) return;
        const newX = ev.clientX - dragOffset.current.dx;
        const newY = ev.clientY - dragOffset.current.dy;
        const clampedX = Math.max(-200, Math.min(window.innerWidth - 40, newX));
        const clampedY = Math.max(
          MAC_MENU_BAR_PX,
          Math.min(window.innerHeight - bottomChrome - 30, newY),
        );
        onPositionChange({ x: clampedX, y: clampedY });
      };

      const onUp = () => {
        dragOffset.current = null;
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
      };

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    },
    [position, onPositionChange, onDragStart],
  );

  return { handleTitlePointerDown };
}
