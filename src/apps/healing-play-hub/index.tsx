import { useState, type CSSProperties } from 'react';

import { TwoColumnLayout } from '@/components/hub-shell/two-column-layout';
import { WideScreenDecoration } from '@/components/hub-shell/wide-screen-decoration';
import { useContainerWidth } from '@/hooks/use-container-width';
import { HealingInteractionsApp } from '@/apps/healing-interactions';
import { HealingPictureBookApp } from '@/apps/healing-picture-book';

type TabId = 'healingInteractions' | 'healingBook';

const TABS: { id: TabId; label: string }[] = [
  { id: 'healingInteractions', label: '治愈互动' },
  { id: 'healingBook', label: '疗愈叙事绘本' },
];

const BTN: CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '9px 12px',
  margin: 0,
  border: 'none',
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif',
};

export function HealingPlayHubApp() {
  const { ref, width } = useContainerWidth();
  const [tab, setTab] = useState<TabId>('healingInteractions');

  const sidebar = (
    <nav aria-label="疗愈互动与叙事" style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {TABS.map((t) => {
        const on = t.id === tab;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              ...BTN,
              background: on ? 'rgba(244, 114, 182, 0.32)' : 'transparent',
              color: on ? '#831843' : '#450a1e',
              boxShadow: on ? 'inset 0 0 0 1px rgba(219, 39, 119, 0.22)' : 'none',
            }}
          >
            {t.label}
          </button>
        );
      })}
    </nav>
  );

  const content =
    tab === 'healingInteractions' ? <HealingInteractionsApp /> : <HealingPictureBookApp />;

  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <WideScreenDecoration windowWidth={width} />
      <TwoColumnLayout sidebar={sidebar} content={content} windowWidth={width} />
    </div>
  );
}
