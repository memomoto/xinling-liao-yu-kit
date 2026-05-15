import { useEffect, useRef } from 'react';

function isEditableTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false;
  const tag = t.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  return t.isContentEditable;
}

export interface MacDesktopShortcutHandlers {
  onSpotlightToggle: () => void;
  onMissionControlToggle: () => void;
  onLaunchpadToggle: () => void;
  onCloseOverlays?: () => void;
}

/** Cmd/Ctrl+Space → Spotlight；F3 → Mission Control；F4 → Launchpad；Escape → 关闭浮层 */
export function useMacDesktopShortcuts(handlers: MacDesktopShortcutHandlers, enabled = true) {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    if (!enabled) return;

    const onKey = (e: KeyboardEvent) => {
      const h = ref.current;
      if (e.key === 'Escape') {
        if (isEditableTarget(e.target)) return;
        h.onCloseOverlays?.();
        return;
      }
      if (isEditableTarget(e.target) && (e.code === 'F3' || e.code === 'F4')) return;

      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.code === 'Space') {
        e.preventDefault();
        h.onSpotlightToggle();
        return;
      }
      if (e.code === 'F3') {
        e.preventDefault();
        h.onMissionControlToggle();
        return;
      }
      if (e.code === 'F4') {
        e.preventDefault();
        h.onLaunchpadToggle();
        return;
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled]);
}
