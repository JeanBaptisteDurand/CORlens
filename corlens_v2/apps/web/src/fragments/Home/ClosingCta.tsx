import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button.js";

/**
 * Closing CTA — two paired asks: run the shipped product, or talk about moving
 * size with the Liquidity Agent. Both land on real surfaces; the second routes to
 * the roadmap page, which is where the Liquidity Agent vision lives today.
 */
export function ClosingCta(): JSX.Element {
  const navigate = useNavigate();

  return (
    <section className="relative z-[1] border-t border-[color:rgba(244,246,250,0.08)] bg-[#070B14] px-6 pt-20 pb-24">
      <div className="mx-auto max-w-[1152px]">
        <div className="grid grid-cols-2 gap-px border border-[color:rgba(244,246,250,0.08)] bg-[color:rgba(244,246,250,0.08)] max-hero:grid-cols-1">
          <div className="bg-[#020409] p-11 max-hero:p-7">
            <h3 className="mb-3.5 text-[26px] font-bold tracking-[-0.02em] text-[#F4F6FA]">
              Run a <span className="text-[color:var(--page-accent-400)]">real route</span>.
            </h3>
            <p className="mb-6 max-w-[420px] text-[15px] leading-[1.6] text-[#8A93A6]">
              Pick a corridor, give the agent an amount, read the compliance report it produces.
            </p>
            <Button size="lg" onClick={() => navigate("/safe-path")}>
              Open CORLens
            </Button>
          </div>

          <div className="bg-[#020409] p-11 max-hero:p-7">
            <h3 className="mb-3.5 text-[26px] font-bold tracking-[-0.02em] text-[#F4F6FA]">
              <span className="text-[color:var(--page-accent-400)]">Move size</span> with us.
            </h3>
            <p className="mb-6 max-w-[420px] text-[15px] leading-[1.6] text-[#8A93A6]">
              Exit planning for a large position, or early access to the Liquidity Agent.
            </p>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate("/developers?tab=roadmap")}
            >
              Start a conversation
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[color:rgba(244,246,250,0.08)] pt-6">
          <Link
            to="/developers"
            className="font-mono text-xs tracking-[0.04em] text-[color:var(--page-accent-400)] hover:text-[color:var(--page-accent-300)]"
          >
            API docs
          </Link>
          <span className="font-mono text-[11px] text-[#5A6483]">
            Open source, running on XRPL mainnet
          </span>
        </div>
      </div>
    </section>
  );
}
