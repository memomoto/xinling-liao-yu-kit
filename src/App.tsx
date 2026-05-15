import { QueryClientProvider } from '@tanstack/react-query';

import { HealingToolboxHubApp } from '@/apps/healing-toolbox-hub';
import { queryClient } from '@/trpc';

/** 根层仅为粉色物理书房；Mac 菜单栏与 Dock 仅在书桌平板打开后的屏内渲染。 */
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HealingToolboxHubApp />
    </QueryClientProvider>
  );
}
