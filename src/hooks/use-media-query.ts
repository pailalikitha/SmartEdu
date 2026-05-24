"use client";

import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** Viewport width &lt; 768px (matches --mobile breakpoint). */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}

/** Viewport width 768px–1023px. */
export function useIsTablet(): boolean {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
}

/** Chart container height in px for ResponsiveContainer parents. */
export function useChartHeight(): number {
  const isMobile = useIsMobile();
  return isMobile ? 200 : 350;
}
