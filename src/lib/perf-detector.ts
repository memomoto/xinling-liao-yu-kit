/**
 * 检测设备与系统偏好，在 <html> 上添加 `.perf-mode`，与 transitions.css 联动降级动效。
 */

interface PerfResult {
  isPerfMode: boolean;
  reason: string[];
}

export function detectPerformance(): PerfResult {
  const reasons: string[] = [];

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reasons.push('prefers-reduced-motion');
  }

  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (mem !== undefined && mem < 2) {
    reasons.push(`low-memory(${mem}GB)`);
  }

  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2) {
    reasons.push(`low-cpu(${navigator.hardwareConcurrency}cores)`);
  }

  if (window.innerHeight < 500) {
    reasons.push('small-viewport-height');
  }

  type BatteryManager = { level: number; charging: boolean };
  if ('getBattery' in navigator) {
    (navigator as Navigator & { getBattery: () => Promise<BatteryManager> })
      .getBattery()
      .then((bat) => {
        if (!bat.charging && bat.level < 0.2) {
          document.documentElement.classList.add('perf-mode');
        }
      })
      .catch(() => {});
  }

  const isPerfMode = reasons.length > 0;
  return { isPerfMode, reasons };
}

/** 应用启动时调用一次 */
export function initPerfMode(): void {
  const { isPerfMode, reasons } = detectPerformance();

  if (isPerfMode) {
    document.documentElement.classList.add('perf-mode');
    console.info('[perf] 降级模式已启用，原因:', reasons);
  }

  const mq = window.matchMedia('(max-height: 500px)');
  mq.addEventListener('change', (e) => {
    if (e.matches) {
      document.documentElement.classList.add('perf-mode');
    } else {
      const { isPerfMode: stillPerf } = detectPerformance();
      if (!stillPerf) document.documentElement.classList.remove('perf-mode');
    }
  });
}
