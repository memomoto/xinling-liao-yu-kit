/**
 * Shared 「心之花」model — used by greenhouse + physical shelf mirror.
 */

export type HeartFlowerId = 'anger' | 'fawning' | 'fear' | 'rigid';

export type HeartFlowerCareRow = { water: number; hug: number };

export type HeartFlowerCareMap = Record<HeartFlowerId, HeartFlowerCareRow>;

/** 单层花瓣尖锐 vs 圆润贝塞尔 */
export const HEART_PETAL_SHARP_PATH = 'M 0,-46 L 16,-14 L 0,12 L -16,-14 Z';
export const HEART_PETAL_SOFT_PATH =
  'M 0,-46 C 22,-36 22,-12 0,12 C -22,-12 -22,-36 0,-46';

export const HEART_STEM_PATH = 'M 0,14 Q 6,46 0,76';
export const HEART_POT_PATH = 'M -38 76 Q -44 92 -36 98 H 36 Q 44 92 38 76 Z';

export function emptyHeartFlowerCare(): HeartFlowerCareMap {
  return {
    anger: { water: 0, hug: 0 },
    fawning: { water: 0, hug: 0 },
    fear: { water: 0, hug: 0 },
    rigid: { water: 0, hug: 0 },
  };
}

/** 与 greenhouse 一致：浇灌/拥抱共同推进圆润度 */
export function heartFlowerMorphT(row: HeartFlowerCareRow): number {
  return Math.min(1, (row.water + row.hug) * 0.22 + (row.water >= 1 && row.hug >= 1 ? 0.15 : 0));
}

export type HeartFlowerSpec = {
  id: HeartFlowerId;
  label: string;
  hint: string;
  sharp: string;
  soft: string;
  centerSharp: string;
  centerSoft: string;
};

export const HEART_FLOWER_SPECS: HeartFlowerSpec[] = [
  {
    id: 'anger',
    label: '愤怒',
    hint: '尖刺像在呼救',
    sharp: '#8B4A6B',
    soft: '#FFB7D5',
    centerSharp: '#5c3048',
    centerSoft: '#ff9ec8',
  },
  {
    id: 'fawning',
    label: '讨好',
    hint: '低垂的灰蓝',
    sharp: '#6B7B8B',
    soft: '#B5D5FF',
    centerSharp: '#4a5560',
    centerSoft: '#8bb8ff',
  },
  {
    id: 'fear',
    label: '恐惧',
    hint: '紧缩的深紫',
    sharp: '#4A4A6B',
    soft: '#E8C5FF',
    centerSharp: '#32324a',
    centerSoft: '#d5a8ff',
  },
  {
    id: 'rigid',
    label: '偏激',
    hint: '一面锋利的刃',
    sharp: '#9A5C40',
    soft: '#FFD4A8',
    centerSharp: '#6b3d28',
    centerSoft: '#ffc080',
  },
];

/** 物理置物架小盆栽：四合一场均圆润度 → 单色型显示基线（愤怒花盆） */
export function averageHeartFlowerMorph(care: HeartFlowerCareMap): number {
  let sum = 0;
  for (const f of HEART_FLOWER_SPECS) sum += heartFlowerMorphT(care[f.id]);
  return sum / HEART_FLOWER_SPECS.length;
}
