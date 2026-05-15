/** 打开 Hub 窗口前写入，目标 Hub 挂载时读取并清除 — 用于书房书脊直达某 Tab。 */
const PREFIX = 'moe:hubInitialTab:';

export function primeHubInitialTab(appId: string, tab: string): void {
  try {
    sessionStorage.setItem(PREFIX + appId, tab);
  } catch {
    /* ignore */
  }
}

export function consumeHubInitialTab(appId: string): string | null {
  try {
    const k = PREFIX + appId;
    const v = sessionStorage.getItem(k);
    if (v) sessionStorage.removeItem(k);
    return v;
  } catch {
    return null;
  }
}
