import { z } from "zod";

export const rootTypeSchema = z.enum([
  "DailyRank",
  "BoxEpoch",
  "DailyAirdrop",
  "SeasonClear",
  "SponsorDrop",
  "Referral",
]);

const claimTokenSchema = z.object({
  symbol: z.enum(["FLY", "sFLY"]).or(z.string()),
  decimals: z.number(),
});

const vestingSchema = z.object({
  startTs: z.number(),
  cliffSeconds: z.number(),
  durationSeconds: z.number(),
  immediateUnlockBps: z.number().optional(),
});

const rootRefSchema = z.object({
  rootHash: z.string(),
  txHash: z.string(),
  ts: z.number(),
  explorerUrl: z.string().optional(),
});

const noticeSchema = z.object({
  level: z.enum(["info", "warning", "error"]),
  code: z.string(),
  message: z.string(),
});

const claimItemSchema = z.object({
  rootType: rootTypeSchema,
  periodId: z.string(),
  periodKey: z.string(),
  token: claimTokenSchema,
  amountWei: z.string(),
  proof: z.array(z.string()),
  isClaimed: z.boolean(),
  isVesting: z.boolean(),
  vesting: vestingSchema.optional(),
  rootRef: rootRefSchema.optional(),
  meta: z
    .object({
      category: z.string().optional(),
      title: z.string().optional(),
      subtitle: z.string().optional(),
    })
    .optional(),
});

const contractsSchema = z.object({
  rewardDistributor: z.string(),
  vestingVault: z.string().optional(),
});

export const claimablesSchema = z.object({
  locale: z.enum(["zh", "en"]),
  chainId: z.number(),
  serverNow: z.number(),
  address: z.string(),
  contracts: contractsSchema,
  notices: z.array(noticeSchema).optional(),
  claims: z.array(claimItemSchema),
});

export type ClaimablesResponse = z.infer<typeof claimablesSchema>;
