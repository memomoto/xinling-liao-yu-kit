import { useState, type CSSProperties } from 'react';

import { TwoColumnLayout } from '@/components/hub-shell/two-column-layout';
import { WideScreenDecoration } from '@/components/hub-shell/wide-screen-decoration';
import { useContainerWidth } from '@/hooks/use-container-width';
import { TraumaTypeAssessmentApp } from '@/apps/chuang_shang_lei_xing_zi_ce';
import { RelationshipHealthQuizApp } from '@/apps/guan_xi_jian_kang_wen_juan';
import { RelationshipRadarApp } from '@/apps/guan_xi_lei_da';
import { KnowledgeClassroomApp } from '@/apps/zhi_shi_xiao_ke_tang';

type TabId = 'trauma' | 'quiz' | 'radar' | 'help';

const TABS: { id: TabId; label: string }[] = [
  { id: 'trauma', label: '创伤类型自测' },
  { id: 'quiz', label: '关系健康问卷' },
  { id: 'radar', label: '姐妹谈心' },
  { id: 'help', label: '帮助与支持' },
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

export function SelfKnowledgeHubApp() {
  const { ref, width } = useContainerWidth();
  const [tab, setTab] = useState<TabId>('trauma');

  const sidebar = (
    <nav aria-label="自我认知" style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
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
