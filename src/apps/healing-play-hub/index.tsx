import { useState } from 'react';

import '@/components/hub-shell/hub-paper-nav.css';
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

export function HealingPlayHubApp() {
  const { ref, width } = useContainerWidth();
  const [tab, setTab] = useState<TabId>('healingInteractions');

  const sidebar = (
    <nav className="hpn-nav" aria-label="疗愈互动与叙事">
      {TABS.map((t) => {
        const on = t.id === tab;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`hpn-btn${on ? ' hpn-btn--active' : ''}`}
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
