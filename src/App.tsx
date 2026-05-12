import { useEffect, useMemo, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';

import { listRegisteredAppsSorted } from '@/shell/app-catalog';
import { HEALING_OPEN_APP_EVENT, type OpenWindowDetail } from '@/shell/cross-shell-events';
import { RegisteredApp } from '@/shell/registered-app';
import { queryClient } from '@/trpc';

function parseOpenDetail(detail: unknown): string | null {
  if (typeof detail === 'string' && detail) return detail;
  if (
    detail &&
    typeof detail === 'object' &&
    'id' in detail &&
    typeof (detail as { id: unknown }).id === 'string'
  ) {
    return (detail as { id: string }).id;
  }
  return null;
}

export default function App() {
  const apps = useMemo(() => listRegisteredAppsSorted(), []);
  const [currentId, setCurrentId] = useState<string>(() => apps[0]?.id ?? 'healingToolboxHub');
  const [remountKey, setRemountKey] = useState(0);

  useEffect(() => {
    const handler = (ev: Event) => {
      const id = parseOpenDetail((ev as CustomEvent<OpenWindowDetail>).detail);
      if (!id) return;
      setCurrentId(id);
      setRemountKey((k) => k + 1);
    };
    window.addEventListener(HEALING_OPEN_APP_EVENT, handler as EventListener);
    return () => window.removeEventListener(HEALING_OPEN_APP_EVENT, handler as EventListener);
  }, []);

  const label = apps.find((a) => a.id === currentId)?.title ?? currentId;

  return (
    <QueryClientProvider client={queryClient}>
        <div
          style={{
            display: 'flex',
            height: '100vh',
            overflow: 'hidden',
            fontFamily: 'system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif',
          }}
        >
          <aside
            style={{
              width: 280,
              flexShrink: 0,
              borderRight: '1px solid rgba(255,255,255,0.08)',
              background: 'linear-gradient(180deg, #1a1d24 0%, #12141a 100%)',
              color: '#e8eaef',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.02em' }}>心灵疗愈</div>
              <div style={{ fontSize: 11, opacity: 0.55, marginTop: 4 }}>心理创伤疗愈工具 · 侧栏导航</div>
            </div>
            <nav
              aria-label="应用列表"
              style={{ flex: 1, overflowY: 'auto', padding: '8px 10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}
            >
              {apps.map((a) => {
                const on = a.id === currentId;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setCurrentId(a.id);
                      setRemountKey((k) => k + 1);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: 8,
                      border: on ? '1px solid rgba(125, 211, 252, 0.35)' : '1px solid transparent',
                      background: on ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                      color: '#f1f5f9',
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    <img src={a.icon} alt="" width={22} height={22} style={{ flexShrink: 0, objectFit: 'contain' }} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
          <main style={{ flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
            <header
              style={{
                flexShrink: 0,
                padding: '10px 16px',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                background: '#fff',
                fontSize: 13,
                fontWeight: 600,
                color: '#111827',
              }}
            >
              {label}
            </header>
            <div style={{ flex: 1, minHeight: 0 }}>
              <RegisteredApp id={currentId} remountKey={remountKey} />
            </div>
          </main>
        </div>
    </QueryClientProvider>
  );
}
