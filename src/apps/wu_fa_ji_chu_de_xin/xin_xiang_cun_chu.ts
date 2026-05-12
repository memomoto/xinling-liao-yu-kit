/**
 * 「无法寄出的信」—— 仅封存入库的信件写入 localStorage；
 * 「化为星光」「阅后即焚」不保存正文。
 */
export const WU_FA_XIN_STORAGE_KEY = 'unsent_closed_letters_vault_v1';

export type XinShouJianRen = 'shang_hai_wo_de_ren' | 'guo_qu_de_zi_ji' | 'wei_lai_de_zi_ji';

export const SHOU_JIANREN_LABEL: Record<XinShouJianRen, string> = {
  shang_hai_wo_de_ren: '曾经伤害过我的人',
  guo_qu_de_zi_ji: '过去的自己',
  wei_lai_de_zi_ji: '未来的自己',
};

export interface FengCunXin {
  id: string;
  shou_jian_ren: XinShouJianRen;
  zheng_wen: string;
  cun_ru_at: number;
}

export interface WuFaXinCangKu {
  feng_xin_list: FengCunXin[];
  /** 不立字据的仪式感计数（不涉及正文） */
  ju_yi_ci?: {
    xing_guang_ci: number;
    yue_hou_ci: number;
  };
}

function defaultKu(): WuFaXinCangKu {
  return { feng_xin_list: [], ju_yi_ci: { xing_guang_ci: 0, yue_hou_ci: 0 } };
}

export function jiZaiWuFaXin(): WuFaXinCangKu {
  if (typeof window === 'undefined') return defaultKu();
  try {
    const raw = localStorage.getItem(WU_FA_XIN_STORAGE_KEY);
    if (!raw) return defaultKu();
    const o = JSON.parse(raw) as Partial<WuFaXinCangKu>;
    if (!o || typeof o !== 'object') return defaultKu();
    const list = Array.isArray(o.feng_xin_list)
      ? o.feng_xin_list.filter(isFengXin)
      : [];
    return {
      feng_xin_list: list.slice(-80),
      ju_yi_ci: {
        xing_guang_ci: clampN(o.ju_yi_ci?.xing_guang_ci),
        yue_hou_ci: clampN(o.ju_yi_ci?.yue_hou_ci),
      },
    };
  } catch {
    return defaultKu();
  }
}

function clampN(v: unknown): number {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) return 0;
  return Math.min(v, 1_000_000);
}

const SHOU_KEYS: XinShouJianRen[] = [
  'shang_hai_wo_de_ren',
  'guo_qu_de_zi_ji',
  'wei_lai_de_zi_ji',
];

function isShouRen(v: string): v is XinShouJianRen {
  return (SHOU_KEYS as readonly string[]).includes(v);
}

function isFengXin(x: unknown): x is FengCunXin {
  if (!x || typeof x !== 'object') return false;
  const r = x as FengCunXin;
  return (
    typeof r.id === 'string' &&
    typeof r.zheng_wen === 'string' &&
    typeof r.shou_jian_ren === 'string' &&
    typeof r.cun_ru_at === 'number' &&
    isShouRen(r.shou_jian_ren) &&
    r.zheng_wen.length <= 50_000
  );
}

function xieRu(ku: WuFaXinCangKu): void {
  try {
    localStorage.setItem(WU_FA_XIN_STORAGE_KEY, JSON.stringify(ku));
  } catch {
    /* */
  }
}

export function fengRenXinJiRuKu(
  prev: WuFaXinCangKu,
  shou_jian_ren: XinShouJianRen,
  zheng_wen: string,
): WuFaXinCangKu {
  const trimmed = zheng_wen.trim();
  if (!trimmed) return prev;
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `xf_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  const next: WuFaXinCangKu = {
    ...prev,
    feng_xin_list: [...prev.feng_xin_list, { id, shou_jian_ren, zheng_wen: trimmed.slice(0, 50_000), cun_ru_at: Date.now() }].slice(
      -80,
    ),
  };
  xieRu(next);
  return next;
}

export function yiChuYiFeng(prev: WuFaXinCangKu, id: string): WuFaXinCangKu {
  const next: WuFaXinCangKu = {
    ...prev,
    feng_xin_list: prev.feng_xin_list.filter((l) => l.id !== id),
  };
  xieRu(next);
  return next;
}

/** 化作星光：不存档正文；仅可加仪式计数 */
export function jiYiXingGuangJuYi(prev: WuFaXinCangKu): WuFaXinCangKu {
  const jc = prev.ju_yi_ci ?? { xing_guang_ci: 0, yue_hou_ci: 0 };
  const next: WuFaXinCangKu = {
    ...prev,
    ju_yi_ci: { ...jc, xing_guang_ci: jc.xing_guang_ci + 1 },
  };
  xieRu(next);
  return next;
}

/** 阅后即焚完成：不立字据计数 */
export function jiYiYueHouJuYi(prev: WuFaXinCangKu): WuFaXinCangKu {
  const jc = prev.ju_yi_ci ?? { xing_guang_ci: 0, yue_hou_ci: 0 };
  const next: WuFaXinCangKu = {
    ...prev,
    ju_yi_ci: { ...jc, yue_hou_ci: jc.yue_hou_ci + 1 },
  };
  xieRu(next);
  return next;
}
