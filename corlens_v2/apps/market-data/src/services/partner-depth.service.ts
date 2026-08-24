import type { PartnerActor, PartnerDepthSnapshot } from "@corlens/contracts/dist/market-data.js";
import { fetchBinanceDepth } from "../connectors/partner-binance.js";
import { fetchBitsoDepth } from "../connectors/partner-bitso.js";
import { fetchBitstampDepth } from "../connectors/partner-bitstamp.js";
import { fetchKrakenDepth } from "../connectors/partner-kraken.js";
import { fetchXrplDexDepth } from "../connectors/partner-xrpl-dex.js";
import type { XrplClient } from "../connectors/xrpl-client.js";
import type { CacheService } from "./cache.service.js";

export type PartnerDepthServiceOptions = {
  cache: CacheService;
  xrpl: XrplClient;
  ttlSeconds: number;
};

export type PartnerDepthService = ReturnType<typeof createPartnerDepthService>;

// Callers send a venue-neutral "XRP/MXN"; every venue spells its pairs
// differently (Bitso xrp_mxn, Bitstamp xrpusd, Kraken/Binance XRPUSD).
export function normalizeBook(actor: PartnerActor, book: string): string {
  const parts = book.split(/[/_-]/).filter(Boolean);
  if (parts.length !== 2) return book;
  const [base, quote] = parts as [string, string];
  switch (actor) {
    case "bitso":
      return `${base}_${quote}`.toLowerCase();
    case "bitstamp":
      return `${base}${quote}`.toLowerCase();
    case "kraken":
    case "binance":
      return `${base}${quote}`.toUpperCase();
    default:
      return book;
  }
}

export function createPartnerDepthService(opts: PartnerDepthServiceOptions) {
  return {
    async fetch(actor: PartnerActor, rawBook: string): Promise<PartnerDepthSnapshot> {
      const book = normalizeBook(actor, rawBook);
      const key = `partner:${actor}:${book}`;
      return opts.cache.getOrSet(key, opts.ttlSeconds, async () => {
        switch (actor) {
          case "bitso":
            return fetchBitsoDepth({ book, ttlSeconds: opts.ttlSeconds });
          case "bitstamp":
            return fetchBitstampDepth({ pair: book, ttlSeconds: opts.ttlSeconds });
          case "kraken":
            return fetchKrakenDepth({ pair: book, ttlSeconds: opts.ttlSeconds });
          case "binance":
            return fetchBinanceDepth({ symbol: book, ttlSeconds: opts.ttlSeconds });
          case "xrpl-dex":
            return fetchXrplDexDepth({
              pairKey: rawBook,
              client: opts.xrpl,
              ttlSeconds: opts.ttlSeconds,
            });
        }
      });
    },
  };
}
