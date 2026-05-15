/**
 * 按 id 渲染已注册的应用本体。
 */

import React from 'react';
import { APP_REGISTRY } from '../apps/registry';

export type RegisteredAppProps = {
  id: string;
  /** 与主站一致：需同步最小化态的应用可接收 */
  windowMinimized?: boolean;
  remountKey?: number | string;
};

const FALLBACK_FONT = '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif';

export function RegisteredApp({ id, windowMinimized = false, remountKey = 0 }: RegisteredAppProps) {
  void windowMinimized;
  const app = APP_REGISTRY[id];
  if (app) {
    const { AppComponent } = app;
    return <AppComponent key={remountKey} />;
  }
  return (
    <div style={{ padding: '20px', fontFamily: FALLBACK_FONT, fontSize: '13px' }}>
      <p>
        未找到应用 <strong>{id}</strong>。
      </p>
    </div>
  );
}
