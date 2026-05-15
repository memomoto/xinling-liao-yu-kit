import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import './desk-core-objects.css';

import { XiaonuanPlushDollShelf } from '@/components/hub-shell/xiaonuan-plush-doll';
import { STORAGE_KEYS } from '@/lib/storage-keys';

const WARM_PHRASES = [
  '今天你也很棒哦，慢慢来就好～',
  '累了就歇一小会儿，没关系。',
  '你的感受很重要，不必道歉。',
  '深呼吸一下，我在这儿陪着你。',
  '不用逞强，柔软也是一种力量。',
];

type ModalKind = 'xiaonuan' | 'shredder' | 'balloon' | null;

function playShredSound() {
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc.stop(ctx.currentTime + 0.24);
  } catch {
    /* ignore */
  }
}

function saveXiaonuanLetter(body: string) {
  try {
    const prev = localStorage.getItem(STORAGE_KEYS.XIAONUAN_MAIL);
    const arr = prev ? (JSON.parse(prev) as { t: number; text: string }[]) : [];
    arr.push({ t: Date.now(), text: body.trim() });
    localStorage.setItem(STORAGE_KEYS.XIAONUAN_MAIL, JSON.stringify(arr.slice(-80)));
  } catch {
    /* ignore */
  }
}

type StudyRoomWidgetCtx = {
  bubbleText: string | null;
  openModal: (k: Exclude<ModalKind, null>) => void;
  modal: ModalKind;
  draft: string;
  setDraft: (v: string) => void;
  closeModal: () => void;
  confirmModal: () => void;
  shredPreview: string;
  shredding: boolean;
  chips: number[];
  balloonLabel: string;
  flying: boolean;
  toast: string;
  /** 短时提示（与碎纸机/气球等共用顶栏 toast 样式） */
  showToast: (msg: string) => void;
};

const Ctx = createContext<StudyRoomWidgetCtx | null>(null);

export function useStudyRoomWidgets(): StudyRoomWidgetCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStudyRoomWidgets must be used within StudyRoomWidgetsProvider');
  return v;
}

