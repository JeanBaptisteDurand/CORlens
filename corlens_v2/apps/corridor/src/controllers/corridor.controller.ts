import { corridor as cc } from "@corlens/contracts";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import type { CorridorRepo } from "../repositories/corridor.repo.js";
import type { StatusEventRepo } from "../repositories/status-event.repo.js";

const ErrorResp = z.object({ error: z.string() });

function normalizeAsset(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const r = raw as Record<string, unknown>;
  if (typeof r.currency === "string") return raw;
  if (typeof r.symbol === "string") {
    const { symbol, ...rest } = r;
    return { currency: symbol, ...rest };
  }
  return raw;
}

function assetCurrency(raw: unknown): string {
  const a = normalizeAsset(raw) as { currency?: string } | null;
  return a?.currency ?? "";
}

type MetaEntry = {
  issuers: Array<{ key?: string; name?: string; address?: string }>;
  actors: unknown[];
};

// Real-world actors for a currency; currencies with no recorded actor
// (e.g. CNY) fall back to their XRPL issuers presented as venues so the
// detail page never shows an empty leg.
function actorsFor(meta: MetaEntry | undefined): unknown[] {
  if (meta?.actors?.length) return meta.actors;
  return (meta?.issuers ?? []).map((i) => ({
    key: i.key ?? i.address ?? "issuer",
    name: i.name ?? i.key ?? "XRPL issuer",
    type: "cex",
    direction: "both",
    supportsXrp: true,
    note: "XRPL IOU issuer",
  }));
}

function makeRowToList(actorCounts: Map<string, number>) {
  return (r: Awaited<ReturnType<CorridorRepo["list"]>>[number]) => ({
    id: r.id,
    label: r.label,
    shortLabel: r.shortLabel,
    flag: r.flag,
    tier: r.tier,
    importance: r.importance,
    region: r.region,
    category: r.category,
    description: r.description,
    useCase: r.useCase,
    status: r.status as "GREEN" | "AMBER" | "RED" | "UNKNOWN",
    pathCount: r.pathCount,
    recRiskScore: r.recRiskScore,
    recCost: r.recCost,
    sourceActorCount: actorCounts.get(assetCurrency(r.sourceJson)) ?? 0,
    destActorCount: actorCounts.get(assetCurrency(r.destJson)) ?? 0,
    lastRefreshedAt: r.lastRefreshedAt ? r.lastRefreshedAt.toISOString() : null,
  });
}

export async function registerCorridorRoutes(
  app: FastifyInstance,
  corridors: CorridorRepo,
  events: StatusEventRepo,
  metaByCode: Map<string, MetaEntry> = new Map(),
): Promise<void> {
  const typed = app.withTypeProvider<ZodTypeProvider>();
  const actorCounts = new Map<string, number>();
  for (const [code, meta] of metaByCode) actorCounts.set(code, actorsFor(meta).length);
  const rowToList = makeRowToList(actorCounts);

  typed.get(
    "/api/corridors",
    {
      schema: {
        querystring: cc.CorridorListQuery,
        response: { 200: z.array(cc.CorridorListItem) },
        tags: ["corridor"],
      },
    },
    async (req) => {
      const rows = await corridors.list(req.query);
      return rows.map(rowToList);
    },
  );

  typed.get(
    "/api/corridors/:id",
    {
      schema: {
        params: z.object({ id: z.string() }),
        response: { 200: cc.CorridorDetail, 404: ErrorResp },
        tags: ["corridor"],
      },
    },
    async (req, reply) => {
      const r = await corridors.findById(req.params.id);
      if (!r) {
        reply.status(404).send({ error: "not_found" });
        return reply;
      }
      return {
        ...rowToList(r),
        importance: r.importance,
        description: r.description,
        useCase: r.useCase,
        highlights: (r.highlights as string[]) ?? [],
        amount: r.amount,
        source: normalizeAsset(r.sourceJson) as never,
        dest: normalizeAsset(r.destJson) as never,
        bestRouteId: r.bestRouteId,
        routes: (r.routesJson as unknown[]) ?? [],
        flags: Array.isArray(r.flagsJson) ? (r.flagsJson as unknown[]) : [],
        liquidity: r.liquidityJson,
        aiNote: r.aiNote,
        sourceActors: actorsFor(metaByCode.get(assetCurrency(r.sourceJson))),
        destActors: actorsFor(metaByCode.get(assetCurrency(r.destJson))),
      };
    },
  );

  typed.get(
    "/api/corridors/:id/status-history",
    {
      schema: {
        params: z.object({ id: z.string() }),
        querystring: cc.StatusHistoryQuery,
        response: { 200: cc.StatusHistoryResponse },
        tags: ["corridor"],
      },
    },
    async (req) => {
      const since = new Date(Date.now() - req.query.days * 24 * 60 * 60 * 1000).toISOString();
      const evts = await events.listSince(req.params.id, since);
      return {
        corridorId: req.params.id,
        events: evts.map((e) => ({
          ...e,
          status: e.status as "GREEN" | "AMBER" | "RED" | "UNKNOWN",
        })),
      };
    },
  );
}
