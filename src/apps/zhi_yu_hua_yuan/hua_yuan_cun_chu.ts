/**
 * 虚拟治愈花园 — 本地存档（不回落、不衰减）。
 */

import { type ZhiYuHuaYuanGrowDetail, faBuHuaYuanCunchuYiGengLe } from '@/lib/zhi_yu_hua_yuan_xin_hao';

export const ZHI_YU_HUA_YUAN_KEY = 'healing_virtual_garden_v1';

/** 单次养分（可微调，仅增不减总量） */
const N_YANG_FEN = {
  lei_gu_fang_wen: 1,
  gan_en: 3,
  jin_ri_zai_hua_yuan: 2,
  fu_yuan_li: 4,
  kepu_mu_ci: 2,
  zhuo_lu_wan_cheng: 2,
  zi_yu_dang_an_jin_du: 2,
} as const;

/** 同一天同一来源最多篇数（科普阅读） */
const RI_SHANG_XIAN = {
  kepu_wen_zhang_ci: 3,
} as const;

export interface HuaYuanState {
  /** 已通过「领养」流程（本地意义） */
  yi_ling_yang: boolean;
  ling_yang_shi?: number;
  ni_cheng?: string;
  lei_ji_yang_fen: number;
  ri_ji_zhang: RiJiZhangState;
  /** 感恩日记条目（同一天后写仅覆盖正文，不累加养分） */
  gan_en_zhang?: { iso: string; wen_ben: string }[];
}

export interface RiJiZhangState {
  hua_yuanLouMianRi?: string;
  fuYuanRi?: string;
  gan_enRi?: string;
  kepuMuCiRi?: string;
  kePuMuCi: number;
  /** 同一天完成着陆/蓝屏急救等只计一次 */
  zhuoLuWanChengRi?: string;
  /** 同一天自愈档案推进章节只计一次 */
  ziYuDangAnJinDuRi?: string;
}

