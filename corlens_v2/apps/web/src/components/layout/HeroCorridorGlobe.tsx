/**
 * Hero corridor globe — a slowly rotating WebGL earth with liquidity pulsing
 * across XRPL payment corridors, and one corridor visibly interrupted.
 *
 * Built on globe.gl (three-globe / three.js). Its layers map onto the design
 * directly: hexed land polygons drawn as dots give the dot-matrix earth, the
 * built-in graticule and atmosphere give the wireframe and the limb glow, and
 * animated dashed arcs give the travelling corridor pulses. Venue and continent
 * labels are real DOM through the html-elements layer, so they keep the site's
 * mono and Sora faces instead of being rasterised into the scene.
 *
 * The globe is a background element: pointer interaction is off, and rendering
 * pauses whenever the hero scrolls out of view or motion is unwelcome.
 *
 * Labels are additionally suppressed wherever they would land on the hero copy,
 * measured from `data-hero-copy` — the type is the layer that has to stay
 * readable.
 */

import Globe, { type GlobeInstance } from "globe.gl";
import { useEffect, useRef, useState } from "react";
import { LineBasicMaterial, LineSegments, MeshBasicMaterial } from "three";
import { HERO_GLOBE_LAND } from "../../lib/heroGlobeLand.js";

// ─── Scene constants ─────────────────────────────────────────────────────
/** Camera latitude: the north pole leans away from the viewer. */
const VIEW_LAT = 16;
/**
 * Camera distance in globe radii. At this altitude the sphere fills 0.789 of the
 * frame's height, which is the ratio `.hero-globe-frame` sizes itself against to
 * land a sphere ~1.1x the hero's height. Changing one means changing the other.
 */
const VIEW_ALTITUDE = 1.9;
/** Seconds per revolution. OrbitControls counts 60 / autoRotateSpeed. */
const SECONDS_PER_TURN = 75;

const ACCENT = "#8FB4FF";
const ACCENT_DIM = "rgba(143,180,255,0.22)";
const LAND_DOT = "#3E465E";
/** Barely above the page background: the sphere hides the far side without
    reading as a lighter disc cut out of the night. */
const SPHERE = "#030610";
/** Matches the design's hairline graticule, well below three-globe's default. */
const GRATICULE_OPACITY = 0.045;

type Lane = {
  venue: string;
  from: readonly [lat: number, lng: number];
  to: readonly [lat: number, lng: number];
  /** Arc apex height, in globe radii. */
  altitude: number;
  /** Time for one pulse to travel the corridor, in ms. */
  pulseMs: number;
  /** Fraction of a cycle this corridor waits before firing, so they stagger. */
  offset: number;
};

// Corridors spread across distinct regions, so the globe never reads as one lane.
const LANES: readonly Lane[] = [
  {
    venue: "KRAKEN",
    from: [51.51, -0.13],
    to: [19.43, -99.13],
    altitude: 0.3,
    pulseMs: 5200,
    offset: 0,
  },
  {
    venue: "BINANCE",
    from: [1.35, 103.82],
    to: [35.69, 139.69],
    altitude: 0.22,
    pulseMs: 4600,
    offset: 0.42,
  },
  {
    venue: "BITSTAMP",
    from: [-23.55, -46.63],
    to: [38.72, -9.14],
    altitude: 0.28,
    pulseMs: 5800,
    offset: 0.18,
  },
  {
    venue: "XRPL DEX",
    from: [25.2, 55.27],
    to: [19.08, 72.88],
    altitude: 0.16,
    pulseMs: 4400,
    offset: 0.66,
  },
  {
    venue: "BITSO",
    from: [-26.2, 28.05],
    to: [50.11, 8.68],
    altitude: 0.34,
    pulseMs: 6000,
    offset: 0.84,
  },
];

/** Broken into dashes and never lit: a corridor the agent refused. */
const REJECTED = {
  from: [-33.87, 151.21] as const,
  to: [14.6, 120.98] as const,
  altitude: 0.14,
};

