import { classes } from "../../design/tokens";
import type { ReactNode } from "react";

export function NeonCard({ children }: { children: ReactNode }) {
  return <div className={classes.card}>{children}</div>;
}
