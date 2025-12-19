export const colors = {
  bg: "#0b0f17",
  neonCyan: "#00f0ff",
  neonPurple: "#a855f7",
  neonText: "#e5f9ff",
  neonYellow: "#ffd400",
};

export const vars = {
  bg: "--neon-bg",
  cyan: "--neon-cyan",
  purple: "--neon-purple",
  text: "--neon-text",
  yellow: "--neon-yellow",
};

export const classes = {
  card: "bg-[var(--neon-bg)] text-[var(--neon-text)] border border-[var(--neon-cyan)] shadow-[0_0_20px_var(--neon-purple)]",
  button:
    "px-4 py-2 rounded-md text-[var(--neon-text)] bg-[var(--neon-purple)] hover:bg-[var(--neon-cyan)] shadow-[0_0_16px_var(--neon-purple)] transition-colors",
  accent: "text-[var(--neon-cyan)]",
  warning: "text-[var(--neon-yellow)]",
};
