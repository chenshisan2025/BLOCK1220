import { NeonCard } from "../../components/ui/NeonCard";
import { NeonButton } from "../../components/ui/NeonButton";
import { classes } from "../../design/tokens";
import { useLiveStats } from "./useLiveStats";
import { useServerCountdown } from "../../lib/time/useServerCountdown";
import { useTranslations } from "next-intl";

function formatWei(wei: string, decimals = 18, precision = 4) {
  try {
    const d = BigInt(decimals);
    const base = BigInt(10) ** d;
    const n = BigInt(wei);
    const intPart = n / base;
    const fracPart = n % base;
    const fracStr = (fracPart * BigInt(10 ** precision) / base).toString().padStart(precision, "0");
    return `${intPart.toString()}.${fracStr}`;
  } catch {
    return "0.0000";
  }
}

function truncateHash(h: string) {
  if (!h || h.length < 12) return h;
  return `${h.slice(0, 6)}...${h.slice(-4)}`;
}

export function LiveStatsPanel() {
  const { data, loading, error, reload } = useLiveStats();
  const t = useTranslations("home.stats");
  const lt = useTranslations("live");
  const s = useTranslations("states");
  const epochCd = useServerCountdown(data?.serverNow ?? null, data?.boxEpoch?.countdownSeconds ?? null);
  const rankCd = useServerCountdown(data?.serverNow ?? null, data?.dailyRank?.settleCountdownSeconds ?? null);

  if (loading) {
    return (
      <NeonCard>
        <h3 className={classes.accent}>{t("title")}</h3>
        <p>{s("loading.desc")}</p>
      </NeonCard>
    );
  }
  if (error || !data) {
    return (
      <NeonCard>
        <h3 className={classes.accent}>{t("title")}</h3>
        <p className={classes.warning}>{error || "Error"}</p>
        <div className="mt-2"><NeonButton onClick={reload}>Refresh</NeonButton></div>
      </NeonCard>
    );
  }

  const poolToken = data.boxEpoch.pool.token.symbol || "FLY";
  const poolTotal = formatWei(data.boxEpoch.pool.totalWei, data.boxEpoch.pool.token.decimals);
  const poolContribution = formatWei(data.boxEpoch.pool.contributionWei, data.boxEpoch.pool.token.decimals);
  const poolTopUp = formatWei(data.boxEpoch.pool.topUpWei, data.boxEpoch.pool.token.decimals);
  const latest = data.lastRoots[0];

  const degraded = !!data.indexer && (data.indexer.status === "degraded" || data.indexer.lagBlocks >= 3);

  return (
    <div className="space-y-4">
      {degraded && (
        <NeonCard>
          <div className="border border-[var(--neon-yellow)] p-2 rounded">
            <span className={classes.warning}>{lt("degradedBanner")}</span>
          </div>
        </NeonCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <NeonCard>
          <h4 className={classes.accent}>Current Epoch</h4>
          <p className="font-mono">#{data.boxEpoch.epochId}</p>
          <p className="mt-1 font-mono">{epochCd.formatted}</p>
        </NeonCard>

        <NeonCard>
          <h4 className={classes.accent}>Reward Pool</h4>
          <p className="font-mono">{poolTotal} {poolToken}</p>
          <p className="opacity-80 mt-1 font-mono">contrib {poolContribution} / topUp {poolTopUp}</p>
        </NeonCard>

        <NeonCard>
          <h4 className={classes.accent}>Rank Settlement</h4>
          <p className="font-mono">{data.dailyRank.dayId}</p>
          <p className="mt-1 font-mono">{rankCd.formatted}</p>
          <p className="opacity-80 mt-1 font-mono">
            pool {formatWei(data.dailyRank.pool.totalWei, data.dailyRank.pool.token.decimals)} {data.dailyRank.pool.token.symbol}
            {" · min "}{data.dailyRank.pool.minDailyRankPoolWei ? formatWei(data.dailyRank.pool.minDailyRankPoolWei, data.dailyRank.pool.token.decimals) : "0"} {data.dailyRank.pool.token.symbol}
          </p>
        </NeonCard>

        <NeonCard>
          <h4 className={classes.accent}>Latest Root</h4>
          <p className="font-mono">{truncateHash(latest.rootHash)}</p>
          <p className="opacity-80">[{latest.rootType}] {latest.periodId}</p>
          {latest.explorerUrl ? (
            <div className="mt-2">
              <a href={latest.explorerUrl} target="_blank" rel="noreferrer">
                <NeonButton>View</NeonButton>
              </a>
            </div>
          ) : null}
        </NeonCard>
      </div>

      <NeonCard>
        <h4 className={classes.accent}>Latest Roots</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
          {data.lastRoots.slice(0, 3).map((r, i) => (
            <NeonCard key={i}>
              <p className="font-mono">{truncateHash(r.rootHash)}</p>
              <p className="opacity-80">[{r.rootType}] {r.periodId}</p>
              {r.explorerUrl ? (
                <div className="mt-2">
                  <a href={r.explorerUrl} target="_blank" rel="noreferrer">
                    <NeonButton>View</NeonButton>
                  </a>
                </div>
              ) : null}
            </NeonCard>
          ))}
        </div>
      </NeonCard>
    </div>
  );
}
