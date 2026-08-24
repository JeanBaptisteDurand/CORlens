// Rail-quality seed statuses, ported from the v1 catalog
// (corlens/apps/server/src/corridors/catalog.ts). The board's status for
// off-chain-bridge corridors reflects real-world rail quality (which
// XRPL-connected venues serve each side), NOT on-chain DEX depth — most of
// these lanes settle through ODL partners, so an on-chain path_find probe
// finding nothing is expected and must not repaint the board RED.
//
// Actor scoring (best actor on a side + breadth bonus):
//   +3  actor is a Ripple ODL / Ripple Payments partner
//   +2  actor has confirmed RLUSD support
//   +1  actor has XRP support
//   +1  bonus per additional actor beyond the first (caps at +3)
//
// Corridor status:
//   GREEN  min(srcScore, dstScore) >= 4    (both sides strong)
//   AMBER  min(srcScore, dstScore) >= 2    (both sides workable)
//   RED    min(srcScore, dstScore) <  2    (at least one side thin)

export type SeedActor = {
  odl?: boolean;
  supportsRlusd?: boolean;
  supportsXrp?: boolean;
};

export type SeedStatus = "GREEN" | "AMBER" | "RED";

export function scoreActorSide(actors: SeedActor[] | undefined): number {
  if (!actors || actors.length === 0) return 0;
  let best = 0;
  for (const a of actors) {
    let s = 0;
    if (a.odl) s += 3;
    if (a.supportsRlusd) s += 2;
    if (a.supportsXrp) s += 1;
    if (s > best) best = s;
  }
  const breadth = Math.min(3, actors.length - 1);
  return best + breadth;
}

export function classifyRailStatus(
  srcScore: number,
  dstScore: number,
): { status: SeedStatus; reason: string } {
  const m = Math.min(srcScore, dstScore);
  if (m >= 4) {
    return {
      status: "GREEN",
      reason: `Both sides strong: src score ${srcScore}, dst score ${dstScore}. ODL partners and/or RLUSD venues confirmed on both legs.`,
    };
  }
  if (m >= 2) {
    return {
      status: "AMBER",
      reason: `Workable but single-counterparty risk: src score ${srcScore}, dst score ${dstScore}. At least one XRPL-connected venue on each side.`,
    };
  }
  return {
    status: "RED",
    reason: `Thin coverage: src score ${srcScore}, dst score ${dstScore}. One side lacks a confirmed XRPL-connected venue.`,
  };
}

export type SeedStatusInput = {
  category: string;
  shortLabel: string;
  srcActors: SeedActor[] | undefined;
  dstActors: SeedActor[] | undefined;
};

export type SeedStatusResult = {
  status: SeedStatus;
  pathCount: number;
  flagsJson: unknown;
};

const ROUTES_IN_LABEL = /\((\d+) routes?\)/;

function plausiblePathCount(
  status: SeedStatus,
  shortLabel: string,
  srcActors: SeedActor[] | undefined,
  dstActors: SeedActor[] | undefined,
): number {
  const fromLabel = ROUTES_IN_LABEL.exec(shortLabel);
  if (fromLabel?.[1]) return Number(fromLabel[1]);
  if (status === "RED") return 0;
  const sides = Math.min(srcActors?.length ?? 0, dstActors?.length ?? 0);
  if (status === "GREEN") return Math.min(9, Math.max(2, sides));
  return Math.min(4, Math.max(1, sides));
}

export function deriveSeedStatus(input: SeedStatusInput): SeedStatusResult {
  const srcScore = scoreActorSide(input.srcActors);
  const dstScore = scoreActorSide(input.dstActors);
  // Non-bridge categories are seeded AMBER exactly like v1: their truth is
  // on-chain and the scanner refines them on the first refresh that finds
  // paths. Bridge corridors keep the rail-quality classification.
  const rail = classifyRailStatus(srcScore, dstScore);
  const status: SeedStatus =
    input.category === "off-chain-bridge" ? rail.status : "AMBER";
  return {
    status,
    pathCount: plausiblePathCount(status, input.shortLabel, input.srcActors, input.dstActors),
    flagsJson: {
      reason: "rail_quality_seed",
      srcScore,
      dstScore,
      note: rail.reason,
    },
  };
}

// Cron guard: an on-chain probe that found nothing must never repaint a
// rail-quality GREEN/AMBER corridor — off-chain rails are invisible to
// path_find. A probe that DID find paths is real data and always wins.
export function shouldPreserveExisting(
  existingStatus: string,
  scan: { status: string; pathCount: number },
): boolean {
  const scanEmpty = scan.pathCount === 0 && (scan.status === "RED" || scan.status === "UNKNOWN");
  const existingHealthy = existingStatus === "GREEN" || existingStatus === "AMBER";
  return scanEmpty && existingHealthy;
}
