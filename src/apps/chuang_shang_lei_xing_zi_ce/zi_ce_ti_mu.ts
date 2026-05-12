import type { Dim } from './lei_xing';

export type { Dim } from './lei_xing';

/** 每维度 4 题 × 最高分 2 = 每维 max 8 */
export const DIM_MAX = 8;

export const DIM_INDEXES: Record<Dim, readonly number[]> = {
  family: [0, 1, 2, 3],
  relation: [4, 5, 6, 7],
  external: [8, 9, 10, 11],
} as const;

export const DIM_LABELS: Record<Dim, string> = {
  family: '原生家庭',
  relation: '亲密关系',
  external: '外部创伤',
};

export const DIM_DISPLAY_ORDER = ['family', 'relation', 'external'] as const satisfies readonly Dim[];

export type QuizQuestion = {
  dim: Dim;
  text: string;
  /** 敏感题提示，与原版 q-note 一致 */
  note?: string;
  /** 自上而下分值 2 → 1 → 0（与 HTML onclick 顺序一致） */
  options: readonly { score: number; label: string }[];
};

export const QUESTIONS: readonly QuizQuestion[] = [
  {
    dim: 'family',
    text: '小时候，父母之间经常有激烈争吵、冷战或暴力行为。',
    options: [
      { score: 2, label: '是的，经常发生' },
      { score: 1, label: '偶尔有' },
      { score: 0, label: '没有或很少' },
    ],
  },
  {
    dim: 'family',
    text: '父母曾用语言贬低、否定或嘲笑过你，让你觉得自己不够好。',
    options: [
      { score: 2, label: '是的，经常这样' },
      { score: 1, label: '偶尔有' },
      { score: 0, label: '没有或很少' },
    ],
  },
  {
    dim: 'family',
    text: '在家里，我必须"表现好"或"不惹麻烦"才能感觉到安全或被爱。',
    options: [
      { score: 2, label: '非常符合' },
      { score: 1, label: '有一些' },
      { score: 0, label: '不太符合' },
    ],
  },
  {
    dim: 'family',
    text: '父母曾长期忽视我的情绪或需求，让我觉得自己的感受不重要。',
    options: [
      { score: 2, label: '是的，有这种感觉' },
      { score: 1, label: '偶尔有' },
      { score: 0, label: '没有这种感觉' },
    ],
  },
  {
    dim: 'relation',
    text: '在亲密关系中，我经常感到需要讨好对方，害怕表达真实想法会让他们不高兴。',
    options: [
      { score: 2, label: '非常符合' },
      { score: 1, label: '有一些' },
      { score: 0, label: '不太符合' },
    ],
  },
  {
    dim: 'relation',
    text: '我非常害怕被抛弃，为了维持关系会过度付出，甚至委屈自己。',
    options: [
      { score: 2, label: '是的，很符合' },
      { score: 1, label: '有时候会' },
      { score: 0, label: '不太符合' },
    ],
  },
  {
    dim: 'relation',
    text: '我很难相信别人真的爱我、接纳我，总感觉随时可能被抛弃或背叛。',
    options: [
      { score: 2, label: '非常符合' },
      { score: 1, label: '有时候这样' },
      { score: 0, label: '不太符合' },
    ],
  },
  {
    dim: 'relation',
    text: '在关系中，我曾被伴侣否定、控制、或让我怀疑自己的判断和感受。',
    options: [
      { score: 2, label: '是的，发生过' },
      { score: 1, label: '有一些迹象' },
      { score: 0, label: '没有' },
    ],
  },
  {
    dim: 'external',
    text: '我曾遭受过身体上的侵犯、性骚扰或性侵害。',
    note: '这是一个敏感的问题，你完全可以选择跳过。无论你的经历如何，都不是你的错。',
    options: [
      { score: 2, label: '是的' },
      { score: 1, label: '不确定或不想回答' },
      { score: 0, label: '没有' },
    ],
  },
  {
    dim: 'external',
    text: '我曾在学校或职场遭受过长期的霸凌、排挤或骚扰。',
    options: [
      { score: 2, label: '是的，经历过' },
      { score: 1, label: '有一些' },
      { score: 0, label: '没有' },
    ],
  },
  {
    dim: 'external',
    text: '我曾经历过重大失去（如亲人离世、重大事故），并感到久久无法走出。',
    options: [
      { score: 2, label: '是的' },
      { score: 1, label: '有过，但还好' },
      { score: 0, label: '没有' },
    ],
  },
  {
    dim: 'external',
    text: '有时我会突然感到强烈的恐惧、心跳加速，或被某些场景、声音、气味触发不好的记忆。',
    options: [
      { score: 2, label: '经常发生' },
      { score: 1, label: '偶尔有' },
      { score: 0, label: '很少或没有' },
    ],
  },
] as const;

