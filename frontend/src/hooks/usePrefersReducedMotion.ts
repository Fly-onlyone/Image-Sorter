import { useEffect, useState } from "react";

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
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
