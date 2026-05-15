/**
 * 「心之花」温室 ↔ 书桌右侧物理盆栽镜像（仅疗愈书房物理页面包裹内有效）。
 */

import { createContext, useContext, useMemo, useState, type Dispatch, type ReactNode } from 'react';

import {
  averageHeartFlowerMorph,
  emptyHeartFlowerCare,
  HEART_FLOWER_SPECS,
  type HeartFlowerCareMap,
} from '@/lib/heart-flower-model';

type HeartFlowerRoomValue = {
  care: HeartFlowerCareMap;
  setCare: Dispatch<React.SetStateAction<HeartFlowerCareMap>>;
};

const HeartFlowerRoomContext = createContext<HeartFlowerRoomValue | null>(null);

export function HeartFlowerRoomProvider({ children }: { children: ReactNode }) {
  const [care, setCare] = useState<HeartFlowerCareMap>(() => emptyHeartFlowerCare());
  const value = useMemo(() => ({ care, setCare }), [care]);
  return <HeartFlowerRoomContext.Provider value={value}>{children}</HeartFlowerRoomContext.Provider>;
}

export function useSyncedHeartFlowerNullable(): HeartFlowerRoomValue | null {
  return useContext(HeartFlowerRoomContext);
}

/** 温室：有 Provider 则用共享状态，否则自建本地副本 */
export function useHeartFlowerSyncedOrLocalCare(): HeartFlowerRoomValue {
  const fromRoom = useContext(HeartFlowerRoomContext);
  const [localCare, setLocalCare] = useState<HeartFlowerCareMap>(() => emptyHeartFlowerCare());
  const value = useMemo(
    (): HeartFlowerRoomValue => (fromRoom ? fromRoom : { care: localCare, setCare: setLocalCare }),
    [fromRoom, localCare],
  );
  return value;
}

export function useShelfHeartMirrorDisplay(care: HeartFlowerCareMap) {
  const t = averageHeartFlowerMorph(care);
  const glow = t >= 0.72;
  return { spec: HEART_FLOWER_SPECS[0]!, t, glow };
}
