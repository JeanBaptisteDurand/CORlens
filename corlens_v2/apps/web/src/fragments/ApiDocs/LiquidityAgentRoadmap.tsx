import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

// ─── Liquidity Agent vision — roadmap deep-dive ───────────────────────────
// Content-only: an illustrative (non-interactive) preview of a future
// product, built on the shipped Corridor Atlas / Safe Path Agent / Entity
// Audit stack. No live data, no real trading logic — everything here is a
// static mock, clearly labeled as such in the "future user flow" section.

const LOOP_STEPS: Array<{
  x: string;
  y: number;
  title: string;
  desc: string;
  gate?: boolean;
}> = [
  { x: "50%", y: 30, title: "Observe / Pause", desc: "Read live market state" },
  { x: "82%", y: 95, title: "Scan off-ramps", desc: "List possible exits" },
  { x: "95%", y: 260, title: "Compare rates", desc: "Pick the best-priced exit" },
  {
    x: "82%",
    y: 425,
    title: "SafePath check",
    desc: "Is the provider reliable?",
    gate: true,
  },
  { x: "50%", y: 490, title: "Historical model", desc: "Size the tranche" },
  {
    x: "18%",
    y: 425,
    title: "AI verification",
    desc: "Is the decision sane?",
    gate: true,
  },
  { x: "5%", y: 260, title: "Execute tranche", desc: "Partial sell, one step" },
  { x: "18%", y: 95, title: "Log", desc: "Record the decision" },
];

const LOOP_LINES: Array<[number, number, number, number]> = [
  [360, 46, 590, 111],
  [590, 111, 684, 276],
  [684, 276, 590, 441],
  [590, 441, 360, 506],
  [360, 506, 130, 441],
  [130, 441, 36, 276],
  [36, 276, 130, 111],
  [130, 111, 360, 46],
];

