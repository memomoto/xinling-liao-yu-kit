/**
 * 桌面壁纸之上：晨光、云层、露珠、半开花苞意象（仅占位矢量，不传图片）。
 */
import './healing-motifs.css';

export function HealingDesktopDawnAtmosphere() {
  return (
    <div className="fmDesktopDawn" aria-hidden role="presentation">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 520"
        preserveAspectRatio="xMidYMax slice"
        style={{ opacity: 0.78 }}
      >
        <defs>
          <linearGradient id="fmSun" x1="0%" y1="100%" x2="35%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,232,210,0.55)" />
            <stop offset="55%" stopColor="rgba(255,248,220,0.22)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <radialGradient id="fmDew" cx="48%" cy="78%" r="55%">
            <stop offset="0%" stopColor="rgba(230,246,255,0.42)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
          <linearGradient id="fmBud" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,190,208,0.35)" />
            <stop offset="100%" stopColor="rgba(255,248,250,0.75)" />
          </linearGradient>
        </defs>
        <rect width="800" height="520" fill="url(#fmSun)" />
        <ellipse cx="120" cy="108" rx="110" ry="38" fill="rgba(255,255,255,0.35)" opacity="0.9" />
        <ellipse cx="260" cy="92" rx="140" ry="42" fill="rgba(248,252,255,0.5)" opacity="0.85" />
        <ellipse cx="520" cy="118" rx="160" ry="48" fill="rgba(245,248,252,0.45)" opacity="0.8" />
        <ellipse cx="700" cy="108" rx="120" ry="44" fill="rgba(252,253,255,0.5)" />

        {[40, 120, 260, 400, 530, 650].map((x, i) => (
          <circle
            key={i}
            cx={x + (i % 2) * 12}
            cy={458 + ((i * 17) % 40)}
            r={5 + (i % 3) * 0.9}
            fill="rgba(255,255,255,0.55)"
            stroke="rgba(200,228,246,0.35)"
            strokeWidth="1"
          />
        ))}

        <ellipse cx="400" cy="480" rx="480" ry="140" fill="url(#fmDew)" />

        {/* 半开花苞 — 简略 Tulip-ish */}
        <g transform="translate(620 360) rotate(-12)">
          <path
            d="M0 0 C-12 -58 12 -92 42 -92 C74 -92 94 -62 94 -28 C94 22 62 72 44 118 C38 134 34 154 42 174"
            fill="none"
            stroke="rgba(118,148,132,0.35)"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path d="M-6 -118 C26 -154 94 -146 132 -118 C154 -98 160 -74 154 -54 C146 -88 126 -118 104 -138 C74 -154 42 -154 12 -146 C4 -154 -26 -154 -62 -138 C-90 -126 -118 -104 -134 -74 C-140 -118 -132 -154 -118 -174 C-106 -174 -94 -174 -82 -174 C-74 -174 -74 -174 -66 -174" fill="url(#fmBud)" opacity="0.85" />
        </g>

        {[80, 200, 360].map((sx, i) => (
          <g key={`c${i}`} transform={`translate(${sx} ${420 + i * 8}) scale(0.55)`}>
            <path
              d="M0 -20 Q30 -62 94 -74 Q152 -74 206 -36 Q258 22 274 118 Q262 174 226 226 Q174 274 118 294 Q58 310 22 294 Q-16 274 -52 246 Q-118 206 -154 154 Q-174 108 -174 74 Q-170 16 -154 -18 Q-110 -114 -62 -154 Q-42 -174 -26 -174"
              fill="#fffefb"
              fillOpacity={0.12 + i * 0.04}
              stroke="rgba(255,255,255,0.28)"
              strokeWidth="6"
              strokeLinejoin="round"
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
