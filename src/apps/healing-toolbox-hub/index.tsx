import { useState, type CSSProperties } from 'react';

import { TwoColumnLayout } from '@/components/hub-shell/two-column-layout';
import { WideScreenDecoration } from '@/components/hub-shell/wide-screen-decoration';
import { useContainerWidth } from '@/hooks/use-container-width';
import { GroundingToolkitApp } from '@/apps/zhuo_lu_ji_jiu_xiang';
import { PanicGroundingKitApp } from '@/apps/panic-grounding-kit';
import { KindBoundaryExitApp } from '@/apps/tao_hao_jin_ji_kou';
import { PerspectiveSwitchApp } from '@/apps/perspective-switch';
import { MemoryAttributeEditorApp } from '@/apps/memory-attribute-editor';
import { BoundaryFirewallApp } from '@/apps/boundary-firewall';
import { CognitiveDiskCleanupApp } from '@/apps/cognitive-disk-cleanup';

type ToolId =
  | 'grounding'
  | 'panic'
  | 'kindBoundary'
  | 'perspective'
  | 'memory'
  | 'boundary'
  | 'cognitive';

const ITEMS: { id: ToolId; label: string }[] = [
  { id: 'grounding', label: '5-4-3-2-1 着陆箱' },
  { id: 'panic', label: '蓝屏急救包' },
  { id: 'kindBoundary', label: '讨好模式紧急出口' },
  { id: 'perspective', label: '视角切换' },
  { id: 'memory', label: '记忆属性' },
  { id: 'boundary', label: '边界防火墙' },
  { id: 'cognitive', label: '认知磁盘清理' },
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
  fontFamily: 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
};

export function HealingToolboxHubApp() {
  const { ref, width } = useContainerWidth();
  const [active, setActive] = useState<ToolId>('grounding');

  const sidebar = (
    <nav aria-label="疗愈工具" style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {ITEMS.map((it) => {
        const on = it.id === active;
        return (
          <button
            key={it.id}
            type="button"
            onClick={() => setActive(it.id)}
            style={{
              ...BTN,
              background: on ? 'rgba(244, 114, 182, 0.32)' : 'transparent',
              color: on ? '#831843' : '#450a1e',
              boxShadow: on ? 'inset 0 0 0 1px rgba(219, 39, 119, 0.22)' : 'none',
            }}
          >
            {it.label}
          </button>
        );
      })}
    </nav>
  );

  const content =
    active === 'grounding' ? (
      <GroundingToolkitApp />
    ) : active === 'panic' ? (
      <PanicGroundingKitApp />
    ) : active === 'kindBoundary' ? (
      <KindBoundaryExitApp />
    ) : active === 'perspective' ? (
      <PerspectiveSwitchApp />
    ) : active === 'memory' ? (
      <MemoryAttributeEditorApp />
    ) : active === 'boundary' ? (
      <BoundaryFirewallApp />
    ) : (
      <CognitiveDiskCleanupApp />
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
