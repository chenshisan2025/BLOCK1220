import { z } from "zod";

const rootItemSchema = z.object({
  rootType: z.string(),
  periodId: z.string(),
  rootHash: z.string(),
  txHash: z.string(),
  ts: z.number(),
  explorerUrl: z.string().optional(),
});

const overallSchema = z.object({
  status: z.enum(["operational", "degraded", "outage"]).or(z.string()),
  message: z.string(),
});

const serviceBaseSchema = z.object({
  status: z.enum(["operational", "degraded", "outage"]).or(z.string()),
  message: z.string().optional(),
});

const servicesSchema = z.object({
  gameApi: serviceBaseSchema.extend({
    latencyMs: z.number().optional(),
  }),
  economyApi: serviceBaseSchema.extend({
    latencyMs: z.number().optional(),
  }),
  indexer: serviceBaseSchema.extend({
    lagBlocks: z.number().optional(),
  }),
  rpc: serviceBaseSchema,
  queue: serviceBaseSchema.extend({
    backlog: z.number().optional(),
  }),
});

const settlementsSchema = z.object({
  dailyRank: z.object({
    status: z.enum(["operational", "degraded", "outage"]).or(z.string()),
    note: z.string(),
  }),
  boxEpoch: z.object({
    status: z.enum(["operational", "degraded", "outage"]).or(z.string()),
    note: z.string(),
  }),
});

const contractsSchema = z.object({
  rewardDistributor: z.string(),
  vestingVault: z.string(),
  sponsorVault: z.string(),
  treasury: z.string(),
});

const incidentSchema = z.object({
  id: z.string().optional(),
  ts: z.number().optional(),
  level: z.enum(["info", "warning", "critical"]).or(z.string()),
  title: z.string(),
  detail: z.string().optional(),
});

export const statusSchema = z.object({
  locale: z.enum(["zh", "en"]),
  serverNow: z.number(),
  overall: overallSchema,
  services: servicesSchema,
  settlements: settlementsSchema,
  lastRoots: z.array(rootItemSchema),
  contracts: contractsSchema,
  incidents: z.array(incidentSchema),
});

export type StatusResponse = z.infer<typeof statusSchema>;