function todayISO(): string {
  const d = new Date();
  const z = (n: number) => `${n < 10 ? '0' : ''}${n}`;
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

export function defaultHuaYuanState(): HuaYuanState {
  return {
    yi_ling_yang: false,
    lei_ji_yang_fen: 0,
    gan_en_zhang: [],
    ri_ji_zhang: { kePuMuCi: 0 },
  };
}

export function loadHuaYuan(): HuaYuanState {
  if (typeof window === 'undefined') return defaultHuaYuanState();
  try {
    const raw = localStorage.getItem(ZHI_YU_HUA_YUAN_KEY);
    if (!raw) return defaultHuaYuanState();
    const o = JSON.parse(raw) as Partial<HuaYuanState>;
    if (!o || typeof o !== 'object') return defaultHuaYuanState();
    const base = defaultHuaYuanState();
    return {
      ...base,
      ...o,
      lei_ji_yang_fen:
        typeof o.lei_ji_yang_fen === 'number' && o.lei_ji_yang_fen >= 0
          ? o.lei_ji_yang_fen
          : base.lei_ji_yang_fen,
      gan_en_zhang: Array.isArray(o.gan_en_zhang)
        ? o.gan_en_zhang.slice(-48)
        : base.gan_en_zhang,
      ri_ji_zhang: {
        ...base.ri_ji_zhang,
        ...(typeof o.ri_ji_zhang === 'object' && o.ri_ji_zhang !== null ? o.ri_ji_zhang : {}),
      },
    };
  } catch {
    return defaultHuaYuanState();
  }
}

export function saveHuaYuan(s: HuaYuanState): void {
  try {
    localStorage.setItem(ZHI_YU_HUA_YUAN_KEY, JSON.stringify(s));
  } catch {
    /* */
  } finally {
    if (typeof window !== 'undefined') {
      faBuHuaYuanCunchuYiGengLe();
    }
  }
}

export function zhiWuJieDuan(leiji: number): number {
  if (leiji < 2) return 0;
  if (leiji < 8) return 1;
  if (leiji < 18) return 2;
  if (leiji < 32) return 3;
  if (leiji < 50) return 4;
  if (leiji < 72) return 5;
  if (leiji < 96) return 6;
  return 7;
}

export type ZengYiYuanYin =
  | 'hua_yuan_lou_mian'
  | 'gan_en_ji_zhang'
  | 'fu_yuan_li_ji_li';

/** 若同日同来源已计过养分则退回原状态引用 */
export function zengJiaYangFen(prev: HuaYuanState, yuan_yin: ZengYiYuanYin): HuaYuanState {
  const t = todayISO();
  const rj = { ...prev.ri_ji_zhang };

  switch (yuan_yin) {
    case 'hua_yuan_lou_mian': {
      if (rj.hua_yuanLouMianRi === t) return prev;
      rj.hua_yuanLouMianRi = t;
      const next = {
        ...prev,
        lei_ji_yang_fen: prev.lei_ji_yang_fen + N_YANG_FEN.jin_ri_zai_hua_yuan,
        ri_ji_zhang: rj,
      };
      saveHuaYuan(next);
      return next;
    }
    case 'gan_en_ji_zhang': {
      if (rj.gan_enRi === t) return prev;
      rj.gan_enRi = t;
      const next = {
        ...prev,
        lei_ji_yang_fen: prev.lei_ji_yang_fen + N_YANG_FEN.gan_en,
        ri_ji_zhang: rj,
      };
      saveHuaYuan(next);
      return next;
    }
    case 'fu_yuan_li_ji_li': {
      if (rj.fuYuanRi === t) return prev;
      rj.fuYuanRi = t;
      const next = {
        ...prev,
        lei_ji_yang_fen: prev.lei_ji_yang_fen + N_YANG_FEN.fu_yuan_li,
        ri_ji_zhang: rj,
      };
      saveHuaYuan(next);
      return next;
    }
  }
}

export function zengYiCongKePuYueDu(prev: HuaYuanState): HuaYuanState | null {
  const t = todayISO();
  const rj = { ...prev.ri_ji_zhang };
  const sameDay = rj.kepuMuCiRi === t;
  if (!sameDay) {
    rj.kepuMuCiRi = t;
    rj.kePuMuCi = 0;
  }
  if (rj.kePuMuCi >= RI_SHANG_XIAN.kepu_wen_zhang_ci) return null;

  rj.kePuMuCi += 1;
  const next: HuaYuanState = {
    ...prev,
    lei_ji_yang_fen: prev.lei_ji_yang_fen + N_YANG_FEN.kepu_mu_ci,
    ri_ji_zhang: rj,
  };
  saveHuaYuan(next);
  return next;
}

/** 着陆 / 蓝屏急救完成：同一天只加一次 */
export function zengYiCongZhuoLuWanCheng(prev: HuaYuanState): HuaYuanState | null {
  const t = todayISO();
  const rj = { ...prev.ri_ji_zhang };
  if (rj.zhuoLuWanChengRi === t) return null;
  rj.zhuoLuWanChengRi = t;
  const next: HuaYuanState = {
    ...prev,
    lei_ji_yang_fen: prev.lei_ji_yang_fen + N_YANG_FEN.zhuo_lu_wan_cheng,
    ri_ji_zhang: rj,
  };
  saveHuaYuan(next);
  return next;
}

/** 自愈档案读下一章：同一天只加一次 */
export function zengYiCongZiYuDangAnJinDu(prev: HuaYuanState): HuaYuanState | null {
  const t = todayISO();
  const rj = { ...prev.ri_ji_zhang };
  if (rj.ziYuDangAnJinDuRi === t) return null;
  rj.ziYuDangAnJinDuRi = t;
  const next: HuaYuanState = {
    ...prev,
    lei_ji_yang_fen: prev.lei_ji_yang_fen + N_YANG_FEN.zi_yu_dang_an_jin_du,
    ri_ji_zhang: rj,
  };
  saveHuaYuan(next);
  return next;
}

export function wanChengTongLingHang(niChen?: string): HuaYuanState {
  const prev = loadHuaYuan();
  if (prev.yi_ling_yang) return prev;
  const next: HuaYuanState = {
    ...prev,
    yi_ling_yang: true,
    ling_yang_shi: Date.now(),
    ni_cheng: niChen?.trim() || prev.ni_cheng,
    lei_ji_yang_fen: prev.lei_ji_yang_fen + N_YANG_FEN.lei_gu_fang_wen,
  };
  saveHuaYuan(next);
  return next;
}

/** 同一天首次写入感恩记养分；之后仅改正文 */
export function baoCunGanEn(prev: HuaYuanState, wenBen: string): HuaYuanState {
  const t = todayISO();
  const b = wenBen.trim();
  if (!b) return prev;

  let s = prev;
  if (prev.ri_ji_zhang.gan_enRi !== t) {
    s = zengJiaYangFen(prev, 'gan_en_ji_zhang');
  }

  const log = [...(s.gan_en_zhang ?? [])];
  const idx = log.findIndex((e) => e.iso === t);
  const row = { iso: t, wen_ben: b.slice(0, 800) };
  if (idx >= 0) log[idx] = row;
  else log.push(row);

  const out = { ...s, gan_en_zhang: log.slice(-40) };
  saveHuaYuan(out);
  return out;
}

export function huaYuanJieShouWaiBu(
  prev: HuaYuanState,
  detail: ZhiYuHuaYuanGrowDetail,
): HuaYuanState {
  if (!prev.yi_ling_yang) return prev;
  if (detail.source === 'fu_yuan_li_wan_cheng') {
    return zengJiaYangFen(prev, 'fu_yuan_li_ji_li');
  }
  if (detail.source === 'zhuo_lu_wan_cheng') {
    return zengYiCongZhuoLuWanCheng(prev) ?? prev;
  }
  if (detail.source === 'zi_yu_dang_an_jin_du') {
    return zengYiCongZiYuDangAnJinDu(prev) ?? prev;
  }
  return zengYiCongKePuYueDu(prev) ?? prev;
}
