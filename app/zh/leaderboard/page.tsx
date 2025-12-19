"use client";
import { NeonCard } from "../../../src/components/ui/NeonCard";
import { NeonIcon } from "../../../src/components/ui/NeonIcon";
import { Trophy, LoaderCircle, Ban, TriangleAlert, Zap } from "lucide-react";
import { classes } from "../../../src/design/tokens";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { NeonButton } from "../../../src/components/ui/NeonButton";

export default function ZhLeaderboard() {
  const t = useTranslations("pages.leaderboard");
  const s = useTranslations("states");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<Array<{ address: string; rankScore: number; rawScore: number; effectiveTimeSec: number }> | null>(null);
  useEffect(() => {
    setLoading(true);
    fetch("/api/leaderboard/daily")
      .then((r) => r.json())
      .then((json) => {
        setEntries(json.entries || []);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <NeonCard>
        <div className="flex items-center gap-2">
          <NeonIcon icon={Trophy} />
          <h1 className={classes.accent}>{t("title")}</h1>
        </div>
        <p>{t("desc")}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <NeonCard><div className="flex items-center gap-2"><NeonIcon icon={LoaderCircle}/><h3 className={classes.accent}>{s("loading.title")}</h3></div><p>{s("loading.desc")}</p></NeonCard>
          <NeonCard><div className="flex items.center gap-2"><NeonIcon icon={TriangleAlert}/><h3 className={classes.accent}>{s("error.title")}</h3></div><p className={classes.warning}>{s("error.desc")}</p></NeonCard>
          <NeonCard><div className="flex items-center gap-2"><NeonIcon icon={Zap}/><h3 className={classes.accent}>{s("degraded.title")}</h3></div><p>{s("degraded.desc")}</p></NeonCard>
          <NeonCard><div className="flex items-center gap-2"><NeonIcon icon={Ban}/><h3 className={classes.accent}>{s("empty.title")}</h3></div><p>{s("empty.desc")}</p></NeonCard>
        </div>
        <div className="mt-6">
          {loading && (
            <NeonCard><div className="p-3 flex items-center gap-2"><NeonIcon icon={LoaderCircle}/><span>Loading</span></div></NeonCard>
          )}
          {error && (
            <NeonCard><div className="p-3"><div className={classes.warning}>Error: {error}</div></div></NeonCard>
          )}
          {entries && entries.length === 0 && (
            <NeonCard><div className="p-3 flex items-center gap-2"><NeonIcon icon={Ban}/><span>Empty</span></div></NeonCard>
          )}
          {entries && entries.length > 0 && (
            <NeonCard>
              <div className="p-3">
                <div className="grid grid-cols-5 gap-2 text-sm opacity-80">
                  <div>Rank</div><div>Address</div><div>RankScore</div><div>RawScore</div><div>EffectiveTime</div>
                </div>
                {entries.map((e, i) => (
                  <div key={i} className="grid grid-cols-5 gap-2 text-sm py-1">
                    <div>#{i + 1}</div>
                    <div className="font-mono">{e.address.slice(0, 6)}…{e.address.slice(-4)}</div>
                    <div className="font-mono">{e.rankScore}</div>
                    <div className="font-mono">{e.rawScore}</div>
                    <div className="font-mono">{e.effectiveTimeSec}s</div>
                  </div>
                ))}
              </div>
            </NeonCard>
          )}
        </div>
      </NeonCard>
    </div>
  );
}
