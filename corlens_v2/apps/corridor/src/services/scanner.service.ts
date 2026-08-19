import type { MarketDataClient } from "../connectors/market-data.js";
import { computeStatus } from "./status-compute.service.js";

export type ScanInput = {
  id: string;
  source: { currency: string; issuer?: string } | null;
  dest: { currency: string; issuer?: string } | null;
  amount: string | null;
};

export type ScanResult = {
  corridorId: string;
  status: "GREEN" | "AMBER" | "RED" | "UNKNOWN";
  pathCount: number;
  recRiskScore: number | null;
  recCost: string | null;
  flagsJson: unknown;
  routesJson: unknown;
  liquidityJson: unknown;
  error: string | null;
};

// Narrow view of CurrencyMetaService: the scanner only needs issuer lookup.
export type IssuerSource = {
  getByCode(code: string): Promise<{ issuers: Array<{ address: string }> } | null>;
};

export type ScannerServiceOptions = {
  marketData: MarketDataClient;
  currencyMeta?: IssuerSource;
  timeoutMs: number;
};

export type ScannerService = ReturnType<typeof createScannerService>;

export function createScannerService(opts: ScannerServiceOptions) {
  return {
    async scan(input: ScanInput): Promise<ScanResult> {
      if (!input.source || !input.dest || !input.amount) {
        return {
          corridorId: input.id,
          status: "RED",
          pathCount: 0,
          recRiskScore: null,
          recCost: null,
          flagsJson: { reason: "missing_source_or_dest" },
          routesJson: [],
          liquidityJson: null,
          error: "missing_source_or_dest",
        };
      }

      // The corridor catalog stores abstract assets (currency only); real
      // XRPL issuers live in CurrencyMeta. An IOU path_find without a valid
      // issuer is always rejected upstream, so resolve one or skip the call.
      const resolveIssuer = async (asset: { currency: string; issuer?: string }) => {
        if (asset.issuer) return asset.issuer;
        if (!opts.currencyMeta || asset.currency === "XRP") return null;
        const meta = await opts.currencyMeta.getByCode(asset.currency);
        return meta?.issuers?.[0]?.address ?? null;
      };

      // Probe shape: can DST.issuer be delivered on the DEX, spending XRP
      // (the ODL bridge leg) or the source fiat? The destination issuer is
      // the only account guaranteed to accept its own IOU, so it serves as
      // both ends of the probe — a genesis-style account with no trustlines
      // can neither send nor receive IOUs and always yields 0 paths.
      let request: {
        sourceAccount: string;
        destinationAccount: string;
        destinationAmount: unknown;
        sourceCurrencies?: Array<{ currency: string; issuer?: string }>;
      };
      if (input.dest.currency === "XRP") {
        request = {
          sourceAccount: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
          destinationAccount: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
          destinationAmount: input.amount,
        };
      } else {
        const destIssuer = await resolveIssuer(input.dest);
        if (!destIssuer) {
          return {
            corridorId: input.id,
            status: "UNKNOWN",
            pathCount: 0,
            recRiskScore: null,
            recCost: null,
            flagsJson: { reason: "no_known_issuer", currency: input.dest.currency },
            routesJson: [],
            liquidityJson: null,
            error: "no_known_issuer",
          };
        }
        const sourceIssuer = await resolveIssuer(input.source);
        request = {
          sourceAccount: destIssuer,
          destinationAccount: destIssuer,
          destinationAmount: {
            currency: input.dest.currency,
            issuer: destIssuer,
            value: input.amount,
          },
          sourceCurrencies: [
            { currency: "XRP" },
            ...(sourceIssuer ? [{ currency: input.source.currency, issuer: sourceIssuer }] : []),
          ],
        };
      }

      try {
        const result = (await Promise.race([
          opts.marketData.pathFind(request),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("scan_timeout")), opts.timeoutMs),
          ),
        ])) as { result?: { alternatives?: unknown[] } };

        const pathCount = (result.result?.alternatives ?? []).length;
        const status = computeStatus({ pathCount, hasError: false, lastRefreshedAt: new Date() });
        return {
          corridorId: input.id,
          status,
          pathCount,
          recRiskScore: null,
          recCost: null,
          flagsJson: [],
          routesJson: result.result?.alternatives ?? [],
          liquidityJson: null,
          error: null,
        };
      } catch (err) {
        return {
          corridorId: input.id,
          status: "RED",
          pathCount: 0,
          recRiskScore: null,
          recCost: null,
          flagsJson: { reason: (err as Error).message },
          routesJson: [],
          liquidityJson: null,
          error: (err as Error).message,
        };
      }
    },
  };
}
