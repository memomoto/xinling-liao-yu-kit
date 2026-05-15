import { useId } from 'react';

/** Vector plush for the left floating shelf — filter ids scoped with `useId()` for SSR-safe uniqueness. */
export function XiaonuanPlushDollShelf({ className }: { className?: string }) {
  const raw = useId();
  const uid = raw.replace(/[^a-zA-Z0-9]/g, '') || '0';
  const hairTextureId = `isrHairTexture${uid}`;
  const skirtTextureId = `isrSkirtTexture${uid}`;
  const hairUrl = `url(#${hairTextureId})`;
  const skirtUrl = `url(#${skirtTextureId})`;

  return (
    <div className={`isr-plush-doll ${className ?? ''}`}>
      <svg
        className="isr-plush-doll__svg"
        viewBox="0 0 360 420"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMax meet"
        overflow="visible"
        aria-hidden
      >
        <circle className="isr-plush-doll-bokeh" cx="50" cy="50" r="10" fill="#a0c8e8" />
        <circle
          className="isr-plush-doll-bokeh"
          cx="300"
          cy="100"
          r="15"
          fill="#a0c8e8"
          style={{ animationDelay: '1s' }}
        />
        <circle
          className="isr-plush-doll-bokeh"
          cx="100"
          cy="350"
          r="8"
          fill="#a0c8e8"
          style={{ animationDelay: '2.5s' }}
        />
        <circle
          className="isr-plush-doll-bokeh"
          cx="250"
          cy="380"
          r="12"
          fill="#a0c8e8"
          style={{ animationDelay: '4s' }}
        />

        <ellipse className="isr-plush-doll-shadow" cx="180" cy="408" rx="68" ry="10" fill="#c890b8" />

        <g className="doll-wrap">
          <g className="hair-layer">
            <path
              d="M110,120 Q120,100 140,90 Q160,80 180,82 Q200,80 220,90 Q240,100 250,120 Q260,150 255,180 Q250,210 230,230 Q210,250 180,252 Q150,250 130,230 Q110,210 105,180 Q100,150 110,120 Z"
              fill="#f9c0d8"
              filter={hairUrl}
            />
            <g id="hair-fibers" fill="none" stroke="#fad0e4" strokeWidth="0.5" opacity="0.5">
              <path d="M120,110 Q115,105 110,100" />
              <path d="M130,105 Q125,100 120,95" />
              <path d="M140,100 Q135,95 130,90" />
              <path d="M150,95 Q145,90 140,85" />
            </g>
            <path
              d="M145,130 Q160,115 180,118 Q200,115 215,130"
              stroke="#fbc0da"
              strokeWidth="2.5"
              fill="none"
              opacity="0.4"
            />
          </g>

          <ellipse cx="180" cy="158" rx="58" ry="62" fill="#fef0e8" />
          <ellipse cx="180" cy="168" rx="56" ry="58" fill="#fef4ec" />

          <g className="blush">
            <ellipse cx="148" cy="178" rx="12" ry="7" fill="#f4a0b8" opacity="0.55" />
            <ellipse cx="212" cy="178" rx="12" ry="7" fill="#f4a0b8" opacity="0.55" />
          </g>

          <g className="blink-group">
            <rect x="158" y="155" width="11" height="14" rx="4" fill="#3a8a72" />
            <rect x="191" y="155" width="11" height="14" rx="4" fill="#3a8a72" />
            <rect x="159" y="155" width="5" height="6" rx="2" fill="#5db89a" opacity="0.6" />
            <rect x="192" y="155" width="5" height="6" rx="2" fill="#5db89a" opacity="0.6" />
          </g>

          <path
            d="M170,178 Q180,187 190,178"
            stroke="#e87090"
            strokeWidth="2.8"
            fill="none"
            strokeLinecap="round"
          />
          <rect x="174" y="179" width="12" height="6" rx="2" fill="#e87090" opacity="0.7" />

          <ellipse cx="152" cy="170" rx="4" ry="3" fill="#e8a0b8" opacity="0.45" />
          <ellipse cx="208" cy="170" rx="4" ry="3" fill="#e8a0b8" opacity="0.45" />

          <g id="skirt-group">
            <path
              d="M130,240 Q100,265 95,300 Q90,330 108,340 Q140,360 180,362 Q220,360 252,340 Q270,330 265,300 Q260,265 230,240 Z"
              fill="#c89ad8"
              filter={skirtUrl}
            />
            <path
              d="M108,330 Q140,348 180,350 Q220,348 252,330 Q248,355 180,362 Q112,355 108,330 Z"
              fill="#b888cc"
            />

            <path
              d="M96,335 Q100,345 104,335 Q108,345 112,335 Q116,345 120,335 Q124,345 128,335 Q132,345 136,335 Q140,345 144,335 Q148,345 152,335 Q156,345 160,335 Q164,345 168,335 Q172,345 176,335 Q180,345 184,335 Q188,345 192,335 Q196,345 200,335 Q204,345 208,335 Q212,345 216,335 Q220,345 224,335 Q228,345 232,335 Q236,345 240,335 Q244,345 248,335 Q252,345 256,335 Q260,345 264,335"
              stroke="white"
              strokeWidth="12"
              fill="none"
              opacity="0.85"
              strokeLinecap="round"
            />
            <path
              d="M96,335 Q100,343 104,335 Q108,343 112,335 Q116,343 120,335 Q124,343 128,335 Q132,343 136,335 Q140,343 144,335 Q148,343 152,335 Q156,343 160,335 Q164,343 168,335 Q172,343 176,335 Q180,343 184,335 Q188,343 192,335 Q196,343 200,335 Q204,343 208,335 Q212,343 216,335 Q220,343 224,335 Q228,343 232,335 Q236,343 240,335 Q244,343 248,335 Q252,343 256,335 Q260,343 264,335"
              stroke="white"
              strokeWidth="10"
              fill="none"
              opacity="0.9"
              strokeLinecap="round"
            />

            <g className="isr-plush-doll-lace-layer">
              <path
                d="M96,336 Q100,330 104,336 Q108,330 112,336 Q116,330 120,336 Q124,330 128,336 Q132,330 136,336 Q140,330 144,336 Q148,330 152,336 Q156,330 160,336 Q164,330 168,336 Q172,330 176,336 Q180,330 184,336 Q188,330 192,336 Q196,330 200,336 Q204,330 208,336 Q212,330 216,336 Q220,330 224,336 Q228,330 232,336 Q236,330 240,336 Q244,330 248,336 Q252,330 256,336 Q260,330 264,336"
                stroke="#f8e8ff"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                opacity="0.9"
              />
              <path
                d="M96,342 Q100,348 104,342 Q108,348 112,342 Q116,348 120,342 Q124,348 128,342 Q132,348 136,342 Q140,348 144,342 Q148,348 152,342 Q156,348 160,342 Q164,348 168,342 Q172,348 176,342 Q180,348 184,342 Q188,348 192,342 Q196,348 200,342 Q204,348 208,342 Q212,348 216,342 Q220,348 224,342 Q228,348 232,342 Q236,348 240,342 Q244,348 248,342 Q252,348 256,342 Q260,348 264,342"
                stroke="#f8e8ff"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                opacity="0.9"
              />
            </g>
          </g>

          <g id="white-bow-group" className="white-bow-group">
            <path d="M140,240 Q160,230 178,245 Q160,260 140,240Z" fill="white" />
            <path d="M220,240 Q200,230 182,245 Q200,260 220,240Z" fill="white" />
            <circle cx="180" cy="245" r="7" fill="white" />
            <path d="M140,240 Q160,225 178,245" stroke="#f0f0f0" strokeWidth="2" fill="none" />
            <path d="M220,240 Q200,225 182,245" stroke="#f0f0f0" strokeWidth="2" fill="none" />
            <line x1="178" y1="248" x2="168" y2="265" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="182" y1="248" x2="192" y2="265" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          <circle
            cx="128"
            cy="130"
            r="5"
            fill="#ffddee"
            stroke="#e890b8"
            strokeWidth="1.5"
            style={{ transformOrigin: '128px 130px' }}
          />
          <circle
            cx="238"
            cy="118"
            r="4"
            fill="#ffddee"
            stroke="#e890b8"
            strokeWidth="1.5"
            style={{ transformOrigin: '238px 118px' }}
          />
          <circle
            cx="108"
            cy="165"
            r="3.5"
            fill="#fff0f8"
            stroke="#e890b8"
            strokeWidth="1.2"
            style={{ transformOrigin: '108px 165px' }}
          />
        </g>
        <defs>
          <filter id={hairTextureId} height="140%" width="140%" x="-20%" y="-20%">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" result="noise" />
            <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.8  0 0 0 0 0.8  0 0 0 0 0" result="colormatrix" />
            <feComposite operator="in" in="colormatrix" in2="SourceAlpha" result="composite" />
            <feMerge>
              <feMergeNode in="composite" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={skirtTextureId} height="130%" width="130%" x="-15%" y="-15%">
            <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="2" result="noise" />
            <feColorMatrix type="matrix" values="0.8 0 0 0 0  0 0.6 0 0 0  0 0 0.9 0 0  0 0 0 0 0" result="colormatrix" />
            <feComposite operator="in" in="colormatrix" in2="SourceAlpha" result="composite" />
            <feMerge>
              <feMergeNode in="composite" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}
