/**
 * Page-wide constellation backdrop: a viewport-fixed star field with a few
 * hairlines joining nearby stars. Sits at z-0 behind the home page while the
 * sections above it are either opaque (#070B14, stars hidden) or slightly
 * translucent (rgba(2,4,9,0.72), stars showing through as faint texture) — the
 * parallax that gives the page its depth.
 *
 * Geometry is fixed data (constellationField.ts) rather than random, so the
 * field never reshuffles between loads or route transitions.
 */

import type * as React from "react";
import { CONSTELLATION_LINKS, CONSTELLATION_STARS } from "./constellationField.js";

export function Constellation(): JSX.Element {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <svg
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        aria-hidden="true"
      >
        <g stroke="#8FB4FF" strokeWidth="0.6" opacity="0.07">
          {CONSTELLATION_LINKS.map(([x1, y1, x2, y2]) => (
            <line key={`${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} />
          ))}
        </g>
        <g fill="#F4F6FA">
          {CONSTELLATION_STARS.map(([cx, cy, r, lo, hi, dur, delay]) => (
            <circle
              key={`${cx}-${cy}`}
              cx={cx}
              cy={cy}
              r={r}
              opacity={lo}
              className="constellation-star"
              style={
                {
                  "--lo": lo,
                  "--hi": hi,
                  animationDuration: `${dur}s`,
                  animationDelay: `${delay}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
