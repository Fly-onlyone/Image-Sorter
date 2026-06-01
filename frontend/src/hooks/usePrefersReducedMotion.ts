import { useEffect, useState } from "react";

/** Custom event the Settings toggle fires so every hook instance re-reads the
 *  override live (localStorage writes don't notify the same tab on their own). */
export const REDUCED_MOTION_EVENT = "image-sorter:reduced-motion";

/** Reduced-motion gate wired on every animation (an improvement
 *  over TradingAgent, which didn't gate). Also honours a user Settings override. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    if (localStorage.getItem("image-sorter.reducedMotion") === "true") return true;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => {
      const override = localStorage.getItem("image-sorter.reducedMotion") === "true";
      setReduced(override || mq.matches);
    };
    mq.addEventListener("change", handler);
    window.addEventListener("storage", handler); // cross-tab
    window.addEventListener(REDUCED_MOTION_EVENT, handler); // same-tab (Settings toggle)
    return () => {
      mq.removeEventListener("change", handler);
      window.removeEventListener("storage", handler);
      window.removeEventListener(REDUCED_MOTION_EVENT, handler);
    };
  }, []);

  return reduced;
}
