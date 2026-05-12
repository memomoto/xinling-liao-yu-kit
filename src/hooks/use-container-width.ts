import { useEffect, useRef, useState, type RefObject } from 'react';

/** ResizeObserver 测量容器宽度，供合并窗口内自适应左右/上下布局 */
export function useContainerWidth(): { ref: RefObject<HTMLDivElement | null>; width: number } {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (typeof w === 'number' && w > 0) setWidth(w);
    });
    ro.observe(el);
    setWidth(el.getBoundingClientRect().width || 720);
    return () => ro.disconnect();
  }, []);
  return { ref, width };
}
