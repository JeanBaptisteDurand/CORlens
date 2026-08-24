import { describe, expect, it } from "vitest";
import { normalizeBook } from "../../src/services/partner-depth.service.js";

describe("normalizeBook", () => {
  it("maps the neutral XRP/MXN spelling to each venue's pair format", () => {
    expect(normalizeBook("bitso", "XRP/MXN")).toBe("xrp_mxn");
    expect(normalizeBook("bitstamp", "XRP/USD")).toBe("xrpusd");
    expect(normalizeBook("kraken", "XRP/USD")).toBe("XRPUSD");
    expect(normalizeBook("binance", "xrp/usdt")).toBe("XRPUSDT");
  });

  it("passes through already-native or unrecognised spellings", () => {
    expect(normalizeBook("bitso", "xrp_mxn")).toBe("xrp_mxn");
    expect(normalizeBook("xrpl-dex", "USD-MXN")).toBe("USD-MXN");
    expect(normalizeBook("bitso", "weird")).toBe("weird");
  });
});
