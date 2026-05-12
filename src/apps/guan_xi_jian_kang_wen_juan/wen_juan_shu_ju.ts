import type { Dim } from './lei_xing';

export type { Dim } from './lei_xing';

/** 16 题 × 0–3 分，每维度 4 题 max 12 */
export const DIM_INDEXES: Record<Dim, readonly number[]> = {
  respect: [0, 1, 2, 3],
  boundary: [4, 5, 6, 7],
  give: [8, 9, 10, 11],
  self: [12, 13, 14, 15],
} as const;

export const QUESTIONS: readonly { dim: Dim; text: string }[] = [
  {
    dim: 'respect',
    text: '在这段关系中，我可以自由表达自己的想法和感受，不担心被嘲笑或否定。',
  },
  {
    dim: 'respect',
    text: '当我说"不"的时候，对方能够尊重我的决定，不会持续施压或表现出不满。',
  },
  {
    dim: 'respect',
    text: '对方会认真倾听我说的话，而不是打断我、转移话题或轻描淡写地忽略。',
  },
  {
    dim: 'respect',
    text: '在关系中发生冲突后，我不会感到被羞辱、被否定人格，或需要不停道歉。',
  },
  {
    dim: 'boundary',
    text: '我在这段关系中有属于自己的时间和空间，不需要时刻向对方汇报或解释。',
  },
  {
    dim: 'boundary',
    text: '我可以保持自己的友谊和兴趣爱好，对方不会因此感到嫉妒或施加压力。',
  },
  {
    dim: 'boundary',
    text: '我不会因为害怕对方的反应，而改变自己的决定、外表或行为方式。',
  },
  {
    dim: 'boundary',
    text: '我对自己的身体有完全的自主权，不曾感到被强迫或被催促做不舒服的事。',
  },
  {
    dim: 'give',
    text: '在这段关系里，付出和接受是相对平衡的，我不觉得自己一直在单方面维持关系。',
  },
  {
    dim: 'give',
    text: '我帮助对方是因为我真心想，而不是出于害怕冲突或担心失去这段关系。',
  },
  {
    dim: 'give',
    text: '结束相处后，我通常感到充实或平静，而不是精疲力竭或空洞。',
  },
  {
    dim: 'give',
    text: '我不会因为对方的情绪低落而自动感到有责任"修复"它或承担责任。',
  },
  {
    dim: 'self',
    text: '在这段关系里，我觉得自己变得更了解自己，而不是越来越不确定自己是谁。',
  },
  {
    dim: 'self',
    text: '我不需要时刻揣摩对方的心情来决定自己该怎么说话或行动。',
  },
  {
    dim: 'self',
    text: '整体而言，这段关系让我对未来感到希望，而不是焦虑或恐惧。',
  },
  {
    dim: 'self',
    text: '就算这段关系结束，我相信自己也能好好生活，而不是完全失去方向。',
  },
] as const;

export const INSIGHTS: Record<Dim, Record<'high' | 'mid' | 'low', string>> = {
  respect: {
    high: '在这段关系里，你感到被尊重和被倾听。这是健康关系最重要的基础之一。',
    mid: '有时你的感受和想法能被接收，但也有时候感到被忽视。值得留意那些让你感到不被重视的时刻。',
    low: '你在这段关系中很少感到被真正尊重。你的感受、想法和界限是值得被认真对待的。',
  },
  boundary: {
    high: '你在关系中保有自己的独立性，这很健康。',
    mid: '你的个人空间和自主性有时会受到影响。',
    low: '你在这段关系里的边界和自主空间较少，这值得认真关注。',
  },
  give: {
    high: '关系中的付出相对平衡，你不是在单方面维持这段关系。',
    mid: '有时你会感到付出多于收获，或者因为害怕而付出。',
    low: '你可能长期处于过度付出或讨好的状态，而这消耗了你很多能量。',
  },
  self: {
    high: '这段关系帮助你更了解自己，你也保有独立的自我认知。',
    mid: '有时你在关系中会感到迷失，需要时刻揣摩对方。',
    low: '在这段关系里，你可能越来越不确定自己是谁，越来越依赖对方来定义自己的价值。',
  },
};

export const DIM_LABELS: Record<Dim, string> = {
  respect: '被尊重感',
  boundary: '边界与自主',
  give: '付出平衡',
  self: '自我感知',
};

const OPTION_LABELS = ['很少或从不', '偶尔', '大多数时候', '总是这样'] as const;

/** 渲染顺序：总是这样 = 3 分 … 很少 = 0（与原版 HTML 选项顺序一致） */
export const SCORE_OPTIONS: readonly { score: number; label: string }[] = [
  { score: 3, label: OPTION_LABELS[3]! },
  { score: 2, label: OPTION_LABELS[2]! },
  { score: 1, label: OPTION_LABELS[1]! },
  { score: 0, label: OPTION_LABELS[0]! },
];

export function getLevel(score: number): 'high' | 'mid' | 'low' {
  const pct = score / 12;
  if (pct >= 0.67) return 'high';
  if (pct >= 0.34) return 'mid';
  return 'low';
}

export function computeScores(ans: readonly (number | null)[]): Record<Dim, number> {
  const scores: Record<Dim, number> = { respect: 0, boundary: 0, give: 0, self: 0 };
  (Object.keys(DIM_INDEXES) as Dim[]).forEach((dim) => {
    scores[dim] = DIM_INDEXES[dim].reduce((s, i) => s + (ans[i] ?? 0), 0);
  });
  return scores;
}

export type OverallBand = 'healthy' | 'caution' | 'concern';

/** 总分三档摘要（与独立 HTML showResult 一致） */
export const OVERALL_BAND_COPY: Record<OverallBand, { title: string; desc: string }> = {
  healthy: {
    title: '整体健康',
    desc: '这段关系总体上是支持性和尊重性的。继续保持觉察，关系也需要持续的用心。',
  },
  caution: {
    title: '需要留意',
    desc: '这段关系有一些健康的部分，但也存在一些值得关注的模式。了解这些模式，是改变的开始。',
  },
  concern: {
    title: '值得认真对待',
    desc: '这段关系中有一些让你感到不舒服或不安全的模式。你的感受是真实的，你值得被善待。',
  },
};

export const DIM_DISPLAY_ORDER = ['respect', 'boundary', 'give', 'self'] as const satisfies readonly Dim[];

export function overallBand(totalScore: number, max = 48): OverallBand {
  const pct = totalScore / max;
  if (pct >= 0.67) return 'healthy';
  if (pct >= 0.4) return 'caution';
  return 'concern';
}

export function buildSuggestions(scores: Record<Dim, number>): string[] {
  const weakDims = (Object.entries(scores) as [Dim, number][])
    .filter(([, s]) => s <= 6)
    .map(([d]) => d);
  const suggests: string[] = [];
  if (weakDims.includes('respect')) {
    suggests.push('试着记录那些让你感到不被尊重的时刻，不需要立刻行动，先让自己看见它。');
  }
  if (weakDims.includes('boundary')) {
    suggests.push('读一读知识小课堂里的「什么是健康的边界」，边界不是冷漠，是对自己诚实。');
  }
  if (weakDims.includes('give')) {
    suggests.push('下次答应对方某件事之前，先在心里停顿三秒，问自己：我是真心想，还是因为害怕？');
  }
  if (weakDims.includes('self')) {
    suggests.push('可以开始写疗愈日记，每天写一件让你感到"这就是我"的事，重新找回自己。');
  }
  if (!suggests.length) {
    suggests.push('继续保持觉察，你已经做得很好了。健康的关系需要持续的用心。');
  }
  return suggests;
}
