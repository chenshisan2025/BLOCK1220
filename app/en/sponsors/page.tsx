import { NeonCard } from "../../../src/components/ui/NeonCard";
import { NeonIcon } from "../../../src/components/ui/NeonIcon";
import { Handshake, LoaderCircle, Ban, TriangleAlert, Zap } from "lucide-react";
import { classes } from "../../../src/design/tokens";

export default function EnSponsors() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <NeonCard>
        <div className="flex items-center gap-2">
          <NeonIcon icon={Handshake} />
          <h1 className={classes.accent}>Sponsors</h1>
        </div>
        <p>Sponsors placeholder</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <NeonCard><div className="flex items-center gap-2"><NeonIcon icon={LoaderCircle}/><h3 className={classes.accent}>Loading</h3></div><p>Loading</p></NeonCard>
          <NeonCard><div className="flex items-center gap-2"><NeonIcon icon={Ban}/><h3 className={classes.accent}>Empty</h3></div><p>No sponsors</p></NeonCard>
          <NeonCard><div className="flex items-center gap-2"><NeonIcon icon={TriangleAlert}/><h3 className={classes.accent}>Error</h3></div><p className={classes.warning}>Error</p></NeonCard>
          <NeonCard><div className="flex items-center gap-2"><NeonIcon icon={Zap}/><h3 className={classes.accent}>Degraded</h3></div><p>Degraded</p></NeonCard>
        </div>
      </NeonCard>
    </div>
  );
}
