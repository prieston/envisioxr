"use client";

import React, {
  useRef,
  useLayoutEffect,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { Box, type SxProps, type Theme } from "@mui/material";

interface ScrollContainerProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
  /** Optional key to persist position across unmounts (session-scoped). */
  storageKey?: string;
}

/**
 * ScrollContainer - Preserves scroll position across re-renders
 *
 * This component maintains scroll position through re-renders by:
 * - Tracking live scroll position via onScroll
 * - Restoring synchronously with useLayoutEffect (no flicker)
 * - Optionally persisting to sessionStorage with storageKey
 */
export const ScrollContainer: React.FC<ScrollContainerProps> = ({
  children,
  sx,
  storageKey,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const lastScrollTopRef = useRef(0);

  // Capture scroll position BEFORE re-render (during render phase)
  if (ref.current) {
    lastScrollTopRef.current = ref.current.scrollTop;
  }

  // Restore scroll position AFTER re-render (layout phase)
  useLayoutEffect(() => {
    const saved =
      storageKey != null
        ? Number(sessionStorage.getItem(`scroll:${storageKey}`) ?? 0)
        : lastScrollTopRef.current;

    if (ref.current && Number.isFinite(saved) && saved > 0) {
      ref.current.scrollTop = saved;
    }
  }); // No deps - runs on EVERY render

  // Track scroll live
  const handleScroll = useCallback(() => {
    const y = ref.current?.scrollTop ?? 0;
    lastScrollTopRef.current = y;
  }, []);

  // Persist to sessionStorage on scroll (throttled) and unmount (if keyed)
  useEffect(() => {
    if (!storageKey) return;
    let raf = 0;
    const onScrollPersist = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        sessionStorage.setItem(
          `scroll:${storageKey}`,
          String(lastScrollTopRef.current)
        );
      });
    };
    const el = ref.current;
    el?.addEventListener("scroll", onScrollPersist);
    return () => {
      el?.removeEventListener("scroll", onScrollPersist);
      sessionStorage.setItem(
        `scroll:${storageKey}`,
        String(lastScrollTopRef.current)
      );
      cancelAnimationFrame(raf);
    };
  }, [storageKey]);

  const baseStyles = useCallback(
    (theme: Theme) => ({
      display: "flex",
      flexDirection: "column",
      height: "100%",
      overflow: "auto",
      overscrollBehavior: "contain",
      backgroundColor:
        theme.palette.mode === "dark" ? "#14171A" : "rgba(248, 250, 252, 0.6)",
    }),
    []
  );

  const resolvedSx = useMemo<SxProps<Theme>>(() => {
    if (!sx) {
      return baseStyles;
    }

    if (Array.isArray(sx)) {
      return [baseStyles, ...sx];
    }

    return [baseStyles, sx];
  }, [baseStyles, sx]);

  return (
    <Box ref={ref} onScroll={handleScroll} sx={resolvedSx}>
      {children}
    </Box>
  );
};
