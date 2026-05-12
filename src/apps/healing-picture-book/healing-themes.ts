/** 疗愈小游戏 · 可选主题（泡泡里显示） */

export interface HealingTheme {
  id: string;
  shortLabel: string;
  /** 长一点的说明，可选展示 */
  label: string;
  /** 泡泡表面渐变 */
  bubbleGradient: string;
  /** 泡泡边缘高光色 */
  rimColor: string;
}

export const HEALING_THEMES: HealingTheme[] = [
  {
    id: 'cptsd',
    shortLabel: '复杂性创伤',
    label: '复杂性创伤后压力',
    bubbleGradient: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.95) 0%, rgba(252, 231, 243, 0.55) 45%, rgba(216, 180, 254, 0.35) 100%)',
    rimColor: 'rgba(244, 114, 182, 0.65)',
  },
  {
    id: 'family',
    shortLabel: '原生家庭',
    label: '原生家庭',
    bubbleGradient: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.92) 0%, rgba(224, 242, 254, 0.5) 50%, rgba(165, 243, 252, 0.35) 100%)',
    rimColor: 'rgba(56, 189, 248, 0.55)',
  },
  {
    id: 'bullying',
    shortLabel: '霸凌',
    label: '霸凌与排斥',
    bubbleGradient: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9) 0%, rgba(237, 233, 254, 0.55) 50%, rgba(196, 181, 253, 0.4) 100%)',
    rimColor: 'rgba(167, 139, 250, 0.6)',
  },
  {
    id: 'anxiety',
    shortLabel: '焦虑',
    label: '焦虑与不安',
    bubbleGradient: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.92) 0%, rgba(236, 252, 203, 0.5) 55%, rgba(190, 242, 100, 0.25) 100%)',
    rimColor: 'rgba(163, 230, 53, 0.45)',
  },
  {
    id: 'grief',
    shortLabel: '哀伤',
    label: '失落与哀伤',
    bubbleGradient: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9) 0%, rgba(255, 237, 213, 0.55) 50%, rgba(253, 186, 116, 0.35) 100%)',
    rimColor: 'rgba(251, 146, 60, 0.5)',
  },
];
