import { useState } from 'react';

import '@/components/hub-shell/hub-paper-nav.css';
import { TwoColumnLayout } from '@/components/hub-shell/two-column-layout';
import { WideScreenDecoration } from '@/components/hub-shell/wide-screen-decoration';
import { useContainerWidth } from '@/hooks/use-container-width';
import { ResiliencePracticeApp } from '@/apps/tan_xing_lian_xi';
import { HealingJournalApp } from '@/apps/healing-journal';
import { ZhiYuHuaYuanApp } from '@/apps/zhi_yu_hua_yuan';
import { WayHomePracticeApp } from '@/apps/hui_jia_de_lu';

type ItemId = 'resilience' | 'journal' | 'garden' | 'wayHome';

const ITEMS: { id: ItemId; label: string }[] = [
  { id: 'resilience', label: '复原力每日练习' },
  { id: 'journal', label: '自愈档案' },
  { id: 'garden', label: '虚拟治愈花园' },
  { id: 'wayHome', label: '回家的路' },
];

export function DailyRepairHubApp() {
  const { ref, width } = useContainerWidth();
  const [active, setActive] = useState<ItemId>('resilience');

  const sidebar = (
    <nav className="hpn-nav" aria-label="每日修复">
      {ITEMS.map((it) => {
        const on = it.id === active;
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => setActive(it.id)}
            className={`hpn-btn${on ? ' hpn-btn--active' : ''}`}
          >
            {it.label}
          </button>
        );
      })}
    </nav>
  );

  const content =
    active === 'resilience' ? (
      <ResiliencePracticeApp />
    ) : active === 'journal' ? (
      <HealingJournalApp />
    ) : active === 'garden' ? (
      <ZhiYuHuaYuanApp />
    ) : (
      <WayHomePracticeApp />
    );

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
