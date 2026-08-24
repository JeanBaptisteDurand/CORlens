import { describe, expect, it } from "vitest";
import {
  classifyRailStatus,
  deriveSeedStatus,
  scoreActorSide,
  shouldPreserveExisting,
} from "../../src/services/seed-status.service.js";

const ODL = { odl: true, supportsXrp: true };
const CEX = { supportsXrp: true };

describe("seed-status.service", () => {
  describe("scoreActorSide (ported from v1 catalog)", () => {
    it("scores odl +3, rlusd +2, xrp +1 on the best actor plus breadth", () => {
      // best = 3+1 = 4 (odl actor), breadth = min(3, 2-1) = 1
      expect(scoreActorSide([ODL, CEX])).toBe(5);
    });

    it("caps the breadth bonus at +3", () => {
      expect(scoreActorSide([CEX, CEX, CEX, CEX, CEX, CEX])).toBe(1 + 3);
    });

    it("returns 0 for an empty side", () => {
      expect(scoreActorSide([])).toBe(0);
      expect(scoreActorSide(undefined)).toBe(0);
    });
  });

  describe("classifyRailStatus", () => {
    it("is GREEN when both sides score >= 4", () => {
      expect(classifyRailStatus(4, 6).status).toBe("GREEN");
    });
    it("is AMBER when the weak side scores 2-3", () => {
      expect(classifyRailStatus(2, 6).status).toBe("AMBER");
    });
    it("is RED when one side scores < 2", () => {
      expect(classifyRailStatus(1, 6).status).toBe("RED");
    });
  });

  describe("deriveSeedStatus", () => {
    it("classifies off-chain-bridge corridors from actor quality", () => {
      const out = deriveSeedStatus({
        category: "off-chain-bridge",
        shortLabel: "AED → PHP",
        srcActors: [ODL, ODL],
        dstActors: [ODL, CEX, CEX],
      });
      expect(out.status).toBe("GREEN");
      expect(out.pathCount).toBeGreaterThanOrEqual(2);
    });

    it("seeds non-bridge categories AMBER like v1 (on-chain refresh refines them)", () => {
      const out = deriveSeedStatus({
        category: "fiat-fiat",
        shortLabel: "USD → EUR",
        srcActors: [ODL, ODL],
        dstActors: [ODL, ODL],
      });
      expect(out.status).toBe("AMBER");
    });

    it("reuses the route count promised by the shortLabel when present", () => {
      const out = deriveSeedStatus({
        category: "fiat-fiat",
        shortLabel: "USD → EUR (16 routes)",
        srcActors: [ODL],
        dstActors: [ODL],
      });
      expect(out.pathCount).toBe(16);
    });

    it("gives RED corridors zero routes", () => {
      const out = deriveSeedStatus({
        category: "off-chain-bridge",
        shortLabel: "XXX → YYY",
        srcActors: [],
        dstActors: [ODL],
      });
      expect(out.status).toBe("RED");
      expect(out.pathCount).toBe(0);
    });
  });

  describe("shouldPreserveExisting (cron guard)", () => {
    it("preserves a healthy status when a scan comes back empty", () => {
      expect(
        shouldPreserveExisting("GREEN", { status: "RED", pathCount: 0 }),
      ).toBe(true);
      expect(
        shouldPreserveExisting("AMBER", { status: "UNKNOWN", pathCount: 0 }),
      ).toBe(true);
    });

    it("lets real scan results through when paths were found", () => {
      expect(
        shouldPreserveExisting("GREEN", { status: "AMBER", pathCount: 1 }),
      ).toBe(false);
    });

    it("does not preserve when the existing status is already RED or UNKNOWN", () => {
      expect(
        shouldPreserveExisting("RED", { status: "RED", pathCount: 0 }),
      ).toBe(false);
      expect(
        shouldPreserveExisting("UNKNOWN", { status: "UNKNOWN", pathCount: 0 }),
      ).toBe(false);
    });
  });
});
