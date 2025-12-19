"use client";
import { useEffect, useState } from "react";
import { NeonCard } from "../../../src/components/ui/NeonCard";
import { NeonIcon } from "../../../src/components/ui/NeonIcon";
import { classes } from "../../../src/design/tokens";
import { BarChart3, LoaderCircle, TriangleAlert, Ban, Zap } from "lucide-react";

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);
  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/sponsor-analytics/summary")
      .then((r) => r.json())
      .then((json) => setData(json))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <NeonCard>
        <div className="flex items-center gap-2">
          <NeonIcon icon={BarChart3} />
          <h1 className={classes.accent}>Sponsor Analytics</h1>
        </div>
        <p className="opacity-80">Summary KPIs for last 7 days</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <NeonCard><div className="flex items-center gap-2"><NeonIcon icon={LoaderCircle}/><h3 className={classes.accent}>Loading</h3></div><p>Fetching analytics…</p></NeonCard>
          <NeonCard><div className="flex items.center gap-2"><NeonIcon icon={TriangleAlert}/><h3 className={classes.accent}>Error</h3></div><p className={classes.warning}>Failed to load</p></NeonCard>
          <NeonCard><div className="flex items-center gap-2"><NeonIcon icon={Zap}/><h3 className={classes.accent}>Degraded</h3></div><p>Partial data</p></NeonCard>
          <NeonCard><div className="flex items-center gap-2"><NeonIcon icon={Ban}/><h3 className={classes.accent}>Empty</h3></div><p>No events</p></NeonCard>
        </div>
        <div className="mt-6">
          {loading && <NeonCard><div className="p-3 flex items-center gap-2"><NeonIcon icon={LoaderCircle}/><span>Loading</span></div></NeonCard>}
          {error && <NeonCard><div className="p-3"><div className={classes.warning}>Error: {error}</div></div></NeonCard>}
          {data && (
            <NeonCard>
              <div className="p-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                <div><div className={classes.accent}>Total Sponsors</div><div className="font-mono">{data.totalSponsors}</div></div>
                <div><div className={classes.accent}>Active Campaigns</div><div className="font-mono">{data.activeCampaigns}</div></div>
                <div><div className={classes.accent}>Participants (7d)</div><div className="font-mono">{data.totalParticipants}</div></div>
                <div><div className={classes.accent}>Completions (7d)</div><div className="font-mono">{data.totalCompletions}</div></div>
                <div><div className={classes.accent}>Boxes Opened (7d)</div><div className="font-mono">{data.totalBoxesOpened}</div></div>
                <div>
                  <div className={classes.accent}>Rewards by Symbol (7d)</div>
                  <div className="space-y-1">
                    {(data.rewardsBySymbol || []).map((r: any, i: number) => (
                      <div key={i} className="flex items-center gap-2"><span className="font-mono">{r.symbol}</span><span>×{r.cnt}</span></div>
                    ))}
                  </div>
                </div>
              </div>
            </NeonCard>
          )}
        </div>
      </NeonCard>
    </div>
  );
}
