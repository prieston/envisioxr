import { useCallback, useRef } from "react";

/**
 * Batches updates to once per animation frame
 */
export function useRafSchedule<T>(fn: (arg: T) => void) {
  const pending = useRef(false);
  const last = useRef<T | null>(null);
  const rafIdRef = useRef<number | null>(null);

  return useCallback(
    (arg: T) => {
      last.current = arg;
      if (pending.current) return;
      pending.current = true;

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }

      rafIdRef.current = requestAnimationFrame(() => {
        pending.current = false;
        rafIdRef.current = null;
        if (last.current != null) fn(last.current);
      });
    },
    [fn]
  );
}

