import { Constellation } from "../components/layout/Constellation.js";
import { ClosingCta } from "../fragments/Home/ClosingCta.js";
import { HeroSection } from "../fragments/Home/HeroSection.js";
import { LiquidityAgentSection } from "../fragments/Home/LiquidityAgentSection.js";
import { RoadmapCarousel } from "../fragments/Home/RoadmapCarousel.js";
import { TodayCarousel } from "../fragments/Home/TodayCarousel.js";
import { WhySection } from "../fragments/Home/WhySection.js";

// ─── Home ─────────────────────────────────────────────────────────────────
// Narrative order: the pitch (hero), the problem (why), what already ships
// (today), where it is going (roadmap), the product that gets there (liquidity
// agent), and the ask (closing).
//
// The constellation is viewport-fixed behind everything. Sections either sit on
// opaque #070B14 and hide it, or on rgba(2,4,9,0.72) and let it show through as
// faint texture — that alternation is what gives the page depth, so section
// backgrounds are load-bearing rather than decorative.

export default function Home(): JSX.Element {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#020409]">
      <Constellation />
      <HeroSection />
      <WhySection />
      <TodayCarousel />
      <RoadmapCarousel />
      <LiquidityAgentSection />
      <ClosingCta />
    </div>
  );
}
