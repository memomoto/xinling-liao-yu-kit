/**
 * 虚拟治愈花园 — 陪伴式成长。
 * 「注册」在项目内用本地领养种子代替；养分只增不减，没有枯萎逻辑。
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useBreathMic } from '@/hooks/use-breath-mic';
import { ZHI_YU_HUA_YUAN_STORE_GAI_LE } from '@/lib/zhi_yu_hua_yuan_xin_hao';
import {
  type HuaYuanState,
  baoCunGanEn,
  loadHuaYuan,
  wanChengTongLingHang,
  zhiWuJieDuan,
  zengJiaYangFen,
} from './hua_yuan_cun_chu';
import './zhi_yu_hua_yuan.css';

const JIAN_DAO = [
  '一粒还带着睡意的种子，正在泥土里听你靠近的脚步。',
  '冒出了一点点嫩芽——像你心里刚松动的那条线。',
  '茎向上长起来了，慢一点也没关系。',
  '新叶摊开，接住今天偶然照进来的一束光。',
  '枝条在变稳，像在对自己说：我还能继续。',
  '小小的花萼鼓起来，是许多次「回到自己」的回声。',
  '开出温柔的小花：信任不是一步到位，是一天一天叠出来的。',
  '已经很茂盛了呢。再高也只是换叶换花——它永远在此处等你。',
] as const;

function todayISO(): string {
  const d = new Date();
  const z = (n: number) => `${n < 10 ? '0' : ''}${n}`;
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

function fadeG(v: boolean, idle = '0') {
  return { opacity: v ? 1 : 0, transition: 'opacity 0.65s ease' as const };
}

/** 盆中植物可视化：离散阶段叠层 SVG */
function YuanZhongZhiWu({ jie_duan }: { jie_duan: number }) {
  const jd = Math.min(7, Math.max(0, jie_duan));
  return (
    <svg className="zhyPlantSvg" viewBox="0 0 220 240" aria-hidden role="presentation">
      <defs>
        <linearGradient id="zhy-pot-grad" x1="35%" y1="0%" x2="60%" y2="100%">
          <stop offset="0%" stopColor="#6b7589" />
          <stop offset="100%" stopColor="#3f4555" />
        </linearGradient>
      </defs>
      <ellipse cx="110" cy="212" rx="84" ry="14" fill="rgba(58,104,92,0.12)" />

      {/* 陶盆 */}
      <path
        d="M 58 208 L 64 154 L 156 154 L 162 208 Z"
        fill="url(#zhy-pot-grad)"
      />
      <path
        d="M 64 154 L 66 146 L 154 146 L 156 154 Z"
        fill="#4b5568"
      />

      {/* 土面 */}
      <ellipse cx="110" cy="148" rx="52" ry="10" fill="oklch(0.54 0.08 95)" />

      {/* 种子 0 */}
      <g style={{ ...fadeG(jd <= 1) }}>
        <ellipse cx="110" cy="142" rx="10" ry="6" className="zhySeed" />
        <ellipse cx="105" cy="140" rx="4" ry="3" className="zhySeedHi" opacity={0.5} />
      </g>

      {/* 破土芽 1 */}
      <g style={fadeG(jd >= 1)}>
        <path
          d="M108 146 Q 104 128 118 118"
          fill="none"
          stroke="#4a9868"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <ellipse cx="118" cy="116" rx="7" ry="5" transform="rotate(-25 118 116)" className="zhyLeaf" />
      </g>

      {/* 小苗 2 */}
      <g style={fadeG(jd >= 2)}>
        <path
          className="zhyStem"
          d="M108 146 Q102 118 118 94 Q128 118 138 146"
          fill="none"
          stroke="#3d8b5f"
          strokeWidth={5}
          strokeLinecap="round"
        />
        <ellipse cx="102" cy="108" rx="12" ry="7" transform="rotate(-52 102 108)" className="zhyLeaf" />
        <ellipse cx="134" cy="122" rx="11" ry="6" transform="rotate(42 134 122)" className="zhyLeaf" />
      </g>

      {/* 成形株 3–4 */}
      <g style={fadeG(jd >= 3)}>
        <path
          className="zhyStem"
          d="M108 154 Q94 118 118 74 Q138 118 154 154"
          fill="none"
          stroke="#378256"
          strokeWidth={7}
          strokeLinecap="round"
        />
        <ellipse cx="96" cy="98" rx="18" ry="10" transform="rotate(-62 96 98)" className="zhyLeaf" />
        <ellipse cx="142" cy="92" rx="16" ry="9" transform="rotate(54 142 92)" className="zhyLeaf" />
        <ellipse cx="118" cy="118" rx="14" ry="8" transform="rotate(8 118 118)" className="zhyStemHi" />
      </g>

      <g style={fadeG(jd >= 4)}>
        <path
          d="M118 154 Q138 132 174 146"
          fill="none"
          stroke="#2f7150"
          strokeWidth={6}
          strokeLinecap="round"
        />
        <ellipse cx="176" cy="134" rx="16" ry="9" transform="rotate(110 176 134)" className="zhyLeaf" />
        <ellipse cx="88" cy="126" rx="15" ry="8" transform="rotate(-118 88 126)" className="zhyLeaf" />
      </g>

      {/* 花苞 5 */}
      <g style={fadeG(jd >= 5)}>
        <circle cx="120" cy="62" r="10" fill="oklch(0.74 0.12 355)" opacity={0.85} />
        <path d="M120 74 L118 104" stroke="#2f7150" strokeWidth={6} strokeLinecap="round" />
      </g>

      {/* 开花 6+ */}
      <g style={fadeG(jd >= 6)}>
        <g transform="translate(120,58)">
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <ellipse
              key={deg}
              cx={0}
              cy={0}
              rx={11}
              ry={20}
              className="zhyFlower"
              transform={`rotate(${deg}) translate(0,-16)`}
            />
          ))}
          <circle r="14" className="zhyFlowerCore" cx={0} cy={0} />
          <circle r="9" className="zhyFlowerC" cx={0} cy={0} opacity={0.5} />
        </g>
      </g>

      {/* 繁盛微光粒子 7 */}
      <g style={fadeG(jd >= 7)}>
        {[32, 88, 160, 198, 128].map((x, i) => (
          <circle
            key={i}
            cx={x}
            cy={70 + (i % 3) * 14}
            r={2}
            fill="oklch(0.93 0.12 115)"
            className={`zhySpark zhySpark_${i}${i === 2 ? ' zhyGlowSoft' : ''}`}
          />
        ))}
      </g>
    </svg>
  );
}

