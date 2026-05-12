import { useEffect, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

type Particle = {
  id: number;
  left: string;
  top: string;
  size: number;
  duration: string;
  delay: string;
  maxOpacity: number;
};

// 专属的梦幻 CSS 样式注入
function DreamyStyles() {
  return (
    <style>{`
      /* 缓慢旋转和变形的液态极光背景 */
      .fluid-aura {
        position: absolute;
        top: -50%; left: -50%;
        width: 200%; height: 200%;
        background: radial-gradient(circle at 50% 50%, rgba(130, 160, 255, 0.15) 0%, rgba(200, 150, 255, 0.05) 40%, transparent 60%),
                    radial-gradient(circle at 80% 20%, rgba(100, 200, 255, 0.1) 0%, transparent 50%);
        animation: slowSpin 30s linear infinite, slowMorph 20s ease-in-out infinite alternate;
        pointer-events: none;
        z-index: 0;
      }
      @keyframes slowSpin { 100% { transform: rotate(360deg); } }
      @keyframes slowMorph {
        100% {
          border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
          scale: 1.2;
        }
      }

      /* 悬浮的 3D 毛玻璃岛屿 */
      .parallax-island {
        position: relative;
        z-index: 10;
        background: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 30px 60px rgba(0,0,0,0.2), inset 0 0 20px rgba(255,255,255,0.05);
        border-radius: 2rem;
        transform-style: preserve-3d;
        transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }

      /* 极其缓慢上升的星尘粒子 */
      .stardust-particle {
        position: absolute;
        border-radius: 50%;
        background: white;
        box-shadow: 0 0 10px 2px rgba(255,255,255,0.6);
        animation: float-upwards var(--duration) linear infinite;
        opacity: 0;
        pointer-events: none;
        z-index: 1;
      }
      @keyframes float-upwards {
        0% { transform: translateY(100px) scale(0.5); opacity: 0; }
        20% { opacity: var(--max-opacity); }
        80% { opacity: var(--max-opacity); }
        100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
      }
    `}</style>
  );
}

export type DreamyContainerProps = {
  children: ReactNode;
  className?: string;
};

export function DreamyContainer({ children, className = '' }: DreamyContainerProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles: Particle[] = Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      duration: `${Math.random() * 10 + 10}s`,
      delay: `-${Math.random() * 10}s`,
      maxOpacity: Math.random() * 0.4 + 0.1,
    }));
    setParticles(newParticles);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = ((e.clientX / window.innerWidth) - 0.5) * 15;
    const y = ((e.clientY / window.innerHeight) - 0.5) * -15;
    setMousePos({ x: y, y: x });
  };

  return (
    <div
      className="relative flex min-h-[400px] w-full overflow-hidden rounded-3xl h-full items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setMousePos({ x: 0, y: 0 })}
      style={{ perspective: '1000px' }}
    >
      <DreamyStyles />

      <div className="fluid-aura" />

      {particles.map((p) => (
        <div
          key={p.id}
          className="stardust-particle"
          style={
            {
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: `${p.size}px`,
              '--duration': p.duration,
              '--max-opacity': p.maxOpacity,
              animationDelay: p.delay,
            } as CSSProperties
          }
        />
      ))}

      <div
        className={`parallax-island w-[90%] max-w-2xl p-8 md:p-12 ${className}`}
        style={{
          transform: `rotateX(${mousePos.x}deg) rotateY(${mousePos.y}deg)`,
        }}
      >
        <div style={{ transform: 'translateZ(40px)' }}>{children}</div>
      </div>
    </div>
  );
}
