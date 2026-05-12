/** 宽屏时在角落加极淡装饰，减少「空」感；不参与点击 */
export function WideScreenDecoration({ windowWidth }: { windowWidth: number }) {
  if (windowWidth < 900) return null;
  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        right: 24,
        bottom: 20,
        opacity: 0.08,
        pointerEvents: 'none',
        fontSize: 112,
        lineHeight: 1,
        userSelect: 'none',
        zIndex: 0,
      }}
    >
      🌸
    </div>
  );
}
