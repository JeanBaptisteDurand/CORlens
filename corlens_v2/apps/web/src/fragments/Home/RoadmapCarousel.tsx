import { useCarousel } from "../../hooks/useCarousel.js";

/**
 * Roadmap rail — the shipped steps and the ones that build the Liquidity Agent,
 * on one vertical timeline. Shipped nodes are filled and solid, upcoming ones are
 * hollow, and "Later" is dashed throughout.
 *
 * The rail opens on the shipped/next boundary rather than at step one: the
 * interesting part of a roadmap is where the line stops.
 */

type Status = "Shipped" | "Next" | "Later";

type Step = { status: Status; title: string; proof: string };

const STEPS: readonly Step[] = [
  {
    status: "Shipped",
    title: "Corridor coverage and live classification",
    proof: "2,436 corridors, 48 currencies, rescanned hourly on mainnet.",
  },
  {
    status: "Shipped",
    title: "Safe Path agent and compliance reports",
    proof: "Nine phases per route, downloadable report at the end of each run.",
  },
  {
    status: "Shipped",
    title: "Entity Audit graph with XLS-73 and XLS-77 detection",
    proof: "AMM clawback exposure and deep frozen trust lines, read from ledger flags.",
  },
  {
    status: "Shipped",
    title: "MCP server, CORLens inside Claude",
    proof: "Seven tools over stdio, published as @corlens/mcp.",
  },
  {
    status: "Shipped",
    title: "Frontend rebuild",
    proof:
      "The hackathon surface replaced with a product one: professional appearance, clearer view of every feature.",
  },
  {
    status: "Next",
    title: "Orderbook intelligence",
    proof:
      "Depth and spread are measured live today. Five years of XRP history turns that into tranche rules.",
  },
  {
    status: "Next",
    title: "Automation Engine",
    proof:
      "Execution in small tranches across ranked off-ramps, with pauses that let the book rebuild.",
  },
  {
    status: "Next",
    title: "AI verification layer",
    proof: "Every trade validated before it fires. Hand coded, auditable, never a black box.",
  },
  {
    status: "Later",
    title: "Open stack",
    proof: "SDK, risk engine, corridor atlas and Safe Path widget as embeddable libraries.",
  },
];

const STATUS_COLOR: Record<Status, string> = {
  Shipped: "#10b981",
  Next: "#8FB4FF",
  Later: "#5A6483",
};

const HAIRLINE = "rgba(244,246,250,0.08)";
/**
 * Focus is drawn entirely in the site accent: rail, node outline, body border and
 * glow. Status keeps the eyebrow label and the node fill. Mixing the two, a green
 * shipped border sitting inside a blue glow, made the focused step read as two
 * competing highlights.
 */
const FOCUS = "var(--page-accent-400)";
const ACTIVE_GLOW =
  "0 0 1px #8FB4FF, 0 0 12px rgba(110,163,255,0.34), 0 0 28px rgba(110,163,255,0.16)";

/** First step that is not yet shipped — where the rail should open. */
const BOUNDARY = Math.max(
  0,
  STEPS.findIndex((s) => s.status !== "Shipped"),
);

