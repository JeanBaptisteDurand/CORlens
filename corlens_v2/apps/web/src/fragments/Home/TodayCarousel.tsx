import { useCarousel } from "../../hooks/useCarousel.js";

/**
 * "Live today" — the five shipped surfaces, as a tab strip over a horizontal
 * carousel. Each slide pairs one claim with a mock of the actual surface, so the
 * section shows the product rather than describing it.
 *
 * Tabs, arrow keys, mouse dragging and native scrolling all drive the same
 * scroll container (see useCarousel).
 */

type Tint = { hex: string; soft: string; line: string };

/** One accent per feature, so the tab strip reads as five distinct surfaces. */
const TINTS: readonly Tint[] = [
  { hex: "#f59e0b", soft: "rgba(245,158,11,0.16)", line: "rgba(245,158,11,0.38)" },
  { hex: "#10b981", soft: "rgba(16,185,129,0.14)", line: "rgba(16,185,129,0.34)" },
  { hex: "#f8a4a4", soft: "rgba(248,164,164,0.12)", line: "rgba(248,164,164,0.34)" },
  { hex: "#a78bfa", soft: "rgba(167,139,250,0.14)", line: "rgba(167,139,250,0.34)" },
  { hex: "#6E8FDD", soft: "rgba(110,143,221,0.16)", line: "rgba(110,143,221,0.38)" },
];

const HAIRLINE = "rgba(244,246,250,0.08)";

// ─── Shared slide furniture ──────────────────────────────────────────────

/** Mono all-caps footnote under a mock. */
function MockCaption({ children }: { children: React.ReactNode }): JSX.Element {
  return <div className="font-mono text-[9px] tracking-[0.14em] text-[#5A6483]">{children}</div>;
}

/** Outlined mono chip — actor names, retrieval citations, and the like. */
function MockChip({
  children,
  color,
  border,
}: {
  children: React.ReactNode;
  color?: string;
  border?: string;
}): JSX.Element {
  return (
    <span
      className="px-1.5 py-px font-mono text-[9px]"
      style={{
        color: color ?? "#8A93A6",
        border: `1px solid ${border ?? "rgba(244,246,250,0.14)"}`,
      }}
    >
      {children}
    </span>
  );
}

/** Right-aligned operator message. */
function UserBubble({
  children,
  maxWidth,
}: {
  children: React.ReactNode;
  maxWidth: string;
}): JSX.Element {
  return (
    <div
      className="self-end border border-[color:rgba(244,246,250,0.08)] bg-[color:rgba(18,23,42,0.9)] px-3 py-[9px] text-[11.5px] leading-[1.45] text-[#C5CBE0]"
      style={{ maxWidth }}
    >
      {children}
    </div>
  );
}

/** The panel every mock sits in. */
function MockPanel({
  children,
  flush = false,
}: {
  children: React.ReactNode;
  flush?: boolean;
}): JSX.Element {
  return (
    <div
      className={`flex min-h-[200px] flex-col justify-center gap-3 border border-[color:rgba(244,246,250,0.08)] bg-[#0B0F1C] ${
        flush ? "" : "p-5"
      }`}
    >
      {children}
    </div>
  );
}

// ─── The five mocks ──────────────────────────────────────────────────────

/** A single classified corridor row, as the atlas renders it. */
function CorridorAtlasMock(): JSX.Element {
  return (
    <MockPanel>
      <div className="border bg-[#070B14]" style={{ borderColor: "#f59e0b55" }}>
        <div
          className="flex items-center justify-between gap-2.5 px-3.5 py-3"
          style={{ borderBottom: `1px solid ${HAIRLINE}` }}
        >
          <span className="flex items-baseline gap-2">
            <span className="text-[15px] font-semibold text-[#F4F6FA]">USD</span>
            <span className="text-xs text-[#5A6483]">→</span>
            <span className="text-[15px] font-semibold text-[#F4F6FA]">EUR</span>
          </span>
          <span className="border border-emerald-500/[0.34] bg-emerald-500/[0.14] px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.14em] text-emerald-500">
            GREEN
          </span>
        </div>
        <div className="grid grid-cols-2">
          <div className="px-3.5 py-2.5" style={{ borderRight: `1px solid ${HAIRLINE}` }}>
            <div className="font-mono text-[8.5px] tracking-[0.16em] text-[#5A6483]">TYPE</div>
            <div className="mt-[3px] font-mono text-[11px] text-[#C5CBE0]">XRPL NATIVE</div>
          </div>
          <div className="px-3.5 py-2.5">
            <div className="font-mono text-[8.5px] tracking-[0.16em] text-[#5A6483]">SPREAD</div>
            <div className="mt-[3px] font-mono text-[11px] text-[#C5CBE0]">6 bps</div>
          </div>
        </div>
        <div
          className="flex flex-wrap gap-1.5 px-3.5 py-2.5"
          style={{ borderTop: `1px solid ${HAIRLINE}` }}
        >
          <MockChip>Bitstamp</MockChip>
          <MockChip>GateHub</MockChip>
          <MockChip>RLUSD</MockChip>
        </div>
      </div>
      <MockCaption>2,436 LANES · 48 CURRENCIES</MockCaption>
    </MockPanel>
  );
}

