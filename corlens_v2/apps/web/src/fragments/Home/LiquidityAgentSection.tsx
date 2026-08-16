/**
 * The Liquidity Agent — the next product, framed as the problem it solves rather
 * than a feature list. Sits inside an accent-bordered panel so it reads as
 * forward-looking against the shipped sections above it.
 */

/** Mono all-caps section label. */
function Eyebrow({
  color,
  tracking,
  children,
}: {
  color: string;
  tracking: string;
  children: React.ReactNode;
}): JSX.Element {
  return (
    <div
      className="mb-3 font-mono text-[10px] font-bold uppercase"
      style={{ color, letterSpacing: tracking }}
    >
      {children}
    </div>
  );
}

const ENGINE = {
  title: "Automation Engine",
  body: "Deterministic rules, no inference. It reads depth continuously and sizes every tranche, its timing and its pause.",
  points: [
    "Continuous depth read",
    "Tranche size, timing, pause",
    "Full audit trail of every decision",
  ],
};

const VERIFIER = {
  title: "AI verification layer",
  body: "Hand coded and auditable. It validates size, timing and provider before execution, and blocks anything aberrant.",
  points: [
    "Checked before every trade",
    "Explicit logic, readable end to end",
    "It blocks, it never overrides",
  ],
};

export function LiquidityAgentSection(): JSX.Element {
  return (
    <section className="relative z-[1] bg-[color:rgba(2,4,9,0.72)] px-6 py-20">
      <div className="mx-auto max-w-[1152px]">
        <div className="border border-[color:rgba(110,143,221,0.35)] bg-[color:rgba(110,143,221,0.04)] p-11 max-hero:p-7">
          <div className="max-w-[720px]">
            <Eyebrow color="var(--page-accent-400)" tracking="0.3em">
              Next · the Liquidity Agent
            </Eyebrow>
            <h2 className="mb-[18px] text-balance text-[34px] font-bold leading-[1.15] tracking-[-0.025em] text-[#F4F6FA] max-hero:text-[26px]">
              Exit a large position{" "}
              <span className="text-[color:var(--page-accent-400)]">
                without telling the market
              </span>
              .
            </h2>
            <p className="mb-3 text-pretty text-[17px] leading-[1.6] text-[#C5CBE0]">
              A holder with a multi-million XRP position cannot sell frontally. A market order eats
              the book from the top down, slippage compounds, and other sellers follow.
            </p>
            <p className="text-pretty text-[17px] leading-[1.6] text-[#8A93A6]">
              The agent does the opposite: small tranches, spread over time, across ranked
              off-ramps, with pauses that let the book rebuild.
            </p>
          </div>

          <div className="mt-9 grid grid-cols-2 gap-px border border-[color:rgba(244,246,250,0.08)] bg-[color:rgba(244,246,250,0.08)] max-hero:grid-cols-1">
            {[ENGINE, VERIFIER].map((part) => (
              <div key={part.title} className="bg-[#070B14] p-7">
                <h3 className="mb-2.5 text-lg font-semibold text-[#F4F6FA]">{part.title}</h3>
                <p className="mb-4 text-[13.5px] leading-[1.6] text-[#7C8AA0]">{part.body}</p>
                <div className="flex flex-col gap-1.5 font-mono text-[11px] text-[#8A93A6]">
                  {part.points.map((point) => (
                    <span key={point}>{point}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-9 grid grid-cols-2 gap-10 border-t border-[color:rgba(244,246,250,0.08)] pt-8 max-hero:grid-cols-1">
            <div>
              <Eyebrow color="#10b981" tracking="0.2em">
                Counterparty safety
              </Eyebrow>
              <p className="mb-3.5 text-sm leading-[1.6] text-[#8A93A6]">
                Safe Path already does this work. Corridor picks the exit route and settlement
                currency. Entity Audit scores each provider on real liquidity, incidents, licensing
                and reputation.
              </p>
              <p className="text-sm leading-[1.6] text-[#C5CBE0]">
                The agent refuses a poorly rated off-ramp even when its price is the best on screen.
              </p>
            </div>
            <div className="border-l border-[color:rgba(110,143,221,0.35)] pl-6 max-hero:border-l-0 max-hero:pl-0">
              <Eyebrow color="var(--page-accent-400)" tracking="0.2em">
                Governing principle
              </Eyebrow>
              <p className="text-[19px] font-semibold leading-[1.45] text-[#F4F6FA]">
                The agent is allowed to do nothing. If no reliable off-ramp offers a good price, it
                waits. Patience protects the exit price.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
