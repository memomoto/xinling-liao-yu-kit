/**
 * 视角切换 — 意象：注销并切换到「观察者 / 支持者」账户阅读同一桌面叙事。
 */

import { useState } from 'react';

const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';

type Key = 'hurt' | 'observer' | 'supporter';

const DATA: Record<
  Key,
  { user: string; emoji: string; bg: string; note: string; files: string[] }
> = {
  hurt: {
    user: '受伤的我',
    emoji: '🌧️',
    bg: 'linear-gradient(165deg, #2c3e50 0%, #34495e 100%)',
    note: '为什么总是我……也许我需要先在身体里找一个足够安全的角落。',
    files: ['那天的记忆碎片.txt', '我说错的话.doc', '他们的声音.loop'],
  },
  observer: {
    user: '观察的我',
    emoji: '🌙',
    bg: 'linear-gradient(165deg, #4a5568 0%, #5c6b7a 100%)',
    note: '我看见一个孩子曾在缺乏保护的环境里拼命适应——那不是「矫情」，是求生。',
    files: ['客观时间线.txt', '当时我拥有的资源.doc', '外部环境因素.note'],
  },
  supporter: {
    user: '支持自己的我',
    emoji: '🌸',
    bg: 'linear-gradient(165deg, #6b4f7a 0%, #8b6f9e 100%)',
    note: '你已经走了这么远，还可以把下一步缩小到「喝一杯水」那么大。',
    files: ['今天我做到了.txt', '我的身体好友.doc', '写给自己的短笺.md'],
  },
};

export function PerspectiveSwitchApp() {
  const [view, setView] = useState<Key>('hurt');
  const [busy, setBusy] = useState(false);
  const p = DATA[view];

  const switchTo = (k: Key) => {
    if (k === view) return;
    setBusy(true);
    window.setTimeout(() => {
      setView(k);
      setBusy(false);
    }, 900);
  };

  return (
    <div style={{ height: '100%', fontFamily: FONT, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div style={{ padding: '12px 14px', background: '#fff', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <h1 style={{ margin: 0, fontSize: 16 }}>切换用户 · 视角练习</h1>
        <p style={{ margin: '6px 0 0', fontSize: 11, color: '#86868b', lineHeight: 1.45 }}>
          选一个账户登录——只需意象练习，不必强迫自己立刻「积极」。
        </p>
        <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(Object.keys(DATA) as Key[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => switchTo(k)}
              disabled={busy}
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                border: view === k ? '2px solid #007aff' : '1px solid rgba(0,0,0,0.12)',
                background: view === k ? 'rgba(0,122,255,0.08)' : '#fff',
                fontSize: 12,
                cursor: busy ? 'wait' : 'pointer',
              }}
            >
              {DATA[k].user}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          background: p.bg,
          color: 'rgba(255,255,255,0.94)',
          padding: 20,
          overflow: 'auto',
          transition: 'background 0.6s ease',
          position: 'relative',
        }}
      >
        {busy ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              zIndex: 2,
            }}
          >
            正在注销并重登…
          </div>
        ) : null}

        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 44 }}>{p.emoji}</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>{p.user}</div>
        </div>

        <p style={{ fontSize: 14, lineHeight: 1.75, opacity: 0.95, margin: '0 0 18px' }}>{p.note}</p>

        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 8 }}>桌面上的文件（意象）</div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.85 }}>
          {p.files.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
