import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import type { CurrencyMetaRepo } from "../repositories/currency-meta.repo.js";
import type { CorridorRepo } from "../repositories/corridor.repo.js";
import type { StatusEventRepo } from "../repositories/status-event.repo.js";
import type { ScannerService } from "../services/scanner.service.js";
import { deriveSeedStatus, type SeedActor } from "../services/seed-status.service.js";

const ErrorResp = z.object({ error: z.string() });

export async function registerAdminRoutes(
  app: FastifyInstance,
  corridors: CorridorRepo,
  events: StatusEventRepo,
  scanner: ScannerService,
  currencyMeta: CurrencyMetaRepo,
): Promise<void> {
  const typed = app.withTypeProvider<ZodTypeProvider>();

  // Repaint the whole board with v1-style rail-quality statuses. Idempotent;
  // run it after a fresh seed or after a scan run has flattened the board.
  typed.post(
    "/admin/seed-status",
    {
      schema: {
        response: {
          200: z.object({
            updated: z.number(),
            green: z.number(),
            amber: z.number(),
            red: z.number(),
          }),
        },
        tags: ["admin"],
      },
    },
    async () => {
      const actorsByCode = new Map<string, SeedActor[]>();
      for (const row of await currencyMeta.list()) {
        actorsByCode.set(row.code, (row.actors as SeedActor[]) ?? []);
      }
      const all = await corridors.list({ limit: 5000, offset: 0 });
      const counts = { updated: 0, green: 0, amber: 0, red: 0 };
      for (const c of all) {
        const src = (c.sourceJson as { currency?: string } | null)?.currency ?? "";
        const dst = (c.destJson as { currency?: string } | null)?.currency ?? "";
        const derived = deriveSeedStatus({
          category: c.category,
          shortLabel: c.shortLabel,
          srcActors: actorsByCode.get(src),
          dstActors: actorsByCode.get(dst),
        });
        await corridors.updateSeedStatus(c.id, derived);
        counts.updated += 1;
        if (derived.status === "GREEN") counts.green += 1;
        else if (derived.status === "AMBER") counts.amber += 1;
        else counts.red += 1;
      }
      return counts;
    },
  );

  typed.post(
    "/admin/scan/:id",
    {
      schema: {
        params: z.object({ id: z.string() }),
        response: {
          200: z.object({ ok: z.boolean(), status: z.string(), pathCount: z.number() }),
          404: ErrorResp,
        },
        tags: ["admin"],
      },
    },
    async (req, reply) => {
      const c = await corridors.findById(req.params.id);
      if (!c) {
        reply.status(404).send({ error: "not_found" });
        return reply;
      }
      const result = await scanner.scan({
        id: c.id,
        source: c.sourceJson as never,
        dest: c.destJson as never,
        amount: c.amount,
      });
      await corridors.updateScan(c.id, {
        status: result.status,
        pathCount: result.pathCount,
        recRiskScore: result.recRiskScore,
        recCost: result.recCost,
        flagsJson: result.flagsJson,
        routesJson: result.routesJson,
        liquidityJson: result.liquidityJson,
      });
      await events.append({
        corridorId: c.id,
        status: result.status,
        pathCount: result.pathCount,
        recCost: result.recCost,
        source: "manual",
      });
      return { ok: true, status: result.status, pathCount: result.pathCount };
    },
  );
}
