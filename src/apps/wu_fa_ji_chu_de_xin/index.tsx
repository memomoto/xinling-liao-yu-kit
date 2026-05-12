/**
 * 📮 无法寄出的信 — 封存 / 星光 / 阅后即焚
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import './wu_fa_ji_chu_de_xin.css';
import {
  type XinShouJianRen,
  SHOU_JIANREN_LABEL,
  type FengCunXin,
  type WuFaXinCangKu,
  jiZaiWuFaXin,
  fengRenXinJiRuKu,
  yiChuYiFeng,
  jiYiXingGuangJuYi,
  jiYiYueHouJuYi,
} from './xin_xiang_cun_chu';

/** 固定在视口中的遮罩 — 穿出 XP 子窗口裁剪 */
function PoMoDaoBody({ children }: { children: ReactNode }) {
  const [mount, setMount] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMount(document.body);
  }, []);

  if (!mount) return null;
  return createPortal(children, mount);
}

function XinGuangWu({ active, onFinish }: { active: boolean; onFinish: () => void }) {
  const dots = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        id: i,
        left: `${3 + Math.random() * 94}%`,
        delayMs: Math.floor(Math.random() * 620),
      })),
    [active],
  );

  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(onFinish, 2600);
    return () => window.clearTimeout(t);
  }, [active, onFinish]);

  if (!active) return null;

  return (
    <div className="ufOv">
      <div className="ufOvStar">
        {dots.map(({ id, left, delayMs }) => (
          <div
            key={id}
            className="ufStarDot"
            style={{ left, animationDelay: `${delayMs}ms` }}
          />
        ))}
      </div>
      <div className="ufOvMsg">这封信没有再被锁进抽屉——它散开成很轻的光点，飘过你的夜空。</div>
    </div>
  );
}

function FenShaGuoWu({ active, onFinish }: { active: boolean; onFinish: () => void }) {
  useEffect(() => {
    if (!active) return;
    const t = window.setTimeout(onFinish, 1850);
    return () => window.clearTimeout(t);
  }, [active, onFinish]);

  if (!active) return null;

  return (
    <div className="ufOv ufBurnOv">
      <div className="ufBurnFlame" aria-hidden />
      <div className="ufOvMsg" style={{ zIndex: 2 }}>
        纸边卷起、化作灰烟——你已允许它离场。不必再给谁寄出。
      </div>
    </div>
  );
}

