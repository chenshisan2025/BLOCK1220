import { useEffect, useMemo, useRef, useState } from "react";

function format(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

export function useServerCountdown(
  serverNow: number | null,
  countdownSeconds: number | null
) {
  const [remaining, setRemaining] = useState<number>(0);
  const startServerMsRef = useRef<number>(0);
  const targetMsRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!serverNow || !countdownSeconds) {
      setRemaining(0);
      return;
    }

    const startServerMs = serverNow * 1000;
    const targetMs = startServerMs + countdownSeconds * 1000;

    startServerMsRef.current = startServerMs;
    targetMsRef.current = targetMs;

    const tick = () => {
      const now = Date.now();
      const left = Math.max(0, Math.floor((targetMs - now) / 1000));
      setRemaining(left);
    };

    tick();
    timerRef.current = window.setInterval(tick, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [serverNow, countdownSeconds]);

  return useMemo(() => {
    return {
      seconds: remaining,
      formatted: format(remaining),
      isEnded: remaining <= 0,
    };
  }, [remaining]);
}
