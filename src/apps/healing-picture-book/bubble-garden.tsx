/**
 * 疗愈主题泡泡花园：点选两只主题后进入故事
 */
import { useCallback } from 'react';
import { HEALING_THEMES } from './healing-themes';

/** 泡泡位置（百分比，随窗口变化） */
const BUBBLE_LAYOUT: { themeId: string; top: string; left: string; sizePx: number; delay: string }[] = [
  { themeId: 'cptsd', top: '10%', left: '6%', sizePx: 86, delay: '0s' },
  { themeId: 'family', top: '14%', left: '72%', sizePx: 92, delay: '0.4s' },
  { themeId: 'bullying', top: '48%', left: '4%', sizePx: 80, delay: '0.8s' },
  { themeId: 'anxiety', top: '52%', left: '78%', sizePx: 84, delay: '1.1s' },
  { themeId: 'grief', top: '28%', left: '40%', sizePx: 78, delay: '0.6s' },
];

const FONT = '"PingFang SC", "Microsoft YaHei", system-ui, sans-serif';

export function BubbleGarden({
  selectedIds,
  onToggleTheme,
  onConfirm,
  blowKey,
}: {
  selectedIds: string[];
  onToggleTheme: (id: string) => void;
  onConfirm: () => void;
  /** 父组件递增可触发一次「吹气」装饰动画 */
  blowKey: number;
}) {
  const toggle = useCallback(
    (id: string) => {
      onToggleTheme(id);
    },
    [onToggleTheme],
  );

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        position: 'relative',
        borderRadius: 18,
        overflow: 'hidden',
        fontFamily: FONT,
        background: `
          radial-gradient(ellipse 120% 80% at 50% -20%, rgba(255, 228, 248, 0.9) 0%, transparent 55%),
          radial-gradient(ellipse 90% 60% at 100% 60%, rgba(199, 210, 254, 0.45) 0%, transparent 50%),
          radial-gradient(ellipse 70% 50% at 0% 80%, rgba(207, 250, 254, 0.4) 0%, transparent 45%),
          linear-gradient(175deg, #1e1b4b 0%, #312e81 22%, #4c1d95 55%, #5b21b6 100%)
        `,
        boxShadow: 'inset 0 0 80px rgba(255,255,255,0.06)',
      }}
    >
      <style>{`
        @keyframes healing-bubble-float {
          0%, 100% { transform: translateY(0) translateX(0); }
          33% { transform: translateY(-10px) translateX(4px); }
          66% { transform: translateY(6px) translateX(-5px); }
        }
        @keyframes healing-cloud-drift {
          from { transform: translateX(-3%); opacity: 0.35; }
          to { transform: translateX(3%); opacity: 0.5; }
        }
        @keyframes healing-wisp {
          0% { transform: translateY(100%) scale(0.4); opacity: 0; }
          20% { opacity: 0.7; }
          100% { transform: translateY(-120%) scale(1); opacity: 0; }
        }
      `}</style>

      {/* 梦核云层 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '6%',
            left: '-10%',
            width: '55%',
            height: '22%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(255,255,255,0.14) 0%, transparent 70%)',
            filter: 'blur(24px)',
            animation: 'healing-cloud-drift 18s ease-in-out infinite alternate',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '12%',
            right: '-5%',
            width: '48%',
            height: '18%',
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(216, 180, 254, 0.2) 0%, transparent 70%)',
            filter: 'blur(28px)',
            animation: 'healing-cloud-drift 22s ease-in-out infinite alternate-reverse',
          }}
        />
      </div>

      {/* 吹气产生的小空泡 */}
      {blowKey > 0 && (
        <div
          key={blowKey}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${18 + i * 16}%`,
                bottom: '8%',
                width: 12 + (i % 3) * 6,
                height: 12 + (i % 3) * 6,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.45)',
                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5), transparent 60%)',
                animation: `healing-wisp ${2.4 + i * 0.15}s ease-out forwards`,
                animationDelay: `${i * 0.08}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* 主题泡泡 */}
      {BUBBLE_LAYOUT.map((slot) => {
        const theme = HEALING_THEMES.find((t) => t.id === slot.themeId);
        if (!theme) return null;
        const selected = selectedIds.includes(theme.id);
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => toggle(theme.id)}
            title={theme.label}
            style={{
              position: 'absolute',
              top: slot.top,
              left: slot.left,
              width: slot.sizePx,
              height: slot.sizePx,
              borderRadius: '50%',
              border: selected ? `3px solid ${theme.rimColor}` : `2px solid rgba(255,255,255,0.35)`,
              background: theme.bubbleGradient,
              boxShadow: selected
                ? `0 0 28px ${theme.rimColor}, inset 0 0 20px rgba(255,255,255,0.5)`
                : '0 8px 24px rgba(0,0,0,0.25), inset -4px -8px 16px rgba(255,255,255,0.25)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 8,
              transform: selected ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              animation: `healing-bubble-float 5s ease-in-out infinite`,
              animationDelay: slot.delay,
              zIndex: 4,
              color: '#3b0764',
              fontSize: Math.max(10, slot.sizePx * 0.14),
              fontWeight: 700,
              textAlign: 'center',
              lineHeight: 1.25,
              textShadow: '0 0 12px rgba(255,255,255,0.9)',
            }}
          >
            {theme.shortLabel}
          </button>
        );
      })}

      {/* 说明 + 确认 */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 5,
          padding: 'clamp(12px, 3vmin, 20px)',
          background:
            'linear-gradient(to top, rgba(15, 23, 42, 0.92) 0%, rgba(30, 27, 75, 0.55) 70%, transparent 100%)',
        }}
      >
        <p
          style={{
            margin: '0 0 10px',
            fontSize: 'clamp(12px, 1.5vmin, 15px)',
            color: 'rgba(237, 233, 254, 0.95)',
            lineHeight: 1.65,
            textAlign: 'center',
            textShadow: '0 0 20px rgba(167, 139, 250, 0.5)',
          }}
        >
          选两颗最贴近你的泡泡——不用急，它们会轻轻停在这里等你。
          <br />
          <span style={{ opacity: 0.85, fontSize: '0.92em' }}>
            （已选 {selectedIds.length} / 2）点一下选中，再点一下取消。
          </span>
        </p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            disabled={selectedIds.length !== 2}
            onClick={onConfirm}
            style={{
              padding: '12px 28px',
              fontSize: 'clamp(13px, 1.5vmin, 16px)',
              fontWeight: 700,
              border: 'none',
              borderRadius: 999,
              cursor: selectedIds.length === 2 ? 'pointer' : 'not-allowed',
              opacity: selectedIds.length === 2 ? 1 : 0.45,
              background: 'linear-gradient(90deg, rgba(244, 114, 182, 0.95), rgba(167, 139, 250, 0.95))',
              color: '#fff',
              boxShadow: '0 4px 24px rgba(168, 85, 247, 0.45)',
            }}
          >
            戳破泡泡，去故事里
          </button>
        </div>
      </div>
    </div>
  );
}

export function BlowBubbleButton({ onBlow }: { onBlow: () => void }) {
  return (
    <button
      type="button"
      onClick={onBlow}
      style={{
        flexShrink: 0,
        alignSelf: 'center',
        marginTop: 8,
        padding: '8px 20px',
        fontSize: 'clamp(11px, 1.3vmin, 13px)',
        fontWeight: 600,
        border: '1px solid rgba(196, 181, 253, 0.5)',
        borderRadius: 999,
        cursor: 'pointer',
        background: 'rgba(255,255,255,0.12)',
        color: '#e9d5ff',
        fontFamily: FONT,
      }}
    >
      吹一口气 · 看更多小泡泡飘起来
    </button>
  );
}
