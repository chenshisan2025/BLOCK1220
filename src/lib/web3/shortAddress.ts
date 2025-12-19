export function shortAddress(addr?: string, a = 6, b = 4) {
  if (!addr) return "";
  return `${addr.slice(0, a)}…${addr.slice(-b)}`;
}
