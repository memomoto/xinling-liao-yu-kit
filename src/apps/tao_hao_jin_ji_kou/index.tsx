/**
 * 讨好模式紧急出口：温柔而坚定的拒绝话术（本地静态，无上传）。
 */

import { useMemo, useState } from 'react';

import { PaperButton } from '@/components/ui';

import './kind-boundary-exit.css';

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
      className={`kbe-chip${active ? ' kbe-chip--active' : ''}`.trim()}
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
    <div className="kbe-root paper-app-surface">
      <header>
        <h1 className="kbe-title">讨好模式 · 紧急出口</h1>
        <p className="kbe-lead">
          需要「温柔但坚定」的时候可以来这里借一句话。话术不是应付别人，是给当下的自己一小块立足之地——按标签筛选或直接搜索。
        </p>
      </header>

      <input
        type="search"
        className="kbe-search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="搜索关键词……"
      />

      <div className="kbe-chips">
        <Chip label="全部" active={tag == null} onClick={() => setTag(null)} />
        {tags.map((t) => (
          <Chip key={t} label={t} active={tag === t} onClick={() => setTag(tag === t ? null : t)} />
        ))}
      </div>

      <div className="kbe-list paper-app-scroll">
        {filtered.map((item, idx) => (
          <div key={`${item.tag}-${idx}`} className="kbe-entry">
            <span className="kbe-tag">#{item.tag}</span>
            <p className="kbe-text">{item.text}</p>
            <div className="kbe-copy-row">
              <PaperButton
                type="button"
                variant="secondary"
                className="kbe-copy-btn"
                onClick={() => copyOne(item.text)}
              >
                复制这句话
              </PaperButton>
            </div>
          </div>
        ))}
        {filtered.length === 0 ? <p className="kbe-empty">没有匹配的句子，试试别的关键词～</p> : null}
      </div>

      {toast ? (
        <div className="kbe-toast" role="status">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
