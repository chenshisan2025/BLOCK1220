export function tick(timeLeft: number, deltaMs: number): number {
  const t = timeLeft - deltaMs;
  return t < 0 ? 0 : t;
}

export function addTime(timeLeft: number, addMs: number): number {
  return timeLeft + addMs;
}