export function StudyRoomWidgetsProvider({ children }: { children: ReactNode }) {
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalKind>(null);
  const [draft, setDraft] = useState('');
  const [shredPreview, setShredPreview] = useState('');
  const [shredding, setShredding] = useState(false);
  const [balloonLabel, setBalloonLabel] = useState('');
  const [flying, setFlying] = useState(false);
  const [chips, setChips] = useState<number[]>([]);
  const [toast, setToast] = useState('');

  const speechTimer = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(''), 2600);
  }, []);

  useEffect(() => {
    const tick = () => {
      const phrase = WARM_PHRASES[Math.floor(Math.random() * WARM_PHRASES.length)] ?? WARM_PHRASES[0]!;
      setBubbleText(phrase);
      window.setTimeout(() => setBubbleText(null), 4200);
    };
    tick();
    speechTimer.current = window.setInterval(tick, 11_000);
    return () => {
      if (speechTimer.current) window.clearInterval(speechTimer.current);
    };
  }, []);

  const openModal = useCallback((k: Exclude<ModalKind, null>) => {
    if (k === 'shredder' && shredding) return;
    if (k === 'balloon' && flying) return;
    setModal(k);
    setDraft('');
  }, [shredding, flying]);

  const closeModal = useCallback(() => {
    setModal(null);
    setDraft('');
  }, []);

  const confirmModal = useCallback(() => {
    const text = draft.trim();
    if (!text) {
      closeModal();
      return;
    }
    if (modal === 'xiaonuan') {
      saveXiaonuanLetter(text);
      showToast('小暖已经收到你的信笺啦。');
      closeModal();
      return;
    }
    if (modal === 'shredder') {
      closeModal();
      setShredPreview(text.slice(0, 280));
      window.setTimeout(() => {
        setShredding(true);
        playShredSound();
        const ids = Array.from({ length: 7 }, (_, i) => Date.now() + i);
        window.setTimeout(() => setChips(ids), 350);
        window.setTimeout(() => {
          setShredding(false);
          setShredPreview('');
          setChips([]);
        }, 2200);
      }, 80);
      return;
    }
    if (modal === 'balloon') {
      closeModal();
      setBalloonLabel(text.slice(0, 48));
      window.setTimeout(() => {
        setFlying(true);
        window.setTimeout(() => {
          setFlying(false);
          setBalloonLabel('');
        }, 5200);
      }, 60);
    }
  }, [draft, modal, closeModal, showToast]);

  const value = useMemo(
    () => ({
      bubbleText,
      openModal,
      modal,
      draft,
      setDraft,
      closeModal,
      confirmModal,
      shredPreview,
      shredding,
      chips,
      balloonLabel,
      flying,
      toast,
      showToast,
    }),
    [
      balloonLabel,
      bubbleText,
      chips,
      closeModal,
      confirmModal,
      draft,
      flying,
      modal,
      openModal,
      shredPreview,
      shredding,
      showToast,
      toast,
    ],
  );

  const modalTitle =
    modal === 'xiaonuan' ? '给小暖写信' : modal === 'shredder' ? '写下烦恼并粉碎' : modal === 'balloon' ? '写在气球上放飞' : '';

  const primaryLabel =
    modal === 'xiaonuan' ? '投递' : modal === 'shredder' ? '粉碎' : modal === 'balloon' ? '放飞' : '';

  return (
    <Ctx.Provider value={value}>
      {children}
      {modal ? (
        <div
          className="dco-modal-back dco-interactive"
          role="presentation"
          onMouseDown={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="dco-modal" role="document" onMouseDown={(e) => e.stopPropagation()}>
            <h3>{modalTitle}</h3>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="写点什么吧…"
              autoFocus
            />
            <div className="dco-modal-actions">
              <button type="button" className="dco-btn-ghost" onClick={closeModal}>
                取消
              </button>
              <button type="button" className="dco-btn-primary" onClick={confirmModal}>
                {primaryLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {toast ? <div className="dco-toast">{toast}</div> : null}
    </Ctx.Provider>
  );
}

/** 墙面悬浮隔板上的小暖：矢量玩偶 + 气泡；点击仍为「小暖信箱」入口 */
export function XiaonuanWallSpot() {
  const { bubbleText, openModal } = useStudyRoomWidgets();

  return (
    <div className="dco-xiaonuan-wall dco-interactive dco-xiaonuan-wall--plush">
      {bubbleText ? (
        <div className="dco-bubble" aria-live="polite">
          {bubbleText}
        </div>
      ) : null}
      <button type="button" className="dco-xiaonuan-fig-btn" onClick={() => openModal('xiaonuan')} aria-label="小暖信箱">
        <XiaonuanPlushDollShelf />
      </button>
    </div>
  );
}

/** 窗外风景层上的气球（在幕布之下，幕布放下时会遮住）。样式见 immersive-study-room.css `.balloon-wrap`。 */
export function BalloonOutsideWindow() {
  const { balloonLabel, flying, openModal } = useStudyRoomWidgets();
  const label = balloonLabel.trim();
  const displayText = label || '气球';
  const fontSize = displayText.length > 14 ? 8 : displayText.length > 8 ? 10 : 12;

  return (
    <button
      type="button"
      className={`balloon-wrap dco-interactive${flying ? ' balloon-wrap--flying' : ''}`}
      title="点击释放情绪"
      disabled={flying}
      onClick={() => openModal('balloon')}
      aria-label="放飞气球"
    >
      <svg width="60" height="84" viewBox="0 0 60 84" aria-hidden>
        <ellipse cx="30" cy="30" rx="22" ry="26" fill="#e03a3a" />
        <ellipse cx="30" cy="30" rx="22" ry="26" fill="none" stroke="#c02020" strokeWidth="1" />
        <ellipse cx="22" cy="20" rx="6" ry="7" fill="rgba(255,255,255,0.28)" />
        <polygon points="30,54 26,62 34,62" fill="#e03a3a" />
        <line x1="30" y1="62" x2="30" y2="84" stroke="#8b4513" strokeWidth="1.5" strokeDasharray="3 2" />
        <text
          x="30"
          y="34"
          fontSize={fontSize}
          fill="white"
          textAnchor="middle"
          fontFamily="sans-serif"
          opacity={0.85}
        >
          {displayText}
        </text>
      </svg>
    </button>
  );
}

/** 书桌右下角碎纸机 */
export function ShredderOnDesk() {
  const { shredPreview, shredding, chips, openModal } = useStudyRoomWidgets();

  return (
    <div className="dco-shred-wrap dco-shred-wrap--desk dco-interactive">
      {shredPreview ? (
        <div className={`dco-paper ${shredding ? 'dco-paper--in' : ''}`} aria-hidden>
          {shredPreview}
        </div>
      ) : null}
      <div className="dco-chips" aria-hidden>
        {chips.map((id, i) => (
          <span
            key={id}
            className="dco-chip"
            style={
              {
                left: `${28 + i * 9}%`,
                animationDelay: `${i * 45}ms`,
                ['--dco-rot' as string]: `${-18 + i * 6}deg`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <button
        type="button"
        className="dco-shredder"
        disabled={shredding}
        onClick={() => openModal('shredder')}
        aria-label="情绪粉碎机"
      >
        <i className="fa-solid fa-bolt dco-shred-icon" aria-hidden />
        <span>AUTO SHREDDER</span>
        <span className="dco-shredder-slot" />
      </button>
    </div>
  );
}
