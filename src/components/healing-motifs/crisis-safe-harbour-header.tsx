import './healing-motifs.css';

/** 灯塔、提灯光晕、浅水救生圈 — 着陆工具箱顶部的避风港意象 */
export function CrisisSafeHarbourHeader() {
  return (
    <div className="fmCrisisHeader" role="region" aria-labelledby="fm-crisis-title">
      <svg width="100" height="72" viewBox="0 0 100 72" aria-hidden focusable={false}>
        <defs>
          <radialGradient id="fmLanternG" cx="50%" cy="50%" r="52%">
            <stop offset="0%" stopColor="rgba(255,236,212,0.95)" />
            <stop offset="70%" stopColor="rgba(255,210,160,0.45)" />
            <stop offset="100%" stopColor="rgba(255,200,150,0)" />
          </radialGradient>
        </defs>

        {/* 救生圈 */}
        <ellipse cx="74" cy="44" rx="22" ry="17" fill="rgba(252,246,238,0.88)" stroke="rgba(238,206,164,0.55)" strokeWidth="6" />
        <ellipse cx="74" cy="44" rx="10" ry="7" fill="rgba(246,239,226,0.55)" />

        {/* 灯塔 */}
        <path
          d="M22 60 L26 44 L44 42 L52 62 Z"
          fill="rgba(220,226,238,0.55)"
          stroke="rgba(150,164,182,0.45)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <rect x="38" y="28" width="22" height="18" rx="3" fill="rgba(250,246,238,0.75)" stroke="rgba(214,206,188,0.6)" strokeWidth="2.5" />
        <polygon points="41,26 52,26 54,30 51,38 43,37" fill="rgba(255,246,226,0.88)" />

        {/* 提灯光晕 */}
        <circle cx="14" cy="34" r="26" fill="url(#fmLanternG)" />
        <rect x="4" y="30" width="22" height="28" rx="7" fill="rgba(252,246,238,0.9)" stroke="rgba(226,208,174,0.55)" strokeWidth="2.5" />
        <rect x="10" y="22" width="10" height="10" rx="2" fill="rgba(255,248,226,0.95)" stroke="rgba(230,206,154,0.45)" strokeWidth="2" />
      </svg>
      <div className="fmCrisisHeaderCopy">
        <div className="fmCrisisHeaderEyebrow" id="fm-crisis-title">
          安全停泊处
        </div>
        若你心里正经历风暴或有伤害自己的念头，请先联系身边值得信赖的人与本地心理急救热线。
        这里是一盏小口灯与水边的浮标：你可以在此放慢呼吸<strong>换气</strong>，它不能替代专业服务。
      </div>
    </div>
  );
}
