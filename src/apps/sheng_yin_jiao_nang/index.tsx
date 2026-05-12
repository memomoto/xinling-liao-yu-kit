/**
 * 🫂 声音胶囊 — 陌生人的温柔人声 / 必要时中文朗读兜底
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import './sheng_yin_jiao_nang.css';
import { JIAO_NANG_LIE, type ShengYinJiaoNangTiao } from './jiao_nang_pei_zhi';

function pickZhVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const list = speechSynthesis.getVoices();
  let best: SpeechSynthesisVoice | null = null;
  for (const v of list) {
    const l = v.lang?.toLowerCase() ?? '';
    if (!l.startsWith('zh')) continue;
    if (v.localService) return v;
    if (!best) best = v;
  }
  return best ?? list.find((v) => (v.lang?.toLowerCase() ?? '').includes('cn')) ?? null;
}

/** 单次朗读；与 HTMLAudioElement 并行前须先调用 stopPlayback（取消合成与 element） */
function speakText(text: string, onEnd: () => void): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    onEnd();
    return;
  }

  const trimmed = text.replace(/\s+/g, ' ').trim();
  let started = false;

  const runOnce = (): void => {
    if (started) return;
    started = true;
    speechSynthesis.cancel();

    try {
      const u = new SpeechSynthesisUtterance(trimmed);
      u.lang = 'zh-CN';
      u.rate = 0.9;
      u.pitch = 1;
      const v = pickZhVoice();
      if (v) u.voice = v;
      u.onend = () => onEnd();
      u.onerror = () => onEnd();
      speechSynthesis.speak(u);
    } catch {
      onEnd();
    }
  };

  if (speechSynthesis.getVoices().length === 0) {
    speechSynthesis.addEventListener('voiceschanged', runOnce, { once: true });
    window.setTimeout(runOnce, 600);
  } else {
    runOnce();
  }

  window.setTimeout(onEnd, 70000);
}

export function ShengYinJiaoNangApp() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const stopPlayback = useCallback(() => {
    speechSynthesis.cancel();
    const a = audioRef.current;
    if (a) {
      try {
        a.pause();
      } finally {
        a.src = '';
        a.removeAttribute('src');
      }
      audioRef.current = null;
    }
    setPlayingId(null);
  }, []);

  useEffect(() => () => stopPlayback(), [stopPlayback]);

  const handlePlay = useCallback(
    (tiao: ShengYinJiaoNangTiao) => {
      stopPlayback();

      const finish = (): void => {
        setPlayingId(null);
      };

      const src = (tiao.yin_pin ?? '').trim();
      if (!src) {
        setPlayingId(tiao.id);
        speakText(tiao.lang_du_wen, finish);
        return;
      }

      const el = document.createElement('audio');
      el.preload = 'auto';
      el.src = src;
      audioRef.current = el;
      let usedTtsFallback = false;

      const tryTts = (): void => {
        if (usedTtsFallback) return;
        usedTtsFallback = true;
        speechSynthesis.cancel();
        setPlayingId(tiao.id);
        speakText(tiao.lang_du_wen, finish);
      };

      el.addEventListener('error', tryTts, { once: true });
      el.addEventListener(
        'ended',
        () => {
          audioRef.current = null;
          finish();
        },
        { once: true }
      );

      void el
        .play()
        .then(() => {
          setPlayingId(tiao.id);
        })
        .catch(() => tryTts());
    },
    [stopPlayback]
  );

  const shufflePlay = (): void => {
    const list = [...JIAO_NANG_LIE];
    const i = Math.floor(Math.random() * list.length);
    handlePlay(list[i] as ShengYinJiaoNangTiao);
  };

  const isPlaying = Boolean(playingId);

  return (
    <div className="svcRoot svcScroll">
      <p className="svcTitle" role="heading" aria-level={2}>
        声音胶囊 · 深度共鸣
      </p>
      <p className="svcIntro">
        以下内容默认使用本机中文语音朗读。若你自行准备了匿名录制的 mp3，可在配置里填入地址后优先播放人声。
      </p>

      <div className="svcCtl">
        <button type="button" className="svcPri" disabled={!isPlaying} onClick={stopPlayback}>
          {isPlaying ? '停止播放' : '未在播放'}
        </button>
        <button type="button" className="svcPri svcGhost" onClick={shufflePlay}>
          随机一粒胶囊
        </button>
        <span className="svcChip">匿名 · ≤30″</span>
      </div>

      <span className="svcHiddenVisually" aria-live="polite">
        {playingId ? `正在播放编号 ${playingId}` : ''}
      </span>

      <div className="svcGrid" role="list">
        {(JIAO_NANG_LIE as readonly ShengYinJiaoNangTiao[]).map((tiao) => (
          <button
            key={tiao.id}
            type="button"
            role="listitem"
            data-playing={playingId === tiao.id ? 'true' : 'false'}
            className="svcCapsule"
            onClick={() => handlePlay(tiao)}
          >
            <span aria-hidden className="svcRipple" />
            <strong className="svcQuote">{tiao.jian_yu}</strong>
            <span className="svcSub">
              点击收听 · {(tiao.yin_pin ?? '').split('/').filter(Boolean).pop() ?? '本机朗读'}
            </span>
          </button>
        ))}
      </div>

      <p className="svcMuted">
        若您愿意为他人录制匿名安抚语音，可将 mp3 交给运营同学入库；产品上不会展示提供者身份。
      </p>
    </div>
  );
}
