import { z } from "zod";

const tokenSchema = z.object({
  symbol: z.string(),
  decimals: z.number(),
});

const rootItemSchema = z.object({
  rootType: z.string(),
  periodId: z.string(),
  rootHash: z.string(),
  txHash: z.string(),
  ts: z.number(),
  explorerUrl: z.string().optional(),
});

const rolloverStatusSchema = z.object({
  willRollover: z.boolean(),
  reason: z.string().nullable(),
  thresholds: z.object({
    minBoxes: z.number(),
    minUniquePlayers: z.number(),
  }),
});

const boxEpochSchema = z.object({
  epochId: z.number(),
  countdownSeconds: z.number(),
  participants: z.object({
    boxes: z.number(),
    uniquePlayers: z.number(),
  }),
  rolloverStatus: rolloverStatusSchema,
  pool: z.object({
    token: tokenSchema,
    contributionWei: z.string(),
    topUpWei: z.string(),
    rolloverCarryWei: z.string(),
    totalWei: z.string(),
  }),
});

const dailyRankSchema = z.object({
  dayId: z.string(),
  settleCountdownSeconds: z.number(),
  pool: z.object({
    token: z.object({
      symbol: z.string(),
      decimals: z.number(),
    }),
    contributionWei: z.string(),
    topUpWei: z.string(),
    totalWei: z.string(),
    minDailyRankPoolWei: z.string(),
  }),
  lastSettlement: z.any().optional(),
});

const indexerSchema = z.object({
  status: z.string(),
  lagBlocks: z.number(),
  lagSecondsEstimate: z.number().optional(),
  message: z.string().optional(),
});

export const liveStatsSchema = z.object({
  locale: z.enum(["zh", "en"]),
  chainId: z.number(),
  serverNow: z.number(),
  boxEpoch: boxEpochSchema,
  dailyRank: dailyRankSchema,
  lastRoots: z.array(rootItemSchema),
  indexer: indexerSchema.optional(),
});

export type LiveStatsResponse = z.infer<typeof liveStatsSchema>;
