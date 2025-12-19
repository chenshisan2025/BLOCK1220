import { classes } from "../../design/tokens";
import type { ReactNode } from "react";

export function NeonButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button className={classes.button} onClick={onClick}>
      {children}
    </button>
  );
}
