import type { LucideProps } from "lucide-react";
import type { ComponentType } from "react";

export function NeonIcon({
  icon: Icon,
  size = 20,
  className = "",
}: {
  icon: ComponentType<LucideProps>;
  size?: number;
  className?: string;
}) {
  return (
    <Icon
      size={size}
      className={`text-[var(--neon-cyan)] drop-shadow-[0_0_6px_var(--neon-purple)] ${className}`}
    />
  );
}
