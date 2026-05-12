/**
 * 对话内在小孩 — 双栏意象聊天：现在的我 ⇄ 童年的我（模板句式引导）。
 */

import { useCallback, useEffect, useRef, useState } from 'react';

const FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';

type Lane = 'adult' | 'child';

interface Msg {
  lane: Lane;
  text: string;
  time: string;
}

const CHILD_HINTS = [
  '那时候我真的很害怕……',
  '我不知道该怎么做才被允许。',
  '我以为都是我的错。',
  '我其实只是想被安静地抱住。',
];

const ADULT_HINTS = [
  '我看见你了，你已经很努力在撑着。',
  '现在的我可以陪着你把那口气喘匀。',
  '那些事不应该全部由你来扛。',
  '你已经走到这里，这一刻也值得被温柔接住。',
];

function nowStr() {
  const d = new Date();
  const z = (n: number) => `${n < 10 ? '0' : ''}${n}`;
  return `${z(d.getHours())}:${z(d.getMinutes())}`;
}

export function MsnApp() {
  const [lane, setLane] = useState<Lane>('adult');
  const [messages, setMessages] = useState<Msg[]>([
    {
      lane: 'child',
      text: '（童年的你还没有说话……可以先选一个句式开头）',
      time: nowStr(),
    },
  ]);
  const [input, setInput] = useState('');
  const scrollAdult = useRef<HTMLDivElement>(null);
  const scrollChild = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollAdult.current && (scrollAdult.current.scrollTop = scrollAdult.current.scrollHeight);
    scrollChild.current && (scrollChild.current.scrollTop = scrollChild.current.scrollHeight);
  }, [messages]);

  const send = useCallback(() => {
    const t = input.trim();
    if (!t) return;
    const active = lane;
    setMessages((m) => [...m, { lane: active, text: t, time: nowStr() }]);
    setInput('');
  }, [input, lane]);

  const adultMsgs = messages.filter((x) => x.lane === 'adult');
  const childMsgs = messages.filter((x) => x.lane === 'child');

  const column = (
    label: string,
    sub: string,
    color: string,
    laneKey: Lane,
    list: Msg[],
    scrollRef: React.RefObject<HTMLDivElement | null>,
    hints: string[],
  ) => (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        border: lane === laneKey ? `2px solid ${color}` : '1px solid rgba(0,0,0,0.08)',
        borderRadius: 12,
        overflow: 'hidden',
        background: '#fafafa',
      }}
    >
      <button
        type="button"
        onClick={() => setLane(laneKey)}
        style={{
          padding: '8px 10px',
          background: lane === laneKey ? `${color}18` : '#ececec',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 700 }}>{label}</div>
        <div style={{ fontSize: 10, color: '#666' }}>{sub}</div>
      </button>
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {list.map((msg, i) => (
          <div key={`${laneKey}-${i}-${msg.time}`} style={{ alignSelf: 'stretch' }}>
            <span style={{ fontSize: 9, color: '#999' }}>{msg.time}</span>
            <div style={{ fontSize: 12, lineHeight: 1.55, padding: '6px 8px', borderRadius: 8, background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '4px 6px', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
        {hints.map((h) => (
          <button
            key={h}
            type="button"
            onClick={() => setInput(h)}
            style={{
              fontSize: 10,
              padding: '3px 6px',
              borderRadius: 999,
              border: '1px solid rgba(0,0,0,0.1)',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            {h.slice(0, 14)}…
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#fff', fontFamily: FONT }}>
      <div style={{ padding: '10px 12px', background: 'linear-gradient(180deg,#eef5ff,#dde9ff)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>跨越时空的对话</div>
        <div style={{ fontSize: 11, color: '#515154', marginTop: 4 }}>
          点按一栏选定<strong>发送身份</strong>，在下面输入——两边都是你，只是在练习整合。
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: 8, padding: 8 }}>
        {column('现在的我', '成人视角 · 安全与支持', '#007aff', 'adult', adultMsgs, scrollAdult, ADULT_HINTS)}
        {column('童年的我', '内在小孩 · 感受与记忆', '#ff9fae', 'child', childMsgs, scrollChild, CHILD_HINTS)}
      </div>

      <div style={{ display: 'flex', borderTop: '1px solid rgba(0,0,0,0.08)', background: '#fff', alignItems: 'stretch' }}>
        <span style={{ alignSelf: 'center', paddingLeft: 8, fontSize: 11, color: '#86868b', flexShrink: 0 }}>
          发送至「{lane === 'adult' ? '现在的我' : '童年的我'}」
        </span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="写完一句话就好……"
          style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 10px', fontFamily: FONT, fontSize: 13 }}
        />
        <button
          type="button"
          onClick={send}
          style={{
            background: lane === 'adult' ? '#007aff' : '#ff6b8a',
            color: '#fff',
            border: 'none',
            padding: '0 14px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          发送
        </button>
      </div>
    </div>
  );
}
