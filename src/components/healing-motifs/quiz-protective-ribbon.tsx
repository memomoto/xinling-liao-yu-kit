import './healing-motifs.css';

/**
 * 保护伞、环抱、软盾与拼图隐喻 — 自问卷顶部提示「探索受保护接住」。
 */
export function QuizProtectiveHoldRibbon() {
  return (
    <div className="fmQuizRibbon" role="note">
      <svg width="72" height="56" viewBox="0 0 72 56" aria-hidden>
        {/* 柔和的伞弧线 */}
        <path
          d="M36 52 L36 32 M8 38 Q36 6 64 38"
          fill="none"
          stroke="rgba(120,150,175,0.45)"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path d="M8 38 Q36 26 64 38" fill="rgba(220,238,246,0.35)" />

        {/* 环抱双手暗示 */}
        <path
          d="M42 42 Q52 48 62 52 M30 42 Q20 48 10 52"
          fill="none"
          stroke="rgba(230,212,228,0.55)"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* 盾牌柔边 */}
        <path
          d="M54 26 L62 38 L62 48 Q58 54 54 52 Q50 54 46 48 L46 38 Z"
          fill="rgba(200,226,236,0.45)"
          stroke="rgba(150,178,188,0.5)"
          strokeWidth="2"
          transform="translate(-4,-4) scale(0.85)"
        />

        {/* 拼图一角 */}
        <path
          d="M52 14 h10 v10 h-10 v-10 M62 24 h6 v10 h-10 v4 h10 v10 h-14 v-6"
          fill="none"
          stroke="rgba(200,216,236,0.75)"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>
      <div className="fmQuizRibbonText">
        这些题目像在拼一幅关于自己的地图。
        <strong style={{ fontWeight: 600, color: 'rgba(50,72,94,0.88)' }}>
          这是一次带伞、带盾牌、带接缝的探索——怎样答都可以先被接住。
        </strong>
      </div>
    </div>
  );
}