export type LevelBand = 'high' | 'mid' | 'low';

/** 与 HTML getLevel(score, max)：≥75% high，≥40% mid，否则 low */
export function dimLevel(score: number, max: number): LevelBand {
  const pct = score / max;
  if (pct >= 0.75) return 'high';
  if (pct >= 0.4) return 'mid';
  return 'low';
}

const DESC_MAP: Record<Dim, Record<LevelBand, { label: string; text: string }>> = {
  family: {
    high: {
      label: '影响较深',
      text: '原生家庭对你的影响较为明显。你可能从小就学会了压抑自己的需求、小心翼翼地讨好他人。这不是你的错——这是孩子在不安全环境中的生存策略。',
    },
    mid: {
      label: '有一定影响',
      text: '你的成长环境有一些不够理想的地方，可能留下了一些影响。很多时候这些模式是隐性的，不容易察觉。',
    },
    low: {
      label: '影响较小',
      text: '原生家庭方面的创伤痕迹相对较少，但其他方面的经历同样值得关注。',
    },
  },
  relation: {
    high: {
      label: '影响较深',
      text: '在亲密关系中，你可能长期处于不平等或不安全的状态。讨好、过度付出、害怕冲突——这些都是创伤后的自我保护，而不是你"不够好"。',
    },
    mid: {
      label: '有一定影响',
      text: '你在亲密关系中有一些不健康的模式，可能意识到了，也可能还没有。识别这些模式是改变的第一步。',
    },
    low: {
      label: '影响较小',
      text: '你在亲密关系中的创伤痕迹相对较少，但保持觉察依然重要。',
    },
  },
  external: {
    high: {
      label: '影响较深',
      text: '你经历过来自外部世界的伤害，这些经历可能让你长期处于警觉状态。你的身体和神经系统一直在保护你——现在，你可以慢慢学着让它们放松。',
    },
    mid: {
      label: '有一定影响',
      text: '你有过一些外部创伤经历，它们可能以各种方式影响着你现在的状态。',
    },
    low: {
      label: '影响较小',
      text: '外部创伤方面的痕迹相对较少。',
    },
  },
};

export function dimDesc(dim: Dim, score: number, max = DIM_MAX): { label: string; text: string } {
  return DESC_MAP[dim][dimLevel(score, max)];
}

export function computeScores(ans: readonly (number | null)[]): Record<Dim, number> {
  const scores: Record<Dim, number> = { family: 0, relation: 0, external: 0 };
  (Object.keys(DIM_INDEXES) as Dim[]).forEach((dim) => {
    scores[dim] = DIM_INDEXES[dim].reduce((s, i) => s + (ans[i] ?? 0), 0);
  });
  return scores;
}

/** 按得分排序取最高维度的建议文案（HTML getSuggest） */
export function topDimSuggestion(scores: Record<Dim, number>): string {
  const sorted = (Object.entries(scores) as [Dim, number][]).sort((a, b) => b[1] - a[1]);
  const top = sorted[0]![0];
  const suggests: Record<Dim, string> = {
    family:
      '建议你先从「知识小课堂」里了解原生家庭创伤和讨好型人格，再用「情绪绘本」的原生家庭路线来慢慢整理自己的感受。',
    relation:
      '建议你完成「关系健康问卷」，更清晰地看到自己在亲密关系中的模式，同时可以开始写「疗愈日记」，记录那些让你感到委屈的瞬间。',
    external:
      '建议你每天做「复原力练习」中的呼吸和身体扫描，帮助神经系统慢慢平静下来。你不需要急着回忆和处理，先让身体感到安全。',
  };
  return suggests[top];
}
