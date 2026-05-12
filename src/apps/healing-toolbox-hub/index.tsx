import { useState } from 'react';

import { DeskWorkshopLayout, type DeskItemKind } from '@/components/hub-shell/desk-workshop-layout';
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

function mapDeskItemToTool(k: DeskItemKind): ToolId | null {
  if (k === 'eraser') return 'cognitive';
  if (k === 'tape') return 'panic';
  return null;
}

export function HealingToolboxHubApp() {
  const { ref, width } = useContainerWidth();
  const [active, setActive] = useState<ToolId>('grounding');

  const toolbox = ITEMS.map((it) => {
    const on = it.id === active;
    return (
      <button
        key={it.id}
        type="button"
        className={`dw-tool-btn ${on ? 'dw-tool-btn--on' : ''}`}
        onClick={() => setActive(it.id)}
      >
        {it.label}
      </button>
    );
  });

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
      <DeskWorkshopLayout
        toolbox={toolbox}
        windowWidth={width}
        cocoonMode={active === 'kindBoundary'}
        onDeskItem={(k) => {
          const t = mapDeskItemToTool(k);
          if (t) setActive(t);
        }}
      >
        {content}
      </DeskWorkshopLayout>
    </div>
  );
}
