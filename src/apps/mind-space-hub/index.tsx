import { useEffect, useState } from 'react';

import '@/components/hub-shell/hub-paper-nav.css';
import { TwoColumnLayout } from '@/components/hub-shell/two-column-layout';
import { WideScreenDecoration } from '@/components/hub-shell/wide-screen-decoration';
import { useContainerWidth } from '@/hooks/use-container-width';
import { ComfortBuddyApp } from '@/apps/comfort-buddy';
import { MsnApp } from '@/apps/msn';
import { WuFaJiChuDeXinApp } from '@/apps/wu_fa_ji_chu_de_xin';
import { ShengYinJiaoNangApp } from '@/apps/sheng_yin_jiao_nang';
import { WrongAnswerHealApp } from '@/apps/dan_nian_cuoti';
import { consumeHubInitialTab } from '@/lib/hub-initial-tab';

type TabId = 'comfort' | 'msn' | 'letter' | 'voice' | 'wrongAnswer';

const TABS: { id: TabId; label: string }[] = [
  { id: 'comfort', label: '小暖信箱' },
  { id: 'msn', label: '内在小孩对话' },
  { id: 'letter', label: '无法寄出的信' },
  { id: 'voice', label: '声音胶囊' },
  { id: 'wrongAnswer', label: '写给当年的错题' },
];

export function MindSpaceHubApp() {
  const { ref, width } = useContainerWidth();
  const [tab, setTab] = useState<TabId>('comfort');

  useEffect(() => {
    const raw = consumeHubInitialTab('mindSpaceHub');
    if (
      raw === 'comfort' ||
      raw === 'msn' ||
      raw === 'letter' ||
      raw === 'voice' ||
      raw === 'wrongAnswer'
    ) {
      setTab(raw);
    }
  }, []);

  const sidebar = (
    <nav className="hpn-nav hpn-nav--roomy" aria-label="心灵空间">
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
    tab === 'comfort' ? (
      <ComfortBuddyApp />
    ) : tab === 'msn' ? (
      <MsnApp />
    ) : tab === 'letter' ? (
      <WuFaJiChuDeXinApp />
    ) : tab === 'voice' ? (
      <ShengYinJiaoNangApp />
    ) : (
      <WrongAnswerHealApp />
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
