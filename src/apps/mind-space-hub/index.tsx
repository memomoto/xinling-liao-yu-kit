import { useState, type CSSProperties } from 'react';

import { TwoColumnLayout } from '@/components/hub-shell/two-column-layout';
import { WideScreenDecoration } from '@/components/hub-shell/wide-screen-decoration';
import { useContainerWidth } from '@/hooks/use-container-width';
import { ComfortBuddyApp } from '@/apps/comfort-buddy';
import { MsnApp } from '@/apps/msn';
import { WuFaJiChuDeXinApp } from '@/apps/wu_fa_ji_chu_de_xin';
import { ShengYinJiaoNangApp } from '@/apps/sheng_yin_jiao_nang';
import { WrongAnswerHealApp } from '@/apps/dan_nian_cuoti';

type TabId = 'comfort' | 'msn' | 'letter' | 'voice' | 'wrongAnswer';

const TABS: { id: TabId; label: string }[] = [
  { id: 'comfort', label: '小暖信箱' },
  { id: 'msn', label: '内在小孩对话' },
  { id: 'letter', label: '无法寄出的信' },
  { id: 'voice', label: '声音胶囊' },
  { id: 'wrongAnswer', label: '写给当年的错题' },
];

const BTN: CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: '10px 14px',
  margin: 0,
  border: 'none',
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
};

export function MindSpaceHubApp() {
  const { ref, width } = useContainerWidth();
  const [tab, setTab] = useState<TabId>('comfort');

  const sidebar = (
    <nav aria-label="心灵空间" style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
      {TABS.map((t) => {
        const on = t.id === tab;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              ...BTN,
              background: on ? 'rgba(244, 114, 182, 0.34)' : 'transparent',
              color: on ? '#831843' : '#4a0432',
              boxShadow: on ? 'inset 0 0 0 1px rgba(219, 39, 119, 0.25)' : 'none',
            }}
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
