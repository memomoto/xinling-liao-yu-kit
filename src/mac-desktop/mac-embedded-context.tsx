import { createContext, useContext, type ReactNode } from 'react';

const MacEmbeddedContext = createContext(false);

/** 将仿 Mac 壳限制在笔记本「屏幕」DOM 盒内时必须包裹此 Provider（外层须 `transform + overflow:hidden` 形成绘制参考） */
export function MacEmbeddedProvider({ children }: { children: ReactNode }) {
  return <MacEmbeddedContext.Provider value={true}>{children}</MacEmbeddedContext.Provider>;
}

/** 正在为物理笔记本屏幕内嵌渲染时为 true */
export function useMacEmbedded(): boolean {
  return useContext(MacEmbeddedContext);
}
