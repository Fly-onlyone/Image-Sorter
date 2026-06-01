// Progress: phase stepper (dedup → gate → tag → identify → cluster)
// + per-phase LinearProgress + live SSE stat tiles. On pipeline_done → Review.

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import { useAppState } from "../store/AppState";

const PHASES = ["dedup", "gate", "tag", "identify", "cluster"] as const;
const PHASE_LABELS: Record<string, string> = {
  dedup: "Deduplicate",
  gate: "Media gate",
  tag: "Tag + rate",
  identify: "Identify",
  cluster: "Cluster",
};

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardContent sx={{ textAlign: "center", py: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

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

  return (
    <Box sx={{ maxWidth: 920 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Processing — {run.scanned} images
      </Typography>

      <Stepper activeStep={done ? PHASES.length : activeStep} sx={{ mb: 3 }}>
        {PHASES.map((p) => (
          <Step key={p}>
            <StepLabel>{PHASE_LABELS[p]}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            {done ? "Done" : `${PHASE_LABELS[phase] ?? phase}…`}
            {pct !== undefined && !done ? ` ${pct}%` : ""}
          </Typography>
          <LinearProgress
            variant={
              pct !== undefined && !done ? "determinate" : done ? "determinate" : "indeterminate"
            }
            value={done ? 100 : (pct ?? 0)}
          />
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          ["Deduped", stats.deduped ?? 0],
          ["Anime", stats.anime ?? 0],
          ["Other", stats.other ?? 0],
          ["Identified", stats.identified ?? 0],
          ["Residual", stats.residual ?? 0],
          ["Nude", stats.nude ?? 0],
        ].map(([label, value]) => (
          <Grid size={{ xs: 6, sm: 4, md: 2 }} key={label as string}>
            <StatTile label={label as string} value={value as number} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="contained" disabled={!done} onClick={() => setView("review")}>
          Continue to Review
        </Button>
        <Button color="inherit" onClick={() => setView("setup")}>
          {done ? "New run" : "Cancel"}
        </Button>
      </Box>
    </Box>
  );
}
