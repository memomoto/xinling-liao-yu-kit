/**
 * 讨好模式紧急出口：温柔而坚定的拒绝话术（本地静态，无上传）。
 */

import { useMemo, useState } from 'react';

const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", "PingFang SC", "Microsoft YaHei", sans-serif';

type Line = { text: string; tag: string };

const PHRASES: Line[] = [
  { tag: '时间', text: '我现在没有足够的精力接这件事，需要先照顾好自己这边。谢谢你理解。' },
  { tag: '时间', text: '这一轮我时间安排满了，没有办法帮上忙，希望你能找到其他人支援。' },
  { tag: '边界', text: '我更习惯用这样的方式沟通（线上留言 / 约具体时段），突然的打扰我会很难回应。' },
  { tag: '边界', text: '这个请求超出了我能承担的范围，我只能说不，并不是针对你这个人。' },
  { tag: '情感', text: '我很在意你的感受，但我也需要诚实——这件事我做不到。' },
  { tag: '情感', text: '我不想勉强答应之后又失约，所以选择现在就把真实想法告诉你。' },
  { tag: '工作', text: '这条不在我职责范围内；如果你需要，我可以把对接人引荐给你。' },
  { tag: '工作', text: '我目前的优先级在项目 A，暂时不能接手额外任务，我们下次再一起看排期可以吗？' },
  { tag: '社交', text: '我这段时间想安静一点社交，所以这次就不参加了，祝大家玩得开心。' },
  { tag: '社交', text: '我到场的话可能状态不好，反而扫兴——这次先婉拒啦。' },
  { tag: '家人', text: '我知道你是为我好，但这次我想按自己的节奏来试一次。' },
  { tag: '家人', text: '我可以听建议，最终决定还是希望自己来做，可以吗？' },
  { tag: '模糊', text: '我现在没办法给「立刻的 yes」，需要一点时间想一下，晚些再回复你可以吗？' },
  { tag: '模糊', text: '这个提议听起来不错，但对我来说还不合适——谢谢你想到了我。' },
  { tag: '身体', text: '身体最近有点吃不消，需要先休息一阵子，这些事情我就先推掉了。' },
  { tag: '金钱', text: '这笔钱 / 这个价格目前不在我的计划里，我暂时不能答应。' },
  { tag: '金钱', text: '帮忙可以，但这次我需要按市场价收费，你看这样可以吗？' },
  { tag: '亲密关系', text: '我很珍惜我们，但也要说我现在的底线在这里，希望我们都能轻松一点。' },
  { tag: '亲密关系', text: '当我觉得被挤压的时候，会先暂停一下对话，不是要冷战，是不想伤害彼此。' },
  { tag: '二次请求', text: '上次我已经说过不行了，再问下去我会觉得有点为难，我们聊点别的吧。' },
  { tag: '二次请求', text: '我理解你很急，但我的答案还是和之前一样，没办法改变。' },
  { tag: '亏欠感', text: '你帮我很多我很感激，但感激不等于我要答应所有请求，这次是「做不到」的一边。' },
  { tag: '沉默压力', text: '如果你需要我想清楚，也请给我不说话的空间——沉默不是敌意。' },
  { tag: '替代', text: '这个我做不到，如果你愿意的话可以看看 xxx 是否能帮上忙。' },
  { tag: '延迟', text: '今天能量很低，可不可以改天再讨论这件事？' },
  { tag: '自我价值', text: '拒绝的是你提出的这件事，不是我的价值；我依然尊重你，也尊重自己。' },
];

function Chip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '6px 12px',
        borderRadius: 999,
        border: active ? '1px solid rgba(90,140,230,0.55)' : '1px solid rgba(180,192,218,0.45)',
        background: active ? 'rgba(220,236,255,0.75)' : 'rgba(255,255,255,0.52)',
        fontFamily: FONT,
        fontSize: 12,
        fontWeight: 600,
        color: active ? 'rgba(32,54,112,0.9)' : 'rgba(62,74,96,0.75)',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

export function KindBoundaryExitApp() {
  const tags = useMemo(() => [...new Set(PHRASES.map((p) => p.tag))].sort(), []);
  const [q, setQ] = useState('');
  const [tag, setTag] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = PHRASES.filter((p) => {
    const mTag = tag == null || p.tag === tag;
    const needle = q.trim();
    const mNeedle = needle === '' || p.text.includes(needle);
    return mTag && mNeedle;
  });

  const copyOne = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast('已复制到剪贴板');
    } catch {
      setToast('复制失败：可手动选中文字');
    }
    window.setTimeout(() => setToast(null), 2200);
  };

  return (
    <div
      style={{
        fontFamily: FONT,
        minHeight: 480,
        padding: '16px 18px',
        borderRadius: 12,
        background: 'linear-gradient(170deg, #f7f8ff 0%, #eef3fa 100%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <header>
        <h1 style={{ margin: '0 0 6px', fontSize: 17, fontWeight: 700, color: 'rgba(32,42,58,0.92)' }}>
          讨好模式 · 紧急出口
        </h1>
        <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.55, color: 'rgba(58,70,90,0.72)' }}>
          需要「温柔但坚定」的时候可以来这里借一句话。话术不是应付别人，是给当下的自己一小块立足之地——按标签筛选或直接搜索。
        </p>
      </header>

      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="搜索关键词……"
        style={{
          padding: '10px 14px',
          borderRadius: 11,
          border: '1px solid rgba(200,210,230,0.65)',
          fontFamily: FONT,
          fontSize: 13,
          outline: 'none',
          background: 'rgba(255,255,255,0.78)',
        }}
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <Chip label="全部" active={tag == null} onClick={() => setTag(null)} />
        {tags.map((t) => (
          <Chip key={t} label={t} active={tag === t} onClick={() => setTag(tag === t ? null : t)} />
        ))}
      </div>

      <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4 }}>
        {filtered.map((item, idx) => (
          <article
            key={idx}
            style={{
              padding: '14px 14px',
              borderRadius: 12,
              background: 'rgba(255,255,255,0.72)',
              border: '1px solid rgba(220,226,243,0.85)',
              boxShadow: '0 6px 18px rgba(70,92,142,0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(120,140,178,0.85)', letterSpacing: '0.04em' }}>
              #{item.tag}
            </span>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.62, color: 'rgba(35,46,62,0.9)' }}>{item.text}</p>
            <button
              type="button"
              onClick={() => copyOne(item.text)}
              style={{
                alignSelf: 'flex-start',
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid rgba(160,190,240,0.55)',
                background: 'rgba(235,244,255,0.9)',
                fontFamily: FONT,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                color: 'rgba(36,58,108,0.88)',
              }}
            >
              复制这句话
            </button>
          </article>
        ))}
        {filtered.length === 0 && (
          <p style={{ margin: '18px auto', fontSize: 13, color: 'rgba(90,100,120,0.65)' }}>没有匹配的句子，试试别的关键词～</p>
        )}
      </div>

      {toast && (
        <div
          role="status"
          style={{
            position: 'sticky',
            bottom: 10,
            marginTop: -6,
            padding: '8px 12px',
            borderRadius: 10,
            background: 'rgba(40,62,122,0.88)',
            color: '#fafcff',
            fontSize: 12,
            textAlign: 'center',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