export function RoadmapCarousel(): JSX.Element {
  const carousel = useCarousel({
    count: STEPS.length,
    orientation: "vertical",
    // Scroll one step short of the boundary so the last shipped item stays in
    // view above it — the whole point is seeing where shipped turns into next.
    initial: BOUNDARY > 0 ? { index: BOUNDARY, scrollTo: BOUNDARY - 1 } : undefined,
  });

  return (
    <section
      id="roadmap"
      className="relative z-[1] border-t border-[color:rgba(244,246,250,0.08)] bg-[#070B14] px-6 py-20"
    >
      <div className="mx-auto max-w-[1152px]">
        <h2 className="mb-4 max-w-[760px] text-balance text-[34px] font-bold leading-[1.15] tracking-[-0.025em] text-[#F4F6FA] max-hero:text-[26px]">
          Reading risk was step one.{" "}
          <span className="text-[color:var(--page-accent-400)]">Moving size safely</span> is next.
        </h2>
        <p className="mb-8 max-w-[620px] text-base leading-[1.65] text-[#8A93A6]">
          Five steps shipped, five features already live. Three more connect them into the Liquidity
          Agent.
        </p>

        <div className="relative pl-[22px]">
          {/* Overall progress track, filled to the focused step. */}
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-0.5 bg-[color:rgba(244,246,250,0.08)]"
          >
            <div
              className="absolute left-0 top-0 w-0.5 bg-[#8FB4FF] transition-[height] duration-[360ms] ease-out"
              style={{
                height: `${((carousel.index + 1) / STEPS.length) * 100}%`,
                boxShadow: "0 0 8px rgba(110,163,255,0.6)",
              }}
            />
          </div>

          <div
            ref={carousel.containerRef}
            {...carousel.containerProps}
            aria-label="Product roadmap"
            className="no-scrollbar max-h-[520px] cursor-grab overflow-y-auto outline-none [scroll-behavior:smooth]"
          >
            {STEPS.map((step, i) => {
              const active = i === carousel.index;
              const color = STATUS_COLOR[step.status];
              const shipped = step.status === "Shipped";
              const later = step.status === "Later";
              return (
                // Clicking a step is a pointer shortcut only: keyboard focus lives on
                // the scroll container (arrow keys) and the labelled up/down controls,
                // so the steps stay non-focusable rather than becoming nine tab stops
                // wrapping a heading.
                <div
                  key={step.title}
                  data-carousel-slide
                  aria-current={active}
                  onClick={() => carousel.select(i)}
                  className="grid cursor-pointer grid-cols-[64px_1fr] text-left transition-opacity duration-[320ms]"
                  style={{ opacity: active ? 1 : 0.88 }}
                >
                  <div className="relative ml-[23px] flex flex-col items-end pt-5 pr-3 pb-[34px]">
                    {/* Stops 12px short of the next step so the shipped green never
                        runs alongside the accent-lit step below it, and turns accent
                        on the focused step so one step is lit in one colour. */}
                    <span
                      aria-hidden
                      className="absolute bottom-3 left-0 top-0 border-l"
                      style={{
                        borderStyle: shipped ? "solid" : "dashed",
                        borderColor: active
                          ? FOCUS
                          : shipped
                            ? "rgba(16,185,129,0.45)"
                            : "rgba(143,180,255,0.35)",
                      }}
                    />
                    <span
                      className="absolute top-[22px] transition-[width,height,left] duration-[260ms]"
                      style={{
                        left: active ? -6.5 : -4.5,
                        width: active ? 13 : 9,
                        height: active ? 13 : 9,
                        background: shipped ? color : "#070B14",
                        border: `1px ${later ? "dashed" : "solid"} ${active ? FOCUS : color}`,
                        boxShadow: active ? "0 0 12px rgba(110,163,255,0.55)" : undefined,
                      }}
                    />
                    <span className="font-mono text-[10px] text-[#5A6483]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div
                    className="mb-2 ml-3 px-6 pt-5 pb-6 transition-[background-color,border-color,box-shadow] duration-[320ms]"
                    style={{
                      background: active ? "rgba(244,246,250,0.03)" : "transparent",
                      border: `1px ${later ? "dashed" : "solid"} ${active ? FOCUS : HAIRLINE}`,
                      boxShadow: active ? ACTIVE_GLOW : undefined,
                    }}
                  >
                    <span
                      className="font-mono text-[9.5px] font-bold uppercase tracking-[0.2em]"
                      style={{ color }}
                    >
                      {step.status}
                    </span>
                    <h3 className="my-2 text-[19px] font-semibold leading-[1.28] text-[#F4F6FA]">
                      {step.title}
                    </h3>
                    <p className="max-w-[620px] text-[13.5px] leading-[1.6] text-[#7C8AA0]">
                      {step.proof}
                    </p>
                  </div>
                </div>
              );
            })}
            {/* A card's worth of breathing room under the last step, no more. The
                trailing steps cannot each reach the top of the track, and
                indexFromScroll resolves which of them is focused instead. */}
            <div aria-hidden className="h-6" />
          </div>

          <div className="mt-5 flex items-center justify-between gap-4">
            <span className="font-mono text-[11px] tracking-[0.14em] text-[#5A6483]">
              {carousel.index + 1} / {STEPS.length}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => carousel.select(carousel.index - 1)}
                aria-label="Previous step"
                className="border border-[color:rgba(244,246,250,0.14)] bg-transparent px-3.5 py-2 text-sm text-[#C5CBE0] transition-colors duration-150 hover:bg-white/5"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => carousel.select(carousel.index + 1)}
                aria-label="Next step"
                className="border border-[color:rgba(244,246,250,0.14)] bg-transparent px-3.5 py-2 text-sm text-[#C5CBE0] transition-colors duration-150 hover:bg-white/5"
              >
                ↓
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