export function WuFaJiChuDeXinApp() {
  const [ku, setKu] = useState<WuFaXinCangKu>(() => jiZaiWuFaXin());
  const [mianBan, setMianBan] = useState<'xie_zuo' | 'shan_ku'>('xie_zuo');
  const [shouJianRen, setShouJianRen] = useState<XinShouJianRen>('shang_hai_wo_de_ren');
  const [cao_gao, setCao_gao] = useState('');
  const [xingGuang, setXingGuang] = useState(false);
  const [fenShaoWu, setFenShaoWu] = useState(false);

  /** 阅后即焚：null | ti_shi（说明） | yue_du（只看一遍） */
  const [fenMo, setFenMo] = useState<null | 'ti_shi' | 'yue_du'>(null);
  const yiCiZwen = useRef('');

  const xin_you_wen = cao_gao.trim().length > 0;

  const shuaXing = () => setKu(jiZaiWuFaXin());

  const fengRuKu = () => {
    setKu((p) => fengRenXinJiRuKu(p, shouJianRen, cao_gao));
    setCao_gao('');
    setMianBan('shan_ku');
  };

  const kaiQiXingGuang = () => {
    if (!xin_you_wen) return;
    setXingGuang(true);
  };

  const wanChengXingGuang = useCallback(() => {
    setXingGuang(false);
    setKu((prev) => jiYiXingGuangJuYi(prev));
    setCao_gao('');
  }, []);

  const kaiQiYuehou = () => {
    if (!xin_you_wen) return;
    setFenMo('ti_shi');
  };

  const queRenFanHuiCi = () => {
    yiCiZwen.current = cao_gao;
    setFenMo('yue_du');
  };

  const zhiHangFenSha = () => {
    setFenMo(null);
    setFenShaoWu(true);
  };

  const wanChengFenSha = useCallback(() => {
    setFenShaoWu(false);
    setKu((p) => jiYiYueHouJuYi(p));
    setCao_gao('');
    yiCiZwen.current = '';
  }, []);

  const shanYiFeng = (id: string) => {
    if (!window.confirm('从封存库删掉这封信？仅此设备上的副本会消失。')) return;
    setKu((p) => yiChuYiFeng(p, id));
  };

  const SHOU_JIAN_ITEMS: XinShouJianRen[] = [
    'shang_hai_wo_de_ren',
    'guo_qu_de_zi_ji',
    'wei_lai_de_zi_ji',
  ];

  return (
    <div className="ufRoot mac-os-scrollbar">
      <h2 className="ufHidden">无法寄出的电子信箱：封存或告别</h2>
      <p className="ufHint">
        许多伤来自未曾被说出口的份量。这里不写真实地址、也不必寄出：
        写给你选的对象，再以你愿意的方式合上循环——仅存本机浏览器，不可替代专业心理治疗。
      </p>

      <div className="ufTabs">
        <button
          type="button"
          className="ufTab"
          data-on={mianBan === 'xie_zuo'}
          onClick={() => setMianBan('xie_zuo')}
        >
          写信台
        </button>
        <button
          type="button"
          className="ufTab"
          data-on={mianBan === 'shan_ku'}
          onClick={() => setMianBan('shan_ku')}
        >
          封存库（{ku.feng_xin_list.length}）
        </button>
      </div>

      <div className="ufLay">
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div className="ufRecipients">
            {SHOU_JIAN_ITEMS.map((key) => (
              <button
                key={key}
                type="button"
                className="ufRec"
                data-on={shouJianRen === key}
                onClick={() => setShouJianRen(key)}
              >
                {SHOU_JIANREN_LABEL[key]}
              </button>
            ))}
          </div>

          {mianBan === 'xie_zuo' ? (
            <div className="ufComposer">
              <textarea
                className="ufTa"
                value={cao_gao}
                spellCheck={false}
                placeholder={`写你想写却寄不出去的一段话……\n可以指责、道歉、道别，也可以说「我仍然恨你」——这里都接得住。\n`}
                onChange={(e) => setCao_gao(e.target.value)}
              />
              <div className="ufActs">
                <button type="button" className="ufPri" disabled={!xin_you_wen} onClick={fengRuKu}>
                  封存入库
                </button>
                <button
                  type="button"
                  className={`ufPri ufStar`}
                  disabled={!xin_you_wen}
                  onClick={kaiQiXingGuang}
                >
                  化为星光
                </button>
                <button
                  type="button"
                  className={`ufPri ufBurn`}
                  disabled={!xin_you_wen}
                  onClick={kaiQiYuehou}
                >
                  阅后即焚
                </button>
              </div>
              <div className="ufRite ufTiny">
                化为星光 · 不立字据；
                <br />
                阅后即焚 · 不会留存正文；
                <br />
                封存入库 · 可随时在此库房重读或删除。
              </div>
            </div>
          ) : (
            <div className="ufComposer">
              <div className="ufVault">
                {ku.feng_xin_list.length === 0 ? (
                  <p className="ufHint">封存库目前是空的——若有一天写完了却不知往哪搁，就把它存进来。</p>
                ) : (
                  [...ku.feng_xin_list]
                    .slice()
                    .reverse()
                    .map((xin: FengCunXin) => (
                      <article key={xin.id} className="ufCard">
                        <div className="ufCardHead">
                          <span>{SHOU_JIANREN_LABEL[xin.shou_jian_ren]}</span>
                          <time dateTime={new Date(xin.cun_ru_at).toISOString()}>
                            {new Date(xin.cun_ru_at).toLocaleString('zh-CN')}
                          </time>
                        </div>
                        <div className="ufBody">{xin.zheng_wen}</div>
                        <button
                          type="button"
                          className="ufDel"
                          onClick={() => shanYiFeng(xin.id)}
                        >
                          从库房撤下
                        </button>
                      </article>
                    ))
                )}
              </div>
            </div>
          )}
        </div>

        <aside style={{ flexShrink: 0 }}>
          <div className="ufCard" style={{ marginTop: mianBan === 'shan_ku' ? 0 : undefined }}>
            <strong>无声的仪式台账</strong>
            <div className="ufTiny">（不立正文，仅存次数）</div>
            <div className="ufTiny" style={{ marginTop: 8 }}>
              化为星光：{ku.ju_yi_ci?.xing_guang_ci ?? 0} 次
              <br />
              阅后即焚：{ku.ju_yi_ci?.yue_hou_ci ?? 0} 次
            </div>
            <button
              type="button"
              className="ufPri ufGhost"
              style={{
                marginTop: 12,
                width: '100%',
                padding: '6px',
                fontSize: '12px',
                fontWeight: 500,
              }}
              onClick={shuaXing}
            >
              从本地刷新
            </button>
          </div>
        </aside>
      </div>

      <PoMoDaoBody>
        <XinGuangWu active={xingGuang} onFinish={wanChengXingGuang} />
        <FenShaGuoWu active={fenShaoWu} onFinish={wanChengFenSha} />
      </PoMoDaoBody>

      <PoMoDaoBody>
        {fenMo !== null ? (
          <div className="ufModal">
            <div className="ufModalCard">
              {fenMo === 'ti_shi' ? (
                <>
                  <strong>阅后即焚</strong>
                  <p className="ufHint" style={{ marginTop: 8 }}>
                    确认后这封信<strong>不会被保存</strong>。你可以选择先阅读一遍，再按下焚毁；
                    就像把纸丢进火炉里——离开这个窗口就不会再找到它。
                  </p>
                  <div className="ufModalBtns" style={{ marginTop: 12 }}>
                    <button type="button" className="ufPri ufGhost" onClick={() => setFenMo(null)}>
                      放回编辑台
                    </button>
                    <button type="button" className="ufPri ufBurn" onClick={queRenFanHuiCi}>
                      阅读最后一遍
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <strong>这是你即将焚毁的那一版</strong>
                  <div className="ufModalScroll">{yiCiZwen.current}</div>
                  <div className="ufModalBtns">
                    <button type="button" className="ufPri ufGhost" onClick={() => setFenMo('ti_shi')}>
                      返回上一页
                    </button>
                    <button type="button" className="ufPri ufBurn" onClick={zhiHangFenSha}>
                      确认焚毁
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : null}
      </PoMoDaoBody>
    </div>
  );
}