/** The agent mid-run: a phase counter, a rejected hop, a report being built. */
function SafePathMock(): JSX.Element {
  return (
    <MockPanel>
      <div className="flex flex-col gap-[9px]">
        <UserBubble maxWidth="82%">Route 4M USD to EUR. Flag anything with clawback.</UserBubble>
        <div className="flex items-center gap-2">
          <span className="h-[5px] w-[5px] bg-emerald-500" />
          <span className="font-mono text-[9.5px] text-[#8A93A6]">
            04 / 09 &nbsp;ACTOR RESEARCH
          </span>
        </div>
        <div
          className="max-w-[88%] px-3 py-[9px] text-[11.5px] leading-[1.45] text-[#8A93A6]"
          style={{ border: "1px solid #10b98144", background: "rgba(16,185,129,0.05)" }}
        >
          Two hops clear. One issuer carries{" "}
          <span className="text-[#f8a4a4]">CLAWBACK_ENABLED</span>, path rejected. Splitting across
          2 routes.
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className="pulse-dot h-[9px] w-[3px] bg-emerald-500"
            style={{ animationDuration: "1.4s" }}
          />
          <span className="font-mono text-[9.5px] text-[#5A6483]">building compliance report</span>
        </div>
      </div>
    </MockPanel>
  );
}

/** A crawled account and its immediate neighbourhood, one node flagged. */
function EntityAuditMock(): JSX.Element {
  return (
    <MockPanel>
      <div className="relative h-[168px] w-full">
        <svg
          aria-hidden="true"
          viewBox="0 0 300 168"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <g stroke="rgba(248,164,164,0.28)" strokeWidth="1" strokeDasharray="3 3">
            <line x1="150" y1="84" x2="52" y2="34" />
            <line x1="150" y1="84" x2="252" y2="40" />
            <line x1="150" y1="84" x2="60" y2="136" />
            <line x1="150" y1="84" x2="244" y2="132" />
          </g>
          <rect x="143" y="77" width="14" height="14" fill="#f8a4a4" />
          <rect x="46" y="28" width="9" height="9" fill="#8A93A6" />
          <rect x="247" y="35" width="9" height="9" fill="#8A93A6" />
          <rect x="55" y="131" width="9" height="9" fill="#8A93A6" />
          <rect x="239" y="127" width="9" height="9" fill="#ef4444" />
          <g
            fontFamily="'JetBrains Mono',monospace"
            fontSize="8"
            letterSpacing="0.6"
            fill="#5A6483"
          >
            <text x="52" y="22" textAnchor="middle">
              ISSUER
            </text>
            <text x="252" y="29" textAnchor="middle">
              AMM POOL
            </text>
            <text x="60" y="153" textAnchor="middle">
              TRUST LINE
            </text>
            <text x="244" y="149" textAnchor="middle">
              FLAGGED
            </text>
            <text x="150" y="108" textAnchor="middle" fill="#C5CBE0">
              ACCOUNT
            </text>
          </g>
        </svg>
      </div>
      <MockCaption>18 NODE TYPES · 19 EDGE TYPES</MockCaption>
    </MockPanel>
  );
}

