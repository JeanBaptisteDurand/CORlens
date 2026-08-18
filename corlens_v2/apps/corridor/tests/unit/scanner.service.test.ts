import { describe, expect, it, vi } from "vitest";
import { createScannerService } from "../../src/services/scanner.service.js";

const BITSTAMP = "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B";

function metaWith(issuer: string | null) {
  return {
    getByCode: vi.fn().mockResolvedValue(issuer ? { issuers: [{ address: issuer }] } : { issuers: [] }),
  };
}

describe("scanner.service", () => {
  it("returns GREEN status when path_find succeeds with multiple paths", async () => {
    const marketData = {
      pathFind: vi.fn().mockResolvedValue({
        result: {
          alternatives: [
            { paths_computed: [], source_amount: "100" },
            { paths_computed: [], source_amount: "100" },
          ],
        },
      }),
      bookOffers: vi.fn(),
      partnerDepth: vi.fn(),
    };
    const svc = createScannerService({
      marketData: marketData as never,
      currencyMeta: metaWith(BITSTAMP),
      timeoutMs: 5000,
    });
    const out = await svc.scan({
      id: "usd-mxn",
      source: { currency: "USD" },
      dest: { currency: "MXN" },
      amount: "100",
    });
    expect(out.status).toBe("GREEN");
    expect(out.pathCount).toBe(2);
  });

  it("resolves the destination issuer from currency meta when the asset lacks one", async () => {
    const marketData = {
      pathFind: vi.fn().mockResolvedValue({ result: { alternatives: [{}] } }),
      bookOffers: vi.fn(),
      partnerDepth: vi.fn(),
    };
    const currencyMeta = metaWith(BITSTAMP);
    const svc = createScannerService({
      marketData: marketData as never,
      currencyMeta,
      timeoutMs: 5000,
    });
    await svc.scan({
      id: "usd-eur",
      source: { currency: "USD" },
      dest: { currency: "EUR" },
      amount: "1000",
    });
    expect(currencyMeta.getByCode).toHaveBeenCalledWith("EUR");
    expect(marketData.pathFind).toHaveBeenCalledWith(
      expect.objectContaining({
        destinationAmount: { currency: "EUR", issuer: BITSTAMP, value: "1000" },
      }),
    );
  });

  it("keeps the corridor asset's explicit issuer without a meta lookup", async () => {
    const marketData = {
      pathFind: vi.fn().mockResolvedValue({ result: { alternatives: [{}] } }),
      bookOffers: vi.fn(),
      partnerDepth: vi.fn(),
    };
    const currencyMeta = metaWith(BITSTAMP);
    const svc = createScannerService({
      marketData: marketData as never,
      currencyMeta,
      timeoutMs: 5000,
    });
    await svc.scan({
      id: "usd-eur",
      source: { currency: "USD" },
      dest: { currency: "EUR", issuer: "rEXPLicit1111111111111111111111111" },
      amount: "1000",
    });
    expect(currencyMeta.getByCode).not.toHaveBeenCalled();
    expect(marketData.pathFind).toHaveBeenCalledWith(
      expect.objectContaining({
        destinationAmount: {
          currency: "EUR",
          issuer: "rEXPLicit1111111111111111111111111",
          value: "1000",
        },
      }),
    );
  });

  it("returns UNKNOWN without calling path_find when no issuer is known", async () => {
    const marketData = { pathFind: vi.fn(), bookOffers: vi.fn(), partnerDepth: vi.fn() };
    const svc = createScannerService({
      marketData: marketData as never,
      currencyMeta: metaWith(null),
      timeoutMs: 5000,
    });
    const out = await svc.scan({
      id: "aed-ars",
      source: { currency: "AED" },
      dest: { currency: "ARS" },
      amount: "5000",
    });
    expect(out.status).toBe("UNKNOWN");
    expect(out.error).toBe("no_known_issuer");
    expect(out.flagsJson).toEqual({ reason: "no_known_issuer", currency: "ARS" });
    expect(marketData.pathFind).not.toHaveBeenCalled();
  });

  it("passes the raw amount through for XRP destinations", async () => {
    const marketData = {
      pathFind: vi.fn().mockResolvedValue({ result: { alternatives: [{}] } }),
      bookOffers: vi.fn(),
      partnerDepth: vi.fn(),
    };
    const currencyMeta = metaWith(BITSTAMP);
    const svc = createScannerService({
      marketData: marketData as never,
      currencyMeta,
      timeoutMs: 5000,
    });
    await svc.scan({
      id: "usd-xrp",
      source: { currency: "USD" },
      dest: { currency: "XRP" },
      amount: "1000",
    });
    expect(currencyMeta.getByCode).not.toHaveBeenCalled();
    expect(marketData.pathFind).toHaveBeenCalledWith(
      expect.objectContaining({ destinationAmount: "1000" }),
    );
  });

  it("returns RED on path_find error", async () => {
    const marketData = {
      pathFind: vi.fn().mockRejectedValue(new Error("xrpl unreachable")),
      bookOffers: vi.fn(),
      partnerDepth: vi.fn(),
    };
    const svc = createScannerService({
      marketData: marketData as never,
      currencyMeta: metaWith(BITSTAMP),
      timeoutMs: 5000,
    });
    const out = await svc.scan({
      id: "usd-mxn",
      source: { currency: "USD" },
      dest: { currency: "MXN" },
      amount: "100",
    });
    expect(out.status).toBe("RED");
    expect(out.error).toMatch(/xrpl unreachable/);
  });

  it("returns RED status when source or dest is missing", async () => {
    const marketData = { pathFind: vi.fn(), bookOffers: vi.fn(), partnerDepth: vi.fn() };
    const svc = createScannerService({ marketData: marketData as never, timeoutMs: 5000 });
    const out = await svc.scan({ id: "x", source: null, dest: null, amount: null });
    expect(out.status).toBe("RED");
  });
});
