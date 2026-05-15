/**
 * 治愈互动 — 独立应用：四个意象模块（无需解锁自愈档案）。
 */

import { useCallback, useState } from 'react';
import type { CSSProperties } from 'react';

import { useSyncedHeartFlowerNullable } from '@/contexts/heart-flower-room-sync';

import { AdultExitKey } from './adult-exit-key';
import { HealingInteractionsFonts } from './fonts-loader';
import { HarborQuietRoom } from './harbor-quiet-room';
import { HeartFlowerGreenhouse } from './heart-flower-greenhouse';
import './mirror-notice.css';
import { IntuitionRadar } from './intuition-radar';

type TabId = 'flowers' | 'exit' | 'radar' | 'harbor';

const SAN_UI =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';

const SERIF =
  '"Songti SC", "Source Han Serif SC", SimSun, "STKaiti", KaiTi, Georgia, "Times New Roman", serif';

const TABS: { id: TabId; label: string }[] = [
  { id: 'flowers', label: '🪴 心之花温室' },
  { id: 'exit', label: '🔑 成人的退出键' },
  { id: 'radar', label: '🛡️ 第六感雷达' },
  { id: 'harbor', label: '🕯️ 避风港静默室' },
];

export function HealingInteractionsApp() {
  const [tab, setTab] = useState<TabId>('flowers');
  const physicalHeartMirror = useSyncedHeartFlowerNullable();

  const tabBtnStyle = useCallback((active: boolean): CSSProperties => ({
    flexShrink: 0,
    padding: '8px 12px',
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 999,
    border: active ? '1px solid rgba(255,248,220,0.38)' : '1px solid rgba(255,255,255,0.12)',
    background: active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
    color: active ? 'rgba(252,246,232,0.98)' : 'rgba(215,208,192,0.78)',
    cursor: 'pointer',
    fontFamily: SAN_UI,
  }), []);

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(165deg, rgba(26,34,42,0.95) 0%, rgba(18,26,34,0.96) 45%, rgba(22,32,38,0.97) 100%)',
        overflow: 'hidden',
      }}
    >
      <HealingInteractionsFonts />
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          padding: '20px 22px 24px',
          backdropFilter: 'blur(14px) saturate(125%)',
          WebkitBackdropFilter: 'blur(14px) saturate(125%)',
        }}
      >
        <header style={{ marginBottom: 14 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 600,
              color: 'rgba(245, 248, 236, 0.94)',
              letterSpacing: '0.05em',
              fontFamily: SERIF,
            }}
          >
            治愈互动
          </h1>
          <p
            style={{
              margin: '8px 0 0',
              fontSize: 12,
              color: 'rgba(200, 208, 198, 0.58)',
              fontFamily: SAN_UI,
              lineHeight: 1.55,
            }}
          >
            与「自愈档案」分开——点心之花、退出键、雷达与静默室，无需密码。
          </p>
        </header>

        <nav
          aria-label="互动切换"
          style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 12,
            marginBottom: 14,
            borderBottom: '1px solid rgba(255,248,230,0.08)',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)} style={tabBtnStyle(tab === t.id)}>
              {t.label}
            </button>
          ))}
        </nav>

        <section style={{ borderRadius: 14, overflow: 'hidden' }}>
          {tab === 'flowers' && physicalHeartMirror ? (
            <p className="mirror-notice" role="note">
              提示：这里的浇水与拥抱交互将同步反映在你书桌右侧的物理盆栽上。
            </p>
          ) : null}
          {tab === 'flowers' ? <HeartFlowerGreenhouse /> : null}
          {tab === 'exit' ? <AdultExitKey /> : null}
          {tab === 'radar' ? <IntuitionRadar /> : null}
          {tab === 'harbor' ? <HarborQuietRoom /> : null}
        </section>
      </div>
    </div>
  );
}
