// Progress: phase stepper (dedup → gate → tag → identify → cluster)
// + per-phase LinearProgress + live SSE stat tiles. On pipeline_done → Review.

import {
  Alert,
  Box,
  Button,
  Grid,
  LinearProgress,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import { AnimatedGradientBorder } from "../components/effects/AnimatedGradientBorder";
import { MagneticButton } from "../components/effects/MagneticButton";
import { ScrollReveal } from "../components/effects/ScrollReveal";
import { PageContainer, PageHeader } from "../components/PageContainer";
import { StatTile } from "../components/StatTile";
import { useAppState } from "../store/AppState";

const PHASES = ["dedup", "gate", "tag", "identify", "cluster"] as const;
const PHASE_LABELS: Record<string, string> = {
  dedup: "Deduplicate",
  gate: "Media gate",
  tag: "Tag + rate",
  identify: "Identify",
  cluster: "Cluster",
};

// Spotlight the stat tile relevant to the running phase.
const PHASE_STAT: Record<string, string> = {
  dedup: "Deduped",
  gate: "Anime",
  tag: "Nude",
  identify: "Identified",
};

export function ProgressScreen() {
  const { run, setView } = useAppState();
  const [phase, setPhase] = useState<string>("dedup");
  const [phaseProgress, setPhaseProgress] = useState<{ done: number; total: number } | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!run || startedRef.current) return;
    startedRef.current = true;
    const es = api.events(run.runId, {
      onEvent: (event, data) => {
        if (event === "phase") setPhase(String(data.name));
        else if (event.endsWith("_progress") && typeof data.done === "number") {
          setPhaseProgress({ done: data.done as number, total: (data.total as number) ?? 0 });
        } else if (event === "dedup_done") {
          setStats((s) => ({ ...s, deduped: (data.trashed as number) ?? 0 }));
        } else if (event === "gate_done") {
          setStats((s) => ({
            ...s,
            anime: (data.anime as number) ?? 0,
            other: (data.other as number) ?? 0,
          }));
        } else if (event === "tag_done") {
          setStats((s) => ({ ...s, nude: (data.nude as number) ?? 0 }));
        } else if (event === "identify_done") {
          setStats((s) => ({
            ...s,
            identified: (data.identified as number) ?? 0,
            residual: (data.residual as number) ?? 0,
          }));
        } else if (event === "pipeline_done") {
          setDone(true);
        } else if (event === "pipeline_error") {
          setError(String(data.message ?? "pipeline error"));
        }
      },
    });
    api.process(run.runId, run.layout).catch((e) => setError(String(e)));
    return () => es.close();
  }, [run]);

  if (!run) return <Alert severity="info">No active run — start one from New Run.</Alert>;

  const activeStep = PHASES.indexOf(phase as (typeof PHASES)[number]);
  const pct = phaseProgress?.total
    ? Math.round((phaseProgress.done / phaseProgress.total) * 100)
    : undefined;
  const liveStat = done ? "" : (PHASE_STAT[phase] ?? "");

  const tiles: [string, number][] = [
    ["Deduped", stats.deduped ?? 0],
    ["Anime", stats.anime ?? 0],
    ["Other", stats.other ?? 0],
    ["Identified", stats.identified ?? 0],
    ["Residual", stats.residual ?? 0],
    ["Nude", stats.nude ?? 0],
  ];

  return (
    <PageContainer>
      <PageHeader title="Processing" subtitle={`${run.scanned} images`} />

      <Stepper activeStep={done ? PHASES.length : activeStep} sx={{ mb: 3 }}>
        {PHASES.map((p) => (
          <Step key={p}>
            <StepLabel>{PHASE_LABELS[p]}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <AnimatedGradientBorder>
        <Box sx={{ p: 2.5 }}>
          <Typography variant="subtitle1" gutterBottom>
            {done ? "Done" : `${PHASE_LABELS[phase] ?? phase}…`}
            {pct !== undefined && !done ? ` ${pct}%` : ""}
          </Typography>
          <LinearProgress
            variant={
              pct !== undefined && !done ? "determinate" : done ? "determinate" : "indeterminate"
            }
            value={done ? 100 : (pct ?? 0)}
            aria-label={`${done ? 100 : (pct ?? 0)}% complete`}
          />
        </Box>
      </AnimatedGradientBorder>

      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mt: 3, mb: 3 }}>
        {tiles.map(([label, value], i) => (
          <Grid size={{ xs: 6, sm: 4, md: 2 }} key={label}>
            <ScrollReveal delay={i * 0.05}>
              <StatTile label={label} value={value} accent={label === liveStat} />
            </ScrollReveal>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: "flex", gap: 2 }}>
        <MagneticButton variant="contained" disabled={!done} onClick={() => setView("review")}>
          Continue to Review
        </MagneticButton>
        <Button color="inherit" onClick={() => setView("setup")}>
          {done ? "New run" : "Cancel"}
        </Button>
      </Box>
    </PageContainer>
  );
}