/** A retrieval answer with the records it was grounded in. */
function GroundedChatMock(): JSX.Element {
  return (
    <MockPanel>
      <div className="flex flex-col gap-2.5">
        <UserBubble maxWidth="84%">Which GCC corridors hold RLUSD on both sides?</UserBubble>
        <div
          className="px-3 py-2.5 text-[11.5px] leading-[1.5] text-[#8A93A6]"
          style={{ borderLeft: "2px solid #a78bfa", background: "rgba(167,139,250,0.05)" }}
        >
          Four lanes qualify. AED and SAR settle native, QAR routes through a bridge.
        </div>
        <div className="flex flex-wrap gap-1.5">
          <MockChip color="#a78bfa" border="rgba(167,139,250,0.34)">
            corridor:AED-EUR
          </MockChip>
          <MockChip color="#a78bfa" border="rgba(167,139,250,0.34)">
            actor:rQ3…7Kd
          </MockChip>
        </div>
      </div>
    </MockPanel>
  );
}

/** One MCP tool call and its response, as Claude would issue it. */
function McpServerMock(): JSX.Element {
  return (
    <MockPanel flush>
      <div
        className="flex items-center gap-2 px-3.5 py-2.5"
        style={{ borderBottom: `1px solid ${HAIRLINE}` }}
      >
        <span className="font-mono text-[9px] tracking-[0.16em] text-[#6E8FDD]">POST</span>
        <span className="font-mono text-[10.5px] text-[#C5CBE0]">get_partner_depth</span>
      </div>
      <div className="flex flex-col gap-[3px] p-3.5 font-mono text-[10.5px] leading-[1.6]">
        <span className="text-[#5A6483]">{"{"}</span>
        <span className="pl-3 text-[#8A93A6]">
          "venue"<span className="text-[#5A6483]">:</span>{" "}
          <span className="text-emerald-500">"bitso"</span>
          <span className="text-[#5A6483]">,</span>
        </span>
        <span className="pl-3 text-[#8A93A6]">
          "pair"<span className="text-[#5A6483]">:</span>{" "}
          <span className="text-emerald-500">"XRP-MXN"</span>
        </span>
        <span className="text-[#5A6483]">{"}"}</span>
        <span className="pt-1.5 text-[#5A6483]">
          → spread_bps <span className="text-[#C5CBE0]">6</span> · depth{" "}
          <span className="text-[#C5CBE0]">live</span>
        </span>
      </div>
      <div
        className="px-3.5 py-2.5 font-mono text-[9px] tracking-[0.14em] text-[#5A6483]"
        style={{ borderTop: `1px solid ${HAIRLINE}` }}
      >
        7 TOOLS · @corlens/mcp
      </div>
    </MockPanel>
  );
}

// ─── Feature data ────────────────────────────────────────────────────────

type Feature = {
  name: string;
  tags: readonly string[];
  headline: string;
  proof: string;
  Mock: () => JSX.Element;
};

const FEATURES: readonly Feature[] = [
  {
    name: "Corridor Atlas",
    tags: ["XRPL", "Data"],
    headline: "Pick the lane that actually settles.",
    proof:
      "2,436 fiat corridors across 48 currencies, classified GREEN, AMBER or RED and rescanned hourly.",
    Mock: CorridorAtlasMock,
  },
  {
    name: "Safe Path Agent",
    tags: ["AI", "Compliance"],
    headline: "Get a route you can defend to compliance.",
    proof:
      "Nine phases crawl every counterparty, reject HIGH severity flags and split large amounts. The report downloads.",
    Mock: SafePathMock,
  },
  {
    name: "Entity Audit",
    tags: ["Audit", "XRPL"],
    headline: "Audit any address before you touch it.",
    proof:
      "18 node types and 19 edge types, crawled live, with 19 risk detectors reading ledger state.",
    Mock: EntityAuditMock,
  },
  {
    name: "Grounded chat",
    tags: ["AI", "Data"],
    headline: "Ask in plain language, get answers from the ledger.",
    proof:
      "Retrieval runs against the same on-chain records the agent reads, on the atlas and on any entity graph.",
    Mock: GroundedChatMock,
  },
  {
    name: "MCP Server",
    tags: ["Developer", "AI"],
    headline: "Query CORLens from inside Claude.",
    proof: "Seven tools over stdio in Claude Desktop and Claude Code. Shipped as @corlens/mcp.",
    Mock: McpServerMock,
  },
];

// ─── Section ─────────────────────────────────────────────────────────────

