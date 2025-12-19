import type { TFunction } from "next-intl";

export function safeT(t: TFunction, key: string, fallback: string) {
  try {
    const v = t(key as any);
    if (!v || v === key) return fallback;
    return v;
  } catch {
    return fallback;
  }
}
