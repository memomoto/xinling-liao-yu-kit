import { useEffect, useState } from 'react';

import '@/components/hub-shell/hub-paper-nav.css';
import { TwoColumnLayout } from '@/components/hub-shell/two-column-layout';
import { WideScreenDecoration } from '@/components/hub-shell/wide-screen-decoration';
import { useContainerWidth } from '@/hooks/use-container-width';
import { TraumaTypeAssessmentApp } from '@/apps/chuang_shang_lei_xing_zi_ce';
import { RelationshipHealthQuizApp } from '@/apps/guan_xi_jian_kang_wen_juan';
import { RelationshipRadarApp } from '@/apps/guan_xi_lei_da';
import { KnowledgeClassroomApp } from '@/apps/zhi_shi_xiao_ke_tang';
import { consumeHubInitialTab } from '@/lib/hub-initial-tab';

type TabId = 'trauma' | 'quiz' | 'radar' | 'help';

const TABS: { id: TabId; label: string }[] = [
  { id: 'trauma', label: '创伤类型自测' },
  { id: 'quiz', label: '关系健康问卷' },
  { id: 'radar', label: '姐妹谈心' },
  { id: 'help', label: '帮助与支持' },
];

export function SelfKnowledgeHubApp() {
  const { ref, width } = useContainerWidth();
  const [tab, setTab] = useState<TabId>('trauma');

  useEffect(() => {
    const raw = consumeHubInitialTab('selfKnowledgeHub');
    if (raw === 'trauma' || raw === 'quiz' || raw === 'radar' || raw === 'help') setTab(raw);
  }, []);

  const sidebar = (
    <nav className="hpn-nav hpn-nav--roomy" aria-label="自我认知">
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
    tab === 'trauma' ? (
      <TraumaTypeAssessmentApp />
    ) : tab === 'quiz' ? (
      <RelationshipHealthQuizApp />
    ) : tab === 'radar' ? (
      <RelationshipRadarApp />
    ) : (
      <KnowledgeClassroomApp />
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