export function ZhiYuHuaYuanApp() {
  const [state, setState] = useState<HuaYuanState>(() => loadHuaYuan());
  const [adoptNi, setAdoptNi] = useState('');
  const [micBloom, setMicBloom] = useState(false);
  const td = todayISO();

  const breath = useBreathMic(Boolean(micBloom && state.yi_ling_yang));

  const jieduan = useMemo(() => zhiWuJieDuan(state.lei_ji_yang_fen), [state.lei_ji_yang_fen]);
  const jieduanYu = useMemo(() => JIAN_DAO[jieduan] ?? JIAN_DAO[JIAN_DAO.length - 1], [jieduan]);

  const ganEnRiBen = state.gan_en_zhang?.find((e) => e.iso === td)?.wen_ben ?? '';

  useEffect(() => {
    const sync = () => setState(loadHuaYuan());
    window.addEventListener(ZHI_YU_HUA_YUAN_STORE_GAI_LE, sync);
    return () =>
      window.removeEventListener(ZHI_YU_HUA_YUAN_STORE_GAI_LE, sync);
  }, []);

  const dongLingYang = useCallback(() => {
    setState(wanChengTongLingHang(adoptNi));
  }, [adoptNi]);

  const jinRiLouMian = useCallback(() => {
    setState((prev) => zengJiaYangFen(prev, 'hua_yuan_lou_mian'));
  }, []);

  const [draftGanEn, setDraftGanEn] = useState('');

  useEffect(() => {
    setDraftGanEn(ganEnRiBen);
  }, [ganEnRiBen]);

  const cunGanEn = useCallback(() => {
    setState((prev) => baoCunGanEn(prev, draftGanEn));
  }, [draftGanEn]);

  const louMianJinJi = state.ri_ji_zhang.hua_yuanLouMianRi === td;

  return (
    <div className="zhyRoot mac-os-scrollbar">
      <h2 className="zhyHidden">虚拟治愈花园</h2>

      <div
        className="zhyFog"
        aria-hidden
        style={{
          opacity: Math.max(0.06, 0.42 - Math.min(state.lei_ji_yang_fen, 60) * 0.009),
        }}
      />

      <div className="zhyPeace">
        <strong>没有枯萎这回事。</strong>几天没来也不会惩罚你——这棵小植物会像生命本身一样，
        静静在这里；你回来时，它只是继续陪着你慢慢长。
      </div>
      <p className="zhyMuted">
        养分累积于本机浏览器：完成<strong>复原力每日练习任意一项</strong>、在小课堂<strong>点开科普文章</strong>，
        完成<strong>5-4-3-2-1 着陆箱</strong>或<strong>蓝屏急救包</strong>一轮、在<strong>自愈档案</strong>里读取下一章，
        或在本页写下<strong>感恩日记</strong> / 点<strong>今天在花园露面</strong>。
      </p>

      {!state.yi_ling_yang ? (
        <div className="zhyLay" style={{ position: 'relative' }}>
          <div className="zhyStage" />
          <div className="zhyAdoptMask">
            <div className="zhyAdoptCard">
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>🪴</div>
              <strong>在这座小园里领养一粒种子吧</strong>
              <div className="zhyMuted" style={{ marginTop: 8 }}>
                无需真实账号——只是在你自己的电脑里许下「我会照顾它」的陪伴。
              </div>
              <input
                className="zhyNick"
                value={adoptNi}
                onChange={(e) => setAdoptNi(e.target.value)}
                placeholder="起一个温柔的名字（可不填）"
                maxLength={24}
              />
              <button type="button" className="zhyBtn" onClick={dongLingYang}>
                我准备好照顾它了
              </button>
              <div className="zhyTiny" style={{ marginTop: 12 }}>
                领养即获得 +1 「见面礼」养分；之后会随你的日常慢慢生长。
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="zhyLay">
          <div className="zhyStage">
            <div className="zhyStageHead">
              <div style={{ fontWeight: 800, marginBottom: 4 }}>
                {state.ni_cheng ? `${state.ni_cheng}的树` : '小树'}
              </div>
              <div className="zhyMuted" style={{ lineHeight: 1.55 }}>
                {jieduanYu}
              </div>
              <div className="zhyMuted" style={{ marginTop: 8 }}>
                累计养分：<strong>{state.lei_ji_yang_fen}</strong>
              </div>
            </div>
            <div
              className="zhyPotWrap"
              style={{
                position: 'relative',
                paddingBottom: 16,
                transform: `scale(${1 + breath.intensity * 0.12})`,
                transformOrigin: 'center bottom',
                transition: 'transform 0.22s ease-out',
                filter: breath.isBlowing
                  ? `hue-rotate(${Math.round(breath.intensity * 22)}deg)`
                  : undefined,
              }}
            >
              <div className="zhyGlow" aria-hidden />
              <YuanZhongZhiWu jie_duan={jieduan} />
            </div>
          </div>

          <div className="zhyPanel">
            <section className="zhyCard">
              <h3>温柔吹气（可选）</h3>
              <p className="zhyMuted">
                开启麦克风后，轻轻朝设备吹一口气——花盆里的小家伙会像接住暖风一样<strong>微微舒张</strong>（仅在本地分析音量频谱，不录音、不上传）。
              </p>
              <label className="zhyMuted" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={micBloom}
                  onChange={(e) => setMicBloom(e.target.checked)}
                />
                启用麦克风吹气反馈
                {breath.busy ? (
                  <span className="zhyTiny">校准中…</span>
                ) : null}
              </label>
              {breath.error ? (
                <p className="zhyTiny" style={{ color: '#b54a4a', marginTop: 8 }}>
                  {breath.error}
                </p>
              ) : null}
            </section>

            <section className="zhyCard">
              <h3>今天在花园露面</h3>
              <p className="zhyMuted">若今天还没点过，算一次温和的「我在这里」签到。</p>
              <button
                type="button"
                className="zhyBtn"
                onClick={jinRiLouMian}
                disabled={louMianJinJi}
              >
                {louMianJinJi ? '今天你已来过 ♡' : '今天来看看它'}
              </button>
            </section>

            <section className="zhyCard">
              <h3>感恩日记</h3>
              <p className="zhyMuted">一天内只在首次保存时记入养分；可多次修改措辞。</p>
              <textarea
                className="zhyTa"
                value={draftGanEn}
                onChange={(e) => setDraftGanEn(e.target.value)}
                placeholder={`例如：今天下午有人替我扶了一下门。\n三件小事里也欢迎只写一件事。`}
                spellCheck={false}
              />
              <div className="zhyBtns">
                <button
                  type="button"
                  className="zhyBtn"
                  disabled={!draftGanEn.trim()}
                  onClick={cunGanEn}
                >
                  保存今日的感恩
                </button>
              </div>
            </section>

            <section className="zhyCard">
              <h3>来自别处的养分</h3>
              <p className="zhyMuted">
                「复原力每日练习」任意一项完成、「知识小课堂」里<strong>打开一篇文章阅读</strong>，
                都会在本机记入养分——即使疗愈花园此刻没开着，小树也已经悄悄长了一点点；重新打开时会自动对上进度。
              </p>
              <button
                type="button"
                className="zhyGhost zhyBtn"
                onClick={() => setState(loadHuaYuan())}
              >
                从本地重新读取状态
              </button>
              <span className="zhyMuted zhyTiny" style={{ display: 'block', marginTop: 6 }}>
                内容仍属自我关怀工具，不可替代专业心理治疗。
              </span>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
