import './healing-motifs.css';

interface Props {
  ymd: string;
  /** 当周日期 ISO yyyy-mm-dd */
  todayISO: string;
  done: boolean;
}

/** 用「一周内的小气候」替代圆点刻度：晴雨云风都是自然节律，无褒贬。 */

function dowLabel(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number) as number[];
  if (!y || !m || !d) return '';
  const dt = new Date(y, m - 1, d);
  const w = dt.getDay();
  const lbl = ['日', '一', '二', '三', '四', '五', '六'][w] ?? '?';
  return `周${lbl}`;
}

/** 同一天：晴空；已过期有练习：微风；缺席：小雨晕；未到：密云 */
function MoodGlyph({ variant }: { variant: 'sun' | 'breeze' | 'drizzle' | 'cloud' | 'mist' }) {
  const sx = { display: 'block' as const, margin: '0 auto' };

  switch (variant) {
    case 'sun':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" style={sx} aria-hidden>
          <circle cx="14" cy="14" r="7.5" fill="rgba(255,248,226,0.95)" stroke="rgba(252,226,154,0.55)" strokeWidth="2.5" />
          {[...Array(8)].map((_, i) => {
            const a = (Math.PI * 2 * i) / 8 - Math.PI / 2;
            const x1 = 14 + Math.cos(a) * 10;
            const y1 = 14 + Math.sin(a) * 10;
            const x2 = 14 + Math.cos(a) * 13.5;
            const y2 = 14 + Math.sin(a) * 13.5;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,224,154,0.55)" strokeWidth="3.2" strokeLinecap="round" />;
          })}
        </svg>
      );
    case 'breeze':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" style={sx} aria-hidden>
          <path d="M4 17 Q14 13 26 17" stroke="rgba(154,206,226,0.75)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
          <path d="M6 12 Q14 10 24 13" stroke="rgba(174,226,246,0.55)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="8" cy="20" r="2" fill="rgba(226,246,238,0.55)" opacity="0.9" />
        </svg>
      );
    case 'drizzle':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" style={sx} aria-hidden>
          <ellipse cx="14" cy="12" rx="12" ry="7" fill="rgba(234,246,254,0.65)" stroke="rgba(206,226,246,0.55)" strokeWidth="2.5" />
          <path d="M10 21 L11 26 M14 21 L15 27 M17 21 L18 25" stroke="rgba(174,216,246,0.7)" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case 'cloud':
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" style={sx} aria-hidden>
          <path
            d="M22 21 H8 Q4 21 6 17 Q8 13 13 13 Q13 11 17 13 Q21 13 22 17 Q26 21 22 21"
            fill="rgba(244,246,252,0.55)"
            stroke="rgba(220,228,240,0.55)"
            strokeWidth="3"
          />
        </svg>
      );
    default:
      return (
        <svg width="28" height="28" viewBox="0 0 28 28" style={sx} aria-hidden>
          <ellipse cx="14" cy="14" rx="11" ry="8.5" fill="rgba(240,244,250,0.45)" stroke="rgba(226,228,238,0.45)" strokeWidth="2.5" />
          <ellipse cx="9" cy="15" rx="5" ry="4" fill="rgba(246,246,248,0.42)" opacity="0.9" />
        </svg>
      );
  }
}

function variantFor(ymd: string, td: string, done: boolean): 'sun' | 'breeze' | 'drizzle' | 'cloud' | 'mist' {
  if (ymd === td) return done ? 'sun' : 'drizzle';
  if (ymd < td) return done ? 'breeze' : 'drizzle';
  return 'mist';
}

export function ResilienceWeatherWeekSlots({ slots }: { slots: Props[] }) {
  return (
    <div className="fmRpWeatherRow" role="list" aria-label="本周情绪天气">
      {slots.map(({ ymd, todayISO, done }) => {
        const v = variantFor(ymd, todayISO, done);
        return (
          <div key={ymd} className="fmRpWeatherSlot" role="listitem" title={ymd}>
            <MoodGlyph variant={v} />
            <span className="fmRpWeatherLabel">{dowLabel(ymd)}</span>
          </div>
        );
      })}
    </div>
  );
}
