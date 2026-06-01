// Lightweight app-wide state: current screen + active run (shared across the
// Setup → Progress → Review → Commit stepper flow). No router needed for a 7-screen
// desktop app.

import { createContext, type ReactNode, useContext, useMemo, useState } from "react";
import type { Facet } from "../api/client";

export type View = "setup" | "progress" | "review" | "commit" | "gallery" | "history" | "settings";

export interface ActiveRun {
  runId: string;
  inputDir: string;
  outputDir: string;
  inPlace: boolean;
  layout: Facet[];
  scanned: number;
}

interface AppStateValue {
  view: View;
  setView: (v: View) => void;
  run: ActiveRun | null;
  setRun: (r: ActiveRun | null) => void;
}

const Ctx = createContext<AppStateValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>("setup");
  const [run, setRun] = useState<ActiveRun | null>(null);
  const value = useMemo(() => ({ view, setView, run, setRun }), [view, run]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState(): AppStateValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
