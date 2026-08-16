/**
 * "Why we've created CORLens" — the three-part problem statement. Cells share
 * hairline dividers (1px grid gap over a hairline background) rather than sitting
 * in separate boxes, per the design system's info-cell grid.
 *
 * Each cell is introduced by a tiny abstract glyph rather than an icon: a decaying
 * order book, an interrupted corridor, a paced tranche sequence. Every glyph is
 * lit with the site's neon treatment so the three read as one family.
 */

const GLYPH_ACCENT = "#8FB4FF";

/** Neon bloom applied to glyph geometry. `ACCENT` for the accent hue, `RISK` for red. */
const GLOW = { ACCENT: "url(#why-glow-accent)", RISK: "url(#why-glow-risk)" } as const;

/**
 * Both glyph glows, emitted once for the section. Two stacked zero-offset drop
 * shadows give a tight core plus a wide bloom, matching `btn-primary-themed`.
 */
function GlyphGlowDefs(): JSX.Element {
  return (
    <svg aria-hidden="true" width="0" height="0" className="absolute" focusable="false">
      <defs>
        <filter id="why-glow-accent" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.4" floodColor="#8FB4FF" floodOpacity="0.9" />
          <feDropShadow dx="0" dy="0" stdDeviation="3.6" floodColor="#6E8FDD" floodOpacity="0.55" />
        </filter>
        <filter id="why-glow-risk" x="-60%" y="-60%" width="220%" height="220%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.4" floodColor="#ef4444" floodOpacity="0.85" />
          <feDropShadow dx="0" dy="0" stdDeviation="3.6" floodColor="#ef4444" floodOpacity="0.45" />
        </filter>
      </defs>
    </svg>
  );
}

/** Depth eaten from the top down — bars shrinking left to right. */
function BookDecayGlyph(): JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="-5 -5 56 32"
      width="56"
      height="32"
      className="mb-[14px] -ml-[5px] block"
    >
      <g fill={GLYPH_ACCENT} filter={GLOW.ACCENT}>
        <rect x="0" y="4" width="4" height="14" />
        <rect x="8" y="7" width="4" height="11" />
        <rect x="16" y="10" width="4" height="8" />
        <rect x="24" y="13" width="4" height="5" />
        <rect x="32" y="15" width="4" height="3" />
        <rect x="40" y="16.5" width="4" height="1.5" />
      </g>
    </svg>
  );
}

/** Two clean corridors and a third cut in the middle. */
function BrokenCorridorGlyph(): JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="-5 -5 56 32"
      width="56"
      height="32"
      className="mb-[14px] -ml-[5px] block"
    >
      <g fill="none" stroke={GLYPH_ACCENT} strokeWidth="1.3" filter={GLOW.ACCENT}>
        <path d="M1 4 H45" />
        <path d="M1 11 H45" />
      </g>
      <g fill="none" stroke="#ef4444" strokeWidth="1.3" opacity="0.8" filter={GLOW.RISK}>
        <path d="M1 18 H17" />
        <path d="M29 18 H45" />
      </g>
      <g stroke="#ef4444" strokeWidth="1.3" filter={GLOW.RISK}>
        <path d="M20 14.5 L23 21.5" />
        <path d="M24 14.5 L27 21.5" />
      </g>
    </svg>
  );
}

/** Tranches of varying size paced along a baseline. */
function TrancheSequenceGlyph(): JSX.Element {
  return (
    <svg
      aria-hidden="true"
      viewBox="-5 -5 56 32"
      width="56"
      height="32"
      className="mb-[14px] -ml-[5px] block"
    >
      <g fill={GLYPH_ACCENT} filter={GLOW.ACCENT}>
        <rect x="0" y="9" width="3" height="4" />
        <rect x="7" y="7" width="3" height="8" />
        <rect x="14" y="10" width="3" height="2" />
        <rect x="21" y="6" width="3" height="10" />
        <rect x="28" y="9" width="3" height="4" />
        <rect x="35" y="8" width="3" height="6" />
        <rect x="42" y="10" width="3" height="2" />
      </g>
      <path d="M0 20 H45" stroke="rgba(244,246,250,0.22)" strokeWidth="1" />
    </svg>
  );
}

const REASONS: { glyph: () => JSX.Element; title: string; body: string }[] = [
  {
    glyph: BookDecayGlyph,
    title: "Preserving the balance",
    body: "A multi-million XRP position sold frontally eats its own order book from the top down. The holder receives materially less than the balance was worth before the exit started.",
  },
  {
    glyph: BrokenCorridorGlyph,
    title: "Avoiding corridor risk",
    body: "Corridors are not interchangeable. Clawback flags, frozen trust lines, thin depth, unrated counterparties. Routing through the wrong one is a loss the quoted rate never shows.",
  },
  {
    glyph: TrancheSequenceGlyph,
    title: "Automating the flow over time",
    body: "Neither problem is solvable by hand at size. The exit has to be sequenced, sized and paced continuously, tranche after tranche, for as long as it takes.",
  },
];

export function WhySection(): JSX.Element {
  return (
    <section
      id="why"
      className="relative z-[1] border-t border-[color:rgba(244,246,250,0.08)] bg-[#070B14] px-6 py-20"
    >
      <GlyphGlowDefs />
      <div className="mx-auto max-w-[1152px]">
        <h2 className="mb-11 max-w-[720px] text-balance text-[34px] font-bold leading-[1.15] tracking-[-0.025em] text-[#F4F6FA] max-hero:text-[26px]">
          Why we&apos;ve{" "}
          <span className="text-[color:var(--page-accent-400)]">created CORLens</span>.
        </h2>

        <div className="grid grid-cols-3 gap-px border border-[color:rgba(244,246,250,0.08)] bg-[color:rgba(244,246,250,0.08)] max-hero:grid-cols-1">
          {REASONS.map(({ glyph: Glyph, title, body }) => (
            <div key={title} className="bg-[#0B0F1C] p-8">
              <Glyph />
              <h3 className="mb-2.5 text-lg font-semibold leading-[1.3] text-[#F4F6FA]">{title}</h3>
              <p className="text-pretty text-sm leading-[1.65] text-[#8A93A6]">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