const CONTINENTS: readonly { name: string; lat: number; lng: number }[] = [
  { name: "EUROPE", lat: 50, lng: 15 },
  { name: "NORTH AMERICA", lat: 42, lng: -100 },
  { name: "SOUTH AMERICA", lat: -12, lng: -58 },
  { name: "AFRICA", lat: 3, lng: 20 },
  { name: "ASIA", lat: 40, lng: 90 },
  { name: "OCEANIA", lat: -25, lng: 140 },
];

// ─── Arc data ────────────────────────────────────────────────────────────

type Arc = {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  altitude: number;
  color: string;
  stroke: number;
  dashLength: number;
  dashGap: number;
  dashInitialGap: number;
  dashAnimateTime: number;
};

/**
 * Each corridor is two arcs stacked: a permanent dim line so the route is always
 * legible, and a bright dash travelling along it. The rejected corridor gets a
 * single broken line and no pulse.
 */
function buildArcs(animated: boolean): Arc[] {
  const base = (lane: Lane): Arc => ({
    startLat: lane.from[0],
    startLng: lane.from[1],
    endLat: lane.to[0],
    endLng: lane.to[1],
    altitude: lane.altitude,
    color: ACCENT_DIM,
    stroke: 0.28,
    dashLength: 1,
    dashGap: 0,
    dashInitialGap: 0,
    dashAnimateTime: 0,
  });
  const pulse = (lane: Lane): Arc => ({
    ...base(lane),
    color: ACCENT,
    stroke: 0.62,
    dashLength: 0.34,
    dashGap: 0.66,
    dashInitialGap: lane.offset,
    // A zero animate time parks the dash where its initial gap put it, which is
    // exactly the still composition reduced motion wants.
    dashAnimateTime: animated ? lane.pulseMs : 0,
  });
  return [
    ...LANES.map(base),
    ...LANES.map(pulse),
    {
      startLat: REJECTED.from[0],
      startLng: REJECTED.from[1],
      endLat: REJECTED.to[0],
      endLng: REJECTED.to[1],
      altitude: REJECTED.altitude,
      color: "rgba(143,180,255,0.16)",
      stroke: 0.28,
      dashLength: 0.22,
      dashGap: 0.16,
      dashInitialGap: 0,
      dashAnimateTime: 0,
    },
  ];
}

// ─── Labels ──────────────────────────────────────────────────────────────

type Marker = { lat: number; lng: number; text: string; kind: "venue" | "continent" };

const MARKERS: readonly Marker[] = [
  ...LANES.map((lane) => ({
    // Over the corridor's midpoint, which is where its apex sits.
    lat: (lane.from[0] + lane.to[0]) / 2,
    lng: (lane.from[1] + lane.to[1]) / 2,
    text: lane.venue,
    kind: "venue" as const,
  })),
  ...CONTINENTS.map((c) => ({ lat: c.lat, lng: c.lng, text: c.name, kind: "continent" as const })),
];

function markerElement(marker: Marker): HTMLElement {
  const el = document.createElement("div");
  el.textContent = marker.text;
  el.className =
    marker.kind === "venue"
      ? "whitespace-nowrap font-mono text-[9.5px] tracking-[0.1em] text-slate-400"
      : "whitespace-nowrap text-[8.5px] font-medium tracking-[0.26em] text-[#4A5470]";
  el.style.transition = "opacity 240ms ease";
  el.style.pointerEvents = "none";
  // Carried on the element so the marker loop never has to match elements back to
  // data by index. `behind` is seeded here because the visibility modifier only
  // fires on change, and the loop needs the attribute to exist from frame one.
  el.dataset.behind = "false";
  el.dataset.half = String(marker.text.length * (marker.kind === "venue" ? 3.6 : 4.2));
  return el;
}

