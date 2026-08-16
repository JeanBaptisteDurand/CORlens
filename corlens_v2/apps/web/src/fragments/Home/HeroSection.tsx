import { Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button.js";

// three.js and three-globe are ~550KB gzipped, which is not something the hero
// headline should wait on. The globe is decorative, so it streams in on its own
// chunk after the copy has painted; until then the hero is simply unadorned.
const HeroCorridorGlobe = lazy(() =>
  import("../../components/layout/HeroCorridorGlobe.js").then((m) => ({
    default: m.HeroCorridorGlobe,
  })),
);

/**
 * Home hero — left-aligned copy with the rotating corridor globe crossing it
 * from the right, filling the viewport up to the first scroll. The globe is
 * deliberately allowed to overlap the copy: the scrim below suppresses the
 * constellation so the type stays the opaque base layer, and HeroCorridorGlobe
 * re-draws its arcs above the copy inside the overlap band only.
 *
 * `data-hero-copy` is load-bearing: the globe measures it to keep corridor and
 * continent labels off the type.
 */
export function HeroSection(): JSX.Element {
  const navigate = useNavigate();

  return (
    <section id="top" className="relative z-[1] overflow-hidden">
      <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center max-hero:min-h-0 max-hero:flex-col">
        <div
          data-hero-copy
          className="relative z-[2] mx-auto w-full max-w-[1200px] px-6 pt-[104px] pb-[88px] max-hero:pb-0"
        >
          <div className="flex max-w-[560px] flex-col items-start gap-6">
            <div className="inline-flex items-center gap-2.5 border border-[color:rgba(110,143,221,0.35)] px-3.5 py-1.5">
              <span className="h-[5px] w-[5px] bg-[#6E8FDD]" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[#9AAAD0]">
                For XRPL liquidity holders
              </span>
            </div>

            {/* Wider than its 560px wrapper on purpose: the headline reaches into
                the globe, which is what makes the two layers read as one image —
                and it is what keeps each line unbroken. Full width once the globe
                moves below the copy. */}
            <h1 className="w-[800px] text-balance text-[48px] font-bold leading-[1.08] tracking-[-0.025em] text-[#F4F6FA] max-hero:w-full max-hero:text-[34px]">
              {"Watch"}
              <span className="text-[color:var(--page-accent-400)]"> your money moves</span>.
              <br />
              {"Not "}
              <span className="text-[color:var(--page-accent-400)]">your balance</span>.
            </h1>

            <p className="max-w-[520px] text-pretty text-lg leading-relaxed text-[#8A93A6]">
              You set the volume, CORLens moves it in tranches too small for the market to notice.
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-4">
              <Button size="lg" onClick={() => navigate("/corridors")}>
                Open the live platform
              </Button>
              <a
                href="#roadmap"
                className="inline-flex items-center justify-center gap-2 border border-[color:var(--app-glass-panel-border)] px-6 py-2.5 text-base font-medium text-slate-200 transition-all duration-150 hover:bg-white/5 hover:text-slate-200"
              >
                See where it is going
              </a>
            </div>
          </div>
        </div>

        <div aria-hidden className="hero-scrim pointer-events-none absolute inset-0 z-0" />

        <Suspense fallback={null}>
          <HeroCorridorGlobe />
        </Suspense>

        {/* Scroll invitation. The hero fills the viewport, so without this the page
            gives no sign that five more sections follow. Aligned to the copy column
            rather than centred: the middle of the frame is all globe. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-8 z-[4] mx-auto max-w-[1200px] px-6 max-hero:hidden">
          <a
            href="#why"
            aria-label="Scroll to why we created CORLens"
            className="group pointer-events-auto inline-flex flex-col items-start gap-2.5"
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-500 transition-colors duration-200 group-hover:text-slate-300">
              Scroll
            </span>
            <span
              aria-hidden
              className="scroll-hint ml-[3px] block h-9 w-px bg-[color:rgba(244,246,250,0.18)]"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
