import { getPg } from "../db/pg";
import { migratePg } from "../db/migratePg";
import { antiCheatRepoPg } from "./antiCheatRepo";
import { pendingRewardRepoPg } from "./pendingRewardRepo";

export type ResolveAndIssueInput = { reviewId: number; resolution: "legit" | "cheat" | "unknown"; reviewer: string; note?: string };
export type ResolveAndIssueResult = {
  ok: true;
  reviewId: number;
  resolution: "legit" | "cheat" | "unknown";
  address: string;
  issuedCount: number;
  deniedCount: number;
  skippedCount: number;
};

export function riskOpsRepoPg() {
  const sql = getPg();
  const anti = antiCheatRepoPg();
  const pending = pendingRewardRepoPg();
  return {
    async resolveReviewAndProcessPending(input: ResolveAndIssueInput): Promise<ResolveAndIssueResult> {
      await migratePg();
      return await sql.begin(async () => {
        const review = await anti.getReviewById(input.reviewId);
        if (!review) {
          throw new Error(`review not found: ${input.reviewId}`);
        }
        await anti.resolveReview(input.reviewId, input.resolution, input.reviewer, input.note);
        const address = String((review as any).address);
        let issuedCount = 0;
        let deniedCount = 0;
        let skippedCount = 0;
        const pendings = await pending.listPendingByAddress(address);
        if (input.resolution === "legit") {
          for (const p of pendings as any[]) {
            const out = await pending.issuePending(Number(p.id), input.reviewer, input.note ?? "resolve legit -> issue all");
            if (out?.ok) issuedCount++;
            else skippedCount++;
          }
        } else if (input.resolution === "cheat") {
          for (const p of pendings as any[]) {
            await pending.markDenied(Number(p.id), input.reviewer, input.note ?? "resolve cheat -> deny all");
            deniedCount++;
          }
        } else {
          skippedCount = (pendings as any[]).length;
        }
        return { ok: true, reviewId: input.reviewId, resolution: input.resolution, address, issuedCount, deniedCount, skippedCount };
      });
    },
  };
}