export function LiquidityAgentRoadmap() {
  return (
    <div className="mt-14 pt-10 border-t border-[color:rgba(244,246,250,0.1)]">
      {/* ── Featured intro ───────────────────────────────────────────── */}
      <div className="mb-3 inline-flex items-center gap-2">
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-sky-400">
          Featured vision
        </span>
        <span className="inline-block px-2 py-0.5 font-mono text-[9px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/40">
          NEXT
        </span>
      </div>
      <h2 className="text-3xl font-bold text-white mb-3">
        The Liquidity Agent — automated off-ramp trading
      </h2>
      <p className="text-sm text-slate-400 max-w-3xl mb-10 leading-relaxed">
        CorLens already classifies <strong className="text-slate-200">2,436 fiat corridors</strong>{" "}
        across <strong className="text-slate-200">48 currencies</strong>, scores every provider
        through Entity Audit's multi-criteria model, and detects amendment-level risk (
        <code className="text-xrp-400 text-xs">XLS-73</code> AMM clawback exposure,{" "}
        <code className="text-xrp-400 text-xs">XLS-77</code> deep-frozen trust lines) on live
        mainnet data. That's a working data foundation, not a pitch deck. Now that we can identify
        and audit the most reliable corridors, the next step is to automate execution on top of that
        same data — so a large XRP position can be sold without breaking the market.
      </p>

      {/* ── Problem / solution ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-14">
        <div>
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-red-400 mb-2">
            The problem
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Order books have limited depth</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            An institution holding a large XRP position can't sell it all at once: dumping millions
            of XRP eats the order book from the top down, slippage compounds with every fill, and
            the market sees it happening — other holders sell too. The result is a worse average
            price than the position was theoretically worth.
          </p>
        </div>
        <div>
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400 mb-2">
            The solution
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Small tranches, verified exits</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Sell in small tranches, spaced out over time, spread across multiple off-ramps —
            starting with the best price — with pauses to let the order book refill. Two tools do
            the work: a <strong className="text-slate-200">deterministic engine</strong> that
            executes the sells, and a{" "}
            <strong className="text-slate-200">hand-coded verification AI</strong> that checks every
            decision before it fires.
          </p>
        </div>
      </div>

      {/* ── Architecture diagram ─────────────────────────────────────── */}
      <div className="mb-14">
        <h3 className="text-lg font-semibold text-white mb-1">How it plugs into SafePath</h3>
        <p className="text-xs text-slate-500 mb-5 max-w-2xl">
          SafePath isn't rebuilt for this — it's reused exactly as it runs today, queried for a
          reliability verdict before every trade.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Liquidity Trading Off-Ramp</CardTitle>
              <p className="text-[10px] font-mono uppercase tracking-widest text-sky-400 mt-1">
                New · roadmap
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs font-semibold text-white">Automation Engine</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Executes real sell trades, reads live order-book depth, applies tranche size /
                  timing / pause rules, keeps a full decision history.
                </p>
              </div>
              <div>
                <div className="text-xs font-semibold text-white">AI Verification</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Checks every proposed trade before execution — tranche size, timing, provider.
                  Explicit hand-written logic, not a black box.
                </p>
              </div>
            </CardContent>
          </Card>

          <div
            className="flex md:flex-col items-center justify-center gap-1 px-2 text-slate-500"
            aria-hidden
          >
            <span className="text-lg">→</span>
            <span className="hidden md:block font-mono text-[9px] uppercase tracking-wide text-center">
              queries
              <br />
              reliability
            </span>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">SafePath Agent</CardTitle>
              <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 mt-1">
                Live today · reused as-is
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-xs font-semibold text-white">Corridor</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Exchange routes and settlement currencies (EUR, USD, JPY, GBP, CHF, CNY, …) —
                  picks the best off-ramp and the best settlement currency.
                </p>
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Entity Audit</div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Multi-criteria provider score: available liquidity, known incidents,
                  compliance/legal status, community reliability.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Decision loop diagram ────────────────────────────────────── */}
      <div className="mb-14">
        <h3 className="text-lg font-semibold text-white mb-1">
          The decision loop — an extension of Safe Path Agent's logic
        </h3>
        <p className="text-xs text-slate-500 mb-6 max-w-2xl">
          The same multi-phase reasoning that already drives Safe Path Agent, run in a continuous
          cycle: observe, compare, verify, sell one tranche, log, repeat. The amber steps are
          guard-rails — the bot can pause and re-evaluate there instead of forcing a sale.
        </p>
        <div className="relative mx-auto" style={{ maxWidth: 720, height: 540 }}>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="w-28 h-28 flex flex-col items-center justify-center border border-[color:var(--page-accent-400)] bg-[color:rgba(110,143,221,0.08)] text-center px-2">
              <span className="text-sm font-bold text-white leading-tight">Liquidity Agent</span>
              <span className="font-mono text-[9px] text-[color:var(--page-accent-300)] uppercase tracking-wider mt-1">
                continuous loop
              </span>
            </div>
          </div>

          <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 720 540"
          >
            {LOOP_LINES.map(([x1, y1, x2, y2]) => (
              <line
                key={`${x1}-${y1}-${x2}-${y2}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="rgba(143,180,255,0.18)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}
          </svg>

          {LOOP_STEPS.map((step) => (
            <div
              key={step.title}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: step.x, top: step.y }}
            >
              <div
                className={`w-[132px] border bg-slate-950/80 p-3 text-center ${
                  step.gate ? "border-amber-500/40" : "border-[color:rgba(244,246,250,0.14)]"
                }`}
              >
                {step.gate && (
                  <div className="font-mono text-[8px] font-bold uppercase tracking-widest text-amber-400 mb-1">
                    Guard-rail
                  </div>
                )}
                <div className="text-[11px] font-semibold text-white leading-tight">
                  {step.title}
                </div>
                <div className="text-[9px] text-slate-500 leading-snug mt-0.5">{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Credibility: 5 years of order-book data ──────────────────── */}
      <div className="mb-14">
        <h3 className="text-lg font-semibold text-white mb-1">
          Calibrated on 5 years of order-book history
        </h3>
        <p className="text-xs text-slate-500 mb-5 max-w-2xl">
          The bot doesn't guess when and how much to sell — it learns from how the XRP order book
          has actually behaved: depth, spread, slippage, and volume by hour and by day.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 border border-[color:rgba(244,246,250,0.08)] bg-[#070B14]">
          {[
            { value: "5 yrs", label: "Order-book history" },
            { value: "2012", label: "XRP mainnet launch" },
            { value: "12+ yrs", label: "Total market history" },
            { value: "4", label: "Market regimes covered" },
          ].map((s) => (
            <div
              key={s.label}
              className="border border-[color:rgba(244,246,250,0.08)] p-4 text-center -m-px"
            >
              <div className="text-xl font-bold text-[color:var(--page-accent-400)]">{s.value}</div>
              <div className="text-[10px] text-slate-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Future user flow (concept preview) ───────────────────────── */}
      <div className="mb-14">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="text-lg font-semibold text-white">What using it will look like</h3>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-dashed border-slate-600 font-mono text-[9px] uppercase tracking-widest text-slate-400">
            ◇ Concept preview — not a live feature
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-6 max-w-2xl">
          A projected walkthrough of the product, built on the corridor and audit data the Atlas and
          Entity Audit Graph already surface today. Everything below is a static mock.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[color:rgba(244,246,250,0.08)] bg-[#070B14]">
          <FlowStage n={1} title="Connect XRP holdings">
            <div className="border border-[color:rgba(244,246,250,0.1)] bg-slate-950/60 px-2.5 py-2 font-mono text-[10px] text-slate-400">
              rXXXX…HOLD <span className="text-slate-600">·</span>{" "}
              <span className="text-slate-300">4,200,000 XRP</span>
            </div>
          </FlowStage>
          <FlowStage n={2} title="Set trading rules">
            <div className="space-y-1 font-mono text-[10px] text-slate-400">
              <div>
                Tranche size <span className="text-slate-300">0.5% of depth</span>
              </div>
              <div>
                Pause <span className="text-slate-300">15–45 min</span>
              </div>
              <div>
                Min. SafePath score <span className="text-slate-300">80 / 100</span>
              </div>
            </div>
          </FlowStage>
          <FlowStage n={3} title="Live dashboard">
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Badge variant="low" className="text-[8px]">
                  Verified
                </Badge>
                <span className="font-mono text-[9px] text-slate-500">
                  12,000 XRP → GateHub EUR
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="info" className="text-[8px]">
                  Approved
                </Badge>
                <span className="font-mono text-[9px] text-slate-500">AI check passed</span>
              </div>
            </div>
          </FlowStage>
          <FlowStage n={4} title="Decision & audit log">
            <div className="space-y-1 font-mono text-[9px] text-slate-500">
              <div>
                14:32:07 <span className="text-emerald-400">APPROVED</span> · sell via Bitso
              </div>
              <div>
                14:28:51 <span className="text-amber-400">SKIPPED</span> · score 62 &lt; threshold
              </div>
            </div>
          </FlowStage>
        </div>
      </div>

      {/* ── Closing summary ───────────────────────────────────────────── */}
      <div className="border border-[color:rgba(244,246,250,0.08)] bg-[#070B14] p-6">
        <h3 className="text-sm font-semibold text-white mb-3">In summary</h3>
        <dl className="space-y-2 text-xs leading-relaxed">
          <div>
            <dt className="inline font-semibold text-slate-200">Objective — </dt>
            <dd className="inline text-slate-400">
              exit a large XRP position into EUR/USD at the best possible average price.
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold text-slate-200">Method — </dt>
            <dd className="inline text-slate-400">
              small tranches, spaced out, spread across multiple off-ramps, calibrated on 5 years of
              order-book data.
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold text-slate-200">Decision safety — </dt>
            <dd className="inline text-slate-400">
              a hand-coded verification AI checks every trade before it executes.
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold text-slate-200">Counterparty safety — </dt>
            <dd className="inline text-slate-400">
              SafePath (Corridor + Entity Audit) rules out unreliable providers, unchanged from
              what's live today.
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold text-slate-200">Guiding principle — </dt>
            <dd className="inline text-slate-400">
              never break the market — even if it means waiting.
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function FlowStage({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[color:rgba(244,246,250,0.08)] p-5 -m-px">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex h-5 w-5 items-center justify-center border border-[color:var(--page-accent-400)] font-mono text-[9px] font-bold text-[color:var(--page-accent-400)]">
          {n}
        </span>
        <span className="text-xs font-semibold text-white">{title}</span>
      </div>
      {children}
    </div>
  );
}