export function TodayCarousel(): JSX.Element {
  const carousel = useCarousel({ count: FEATURES.length });

  return (
    <section className="relative z-[1] bg-[color:rgba(2,4,9,0.72)] px-6 py-20">
      <div className="mx-auto max-w-[1152px]">
        <div className="mb-3.5 flex items-center gap-2.5">
          <span className="pulse-dot h-1.5 w-1.5 bg-emerald-500" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500">
            Live now
          </span>
        </div>
        <h2 className="mb-8 max-w-[760px] text-balance text-[34px] font-bold leading-[1.15] tracking-[-0.025em] text-[#F4F6FA] max-hero:text-[26px]">
          <span className="text-[color:var(--page-accent-400)]">Live today</span>, running on XRPL
          mainnet.
        </h2>

        <div className="mb-5 grid grid-cols-5 gap-px border border-[color:rgba(244,246,250,0.08)] bg-[color:rgba(244,246,250,0.08)] max-hero:grid-cols-2">
          {FEATURES.map((feature, i) => {
            const active = i === carousel.index;
            const tint = TINTS[i];
            return (
              <button
                key={feature.name}
                type="button"
                onClick={() => carousel.select(i)}
                aria-current={active}
                className="relative flex cursor-pointer flex-col items-start gap-2 border-none px-[18px] py-4 text-left"
                style={{ background: active ? "#0B0F1C" : "#070B14" }}
              >
                <span
                  className="text-sm font-semibold"
                  style={{
                    color: active ? "#F4F6FA" : "#7C8AA0",
                    textShadow: active ? `0 0 8px ${tint.hex}66` : undefined,
                  }}
                >
                  {feature.name}
                </span>
                <span className="flex flex-wrap gap-[5px]">
                  {feature.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-px font-mono text-[9px] font-medium uppercase tracking-[0.12em]"
                      style={{
                        color: tint.hex,
                        background: active ? tint.soft : "transparent",
                        border: `1px solid ${tint.line}`,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </span>
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-px"
                    style={{ background: tint.hex, boxShadow: `0 0 6px 1px ${tint.hex}b3` }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div
          ref={carousel.containerRef}
          {...carousel.containerProps}
          aria-label="Shipped platform features"
          className="no-scrollbar flex cursor-grab overflow-x-auto border border-[color:rgba(244,246,250,0.08)] bg-[#070B14] outline-none [scroll-behavior:smooth]"
        >
          {FEATURES.map((feature, i) => {
            const tint = TINTS[i];
            return (
              <article
                key={feature.name}
                data-carousel-slide
                className="grid min-h-[300px] shrink-0 grow-0 basis-full grid-cols-2 items-center gap-10 p-10 max-hero:grid-cols-1 max-hero:gap-6 max-hero:p-6"
              >
                <div>
                  <div className="mb-3.5 flex items-center gap-3">
                    <span
                      className="font-mono text-[10px] font-bold uppercase tracking-[0.3em]"
                      style={{ color: tint.hex }}
                    >
                      {feature.name}
                    </span>
                    <span className="border border-emerald-500/[0.34] px-1.5 py-px font-mono text-[8.5px] font-bold uppercase tracking-[0.16em] text-emerald-500">
                      Live
                    </span>
                  </div>
                  <h3 className="mb-3.5 text-balance text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-[#F4F6FA]">
                    {feature.headline}
                  </h3>
                  <p className="max-w-[460px] text-pretty text-[15px] leading-[1.6] text-[#8A93A6]">
                    {feature.proof}
                  </p>
                </div>
                <feature.Mock />
              </article>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <span className="font-mono text-[11px] tracking-[0.14em] text-[#5A6483]">
            {carousel.index + 1} / {FEATURES.length}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => carousel.select(carousel.index - 1)}
              aria-label="Previous feature"
              className="border border-[color:rgba(244,246,250,0.14)] bg-transparent px-3.5 py-2 text-sm text-[#C5CBE0] transition-colors duration-150 hover:bg-white/5"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => carousel.select(carousel.index + 1)}
              aria-label="Next feature"
              className="border border-[color:rgba(244,246,250,0.14)] bg-transparent px-3.5 py-2 text-sm text-[#C5CBE0] transition-colors duration-150 hover:bg-white/5"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
