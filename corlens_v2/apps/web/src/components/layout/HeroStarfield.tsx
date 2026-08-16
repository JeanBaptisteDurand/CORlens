/**
 * Constellation starfield: glowing dots joined by a few thin lines, per the
 * "Background" recipe in the cosmic design system. Mounted only behind the
 * /home hero (see Home.tsx) — every other screen stays flat per the design
 * doc's per-page application notes.
 */

type Star = { cx: number; cy: number; r: number; twinkle?: boolean; delay?: number };
type Link = { x1: number; y1: number; x2: number; y2: number };

const STARS: Star[] = [
  { cx: 120, cy: 70, r: 1.8 },
  { cx: 210, cy: 120, r: 2.2, twinkle: true, delay: 0 },
  { cx: 180, cy: 200, r: 1.6 },
  { cx: 760, cy: 50, r: 1.8 },
  { cx: 840, cy: 95, r: 2.6, twinkle: true, delay: 0.6 },
  { cx: 900, cy: 60, r: 1.6 },
  { cx: 820, cy: 170, r: 1.6 },
  { cx: 480, cy: 330, r: 1.8 },
  { cx: 560, cy: 290, r: 2.2, twinkle: true, delay: 1.1 },
  { cx: 640, cy: 320, r: 1.6 },
  { cx: 60, cy: 280, r: 1.4 },
  { cx: 350, cy: 40, r: 1.4, twinkle: true, delay: 0.3 },
  { cx: 620, cy: 150, r: 1.4 },
  { cx: 990, cy: 220, r: 1.6 },
  { cx: 1040, cy: 330, r: 1.6 },
  { cx: 40, cy: 420, r: 1.4 },
  { cx: 300, cy: 450, r: 1.8, twinkle: true, delay: 0.8 },
  { cx: 700, cy: 430, r: 1.4 },
  { cx: 950, cy: 410, r: 2 },
  { cx: 420, cy: 180, r: 1.4 },
];

const LINKS: Link[] = [
  { x1: 120, y1: 70, x2: 210, y2: 120 },
  { x1: 210, y1: 120, x2: 180, y2: 200 },
  { x1: 760, y1: 50, x2: 840, y2: 95 },
  { x1: 840, y1: 95, x2: 900, y2: 60 },
  { x1: 840, y1: 95, x2: 820, y2: 170 },
  { x1: 480, y1: 330, x2: 560, y2: 290 },
  { x1: 560, y1: 290, x2: 640, y2: 320 },
  { x1: 950, y1: 410, x2: 1040, y2: 330 },
  { x1: 300, y1: 450, x2: 420, y2: 180 },
];

export function HeroStarfield(): JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1100 520"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full opacity-50"
    >
      <defs>
        <filter id="corlens-star-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="corlens-line-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="1.6" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g stroke="#8FB4FF" strokeWidth="1.1" opacity="0.65" filter="url(#corlens-line-glow)">
        {LINKS.map((l) => (
          <line key={`${l.x1}-${l.y1}-${l.x2}-${l.y2}`} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} />
        ))}
      </g>
      <g fill="#F4F6FA" filter="url(#corlens-star-glow)">
        {STARS.map((s) => (
          <circle
            key={`${s.cx}-${s.cy}`}
            cx={s.cx}
            cy={s.cy}
            r={s.r}
            className={s.twinkle ? "star-twinkle" : undefined}
            style={s.twinkle ? { animationDelay: `${s.delay}s` } : undefined}
          />
        ))}
      </g>
    </svg>
  );
}