/** Screen offset CSS2DRenderer already wrote onto a marker. Costs no layout. */
function markerOffset(el: HTMLElement): { x: number; y: number } | null {
  const match = /translate\(\s*(-?[\d.]+)px\s*,\s*(-?[\d.]+)px\s*\)\s*$/.exec(el.style.transform);
  return match ? { x: Number(match[1]), y: Number(match[2]) } : null;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The globe sits above the copy rather than behind it, blended with `lighten`.
 * Because every part of the globe except the corridors is darker than the type,
 * lighten leaves the headline at full contrast by construction while letting the
 * bright arcs read across the darker copy beneath. That is the whole overlay
 * rule in one line of CSS: no second render pass, no clip band to maintain.
 *
 * Sizing lives in `.hero-globe-frame` so it can key off the hero's height.
 */
const GLOBE_FRAME = "hero-globe-frame pointer-events-none absolute [mix-blend-mode:lighten]";

export function HeroCorridorGlobe(): JSX.Element {
  const hostRef = useRef<HTMLDivElement>(null);

  // A parked frame replaces the animation when motion is unwelcome or the globe
  // has collapsed under the copy on a narrow viewport. Tracked in state so
  // crossing the breakpoint rebuilds the scene in the right mode.
  const [frozen, setFrozen] = useState(() => prefersReducedMotion() || window.innerWidth <= 900);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const narrow = window.matchMedia("(max-width: 900px)");
    const sync = (): void => setFrozen(motion.matches || narrow.matches);
    motion.addEventListener("change", sync);
    narrow.addEventListener("change", sync);
    return () => {
      motion.removeEventListener("change", sync);
      narrow.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const globe: GlobeInstance = new Globe(host, {
      animateIn: false,
      rendererConfig: { alpha: true, antialias: true },
    });

    globe
      .width(host.clientWidth)
      .height(host.clientHeight)
      .backgroundColor("rgba(0,0,0,0)")
      // Opaque near-black sphere: it hides the far side of the arcs and of the
      // land dots, which is what makes the projection read as a ball.
      .globeMaterial(new MeshBasicMaterial({ color: SPHERE }))
      .showGraticules(true)
      .showAtmosphere(true)
      .atmosphereColor("#3B5BA8")
      .atmosphereAltitude(0.09)
      .hexPolygonsData(HERO_GLOBE_LAND.features)
      .hexPolygonUseDots(true)
      // Resolution 2 lands ~1,600 dots over the land, the spacing the design
      // draws. Resolution 3 is seven times denser and reads as a solid mass.
      .hexPolygonResolution(2)
      .hexPolygonMargin(0.72)
      .hexPolygonAltitude(0.004)
      .hexPolygonColor(() => LAND_DOT)
      .arcsData(buildArcs(!frozen))
      .arcAltitude("altitude")
      .arcColor("color")
      .arcStroke("stroke")
      .arcDashLength("dashLength")
      .arcDashGap("dashGap")
      .arcDashInitialGap("dashInitialGap")
      .arcDashAnimateTime("dashAnimateTime")
      .arcsTransitionDuration(0)
      .htmlElementsData(MARKERS as unknown as object[])
      .htmlElement((d) => markerElement(d as Marker))
      .htmlElementVisibilityModifier((el, isVisible) => {
        // Record globe.gl's far-side verdict; the marker loop below combines it
        // with the copy-collision test to decide the final opacity.
        el.dataset.behind = isVisible ? "false" : "true";
      })
      .enablePointerInteraction(false)
      .pointOfView({ lat: VIEW_LAT, lng: -30, altitude: VIEW_ALTITUDE });

    // three-globe hardcodes the graticule as lightgrey at 0.1, which is far too
    // present against this background. It is not exposed as a prop, so dim the
    // material in place.
    for (const obj of globe.scene().children) {
      obj.traverse((node) => {
        if (node instanceof LineSegments && node.material instanceof LineBasicMaterial) {
          node.material.color.set("#F4F6FA");
          node.material.opacity = GRATICULE_OPACITY;
        }
      });
    }

    const controls = globe.controls();
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableRotate = false;
    controls.autoRotate = !frozen;
    controls.autoRotateSpeed = 60 / SECONDS_PER_TURN;

    const resize = new ResizeObserver(() => {
      globe.width(host.clientWidth).height(host.clientHeight);
    });
    resize.observe(host);

    // ── Keep labels off the hero copy ──────────────────────────────────────
    /** Copy bounds in the marker layer's own coordinate space. */
    let copyBox: { left: number; right: number; top: number; bottom: number } | null = null;
    const measureCopy = (): void => {
      const wrap = document.querySelector("[data-hero-copy] > div");
      const frame = host.getBoundingClientRect();
      if (!wrap || !frame.width) return;
      // The union of the copy block's children, not the wrapper: a width override
      // on the h1 reaches further right than its parent.
      const kids = Array.from(wrap.children)
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width);
      if (!kids.length) return;
      copyBox = {
        left: Math.min(...kids.map((r) => r.left)) - frame.left,
        right: Math.max(...kids.map((r) => r.right)) - frame.left,
        top: Math.min(...kids.map((r) => r.top)) - frame.top,
        bottom: Math.max(...kids.map((r) => r.bottom)) - frame.top,
      };
    };
    measureCopy();
    window.addEventListener("resize", measureCopy);
    // Fonts shift the copy box, and the box is what keeps labels off the headline.
    if (document.fonts?.ready) void document.fonts.ready.then(measureCopy);

    let markerRaf = 0;
    let disposed = false;
    const syncMarkers = (): void => {
      if (disposed) return;
      markerRaf = requestAnimationFrame(syncMarkers);
      for (const el of host.querySelectorAll<HTMLElement>("[data-behind]")) {
        const at = markerOffset(el);
        const half = Number(el.dataset.half) || 24;
        const onCopy =
          copyBox !== null &&
          at !== null &&
          at.x + half > copyBox.left &&
          at.x - half < copyBox.right &&
          at.y + 8 > copyBox.top &&
          at.y - 8 < copyBox.bottom;
        el.style.opacity = el.dataset.behind === "true" || onCopy ? "0" : "1";
      }
    };

    // ── Only render while the hero is on screen ────────────────────────────
    // A WebGL background has no business burning frames behind five other
    // sections, and a parked composition needs no frames at all.
    let running = false;
    const setRunning = (next: boolean): void => {
      if (next === running) return;
      running = next;
      // Surfaced on the host so the render state is inspectable and testable.
      host.dataset.rendering = String(next);
      if (next) {
        globe.resumeAnimation();
        markerRaf = requestAnimationFrame(syncMarkers);
      } else {
        globe.pauseAnimation();
        cancelAnimationFrame(markerRaf);
      }
    };

    let onScreen = true;
    /** Frozen mode still needs frames until the still has actually been drawn. */
    let stillDrawn = false;
    const apply = (): void => setRunning(onScreen && !(frozen && stillDrawn));
    setRunning(true);

    const visibility = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        apply();
      },
      { rootMargin: "100px" },
    );
    visibility.observe(host);

    // Globe geometry is tessellated asynchronously, so a frozen hero cannot stop
    // on the first frame: it would stop on an empty canvas. Give it a beat.
    const settle = frozen
      ? window.setTimeout(() => {
          stillDrawn = true;
          apply();
        }, 900)
      : 0;

    return () => {
      disposed = true;
      window.clearTimeout(settle);
      cancelAnimationFrame(markerRaf);
      visibility.disconnect();
      resize.disconnect();
      window.removeEventListener("resize", measureCopy);
      globe._destructor();
      host.replaceChildren();
    };
  }, [frozen]);

  return (
    <>
      <div
        ref={hostRef}
        role="img"
        aria-label="Liquidity routed across XRPL payment corridors on a rotating globe, one corridor rejected"
        className={`${GLOBE_FRAME} z-[3] max-hero:relative max-hero:top-auto max-hero:right-auto max-hero:mx-auto max-hero:mt-8 max-hero:translate-y-0 max-hero:[mix-blend-mode:normal]`}
      />

      {/* Globe telemetry. Anchored to the hero band, not to the globe: the globe is
          taller than the hero and its own lower edge sits well below the fold, so a
          caption hung off the sphere would never be seen. Hidden once the globe
          moves below the copy, where there is no band to sit in. */}
      <div className="absolute bottom-9 left-[62%] z-[4] flex flex-col gap-[5px] whitespace-nowrap max-hero:hidden">
        <span className="font-mono text-[10px] tracking-[0.14em] text-slate-400">
          2,436 CORRIDORS CLASSIFIED
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-[5px] w-[5px] bg-[#8FB4FF]" />
          <span className="font-mono text-[10px] tracking-[0.1em] text-slate-400">
            6 bps · 60s refresh
          </span>
        </span>
      </div>
    </>
  );
}
