import { createContext, useContext } from 'react';

export type XpWindowFrame = {
  minimized: boolean;
};

export const XpWindowFrameContext = createContext<XpWindowFrame>({ minimized: false });

export function useXpWindowFrame(): XpWindowFrame {
  return useContext(XpWindowFrameContext);
}
