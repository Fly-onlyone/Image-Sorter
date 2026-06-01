// Settings: thresholds, dedup, GPU, reduced motion, Sentry opt-in.
// The theme picker lives in the AppBar (all 11 themes, default Dracula).

import {
  Alert,
  Card,
  CardContent,
  FormControlLabel,
  Grid,
  Slider,
  Switch,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { PageContainer, PageHeader } from "../components/PageContainer";
import { REDUCED_MOTION_EVENT } from "../hooks/usePrefersReducedMotion";
import { useToast } from "../hooks/useToast";

export function SettingsScreen() {
  const { toast } = useToast();
  const [dupDistance, setDupDistance] = useState(6);
  const [explicit, setExplicit] = useState(0.5);
  const [illustrationMin, setIllustrationMin] = useState(0.65);
  const [charThreshold, setCharThreshold] = useState(0.75);
  const [useGpu, setUseGpu] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => localStorage.getItem("image-sorter.reducedMotion") === "true",
  );
  const [sentry, setSentry] = useState(false);

  useEffect(() => {
    api
      .getSettings()
      .then((s) => {
        if (typeof s.dup_distance === "number") setDupDistance(s.dup_distance);
        if (typeof s.explicit_threshold === "number") setExplicit(s.explicit_threshold);
        if (typeof s.gate_illustration_min === "number")
          setIllustrationMin(s.gate_illustration_min);
        if (typeof s.char_threshold === "number") setCharThreshold(s.char_threshold);
        if (typeof s.use_gpu === "boolean") setUseGpu(s.use_gpu);
        if (typeof s.sentry_opt_in === "boolean") setSentry(s.sentry_opt_in);
      })
      .catch(() => toast("Couldn't load settings", "error"));
  }, [toast]);

  async function persist(values: Record<string, unknown>) {
    try {
      await api.patchSettings(values);
      toast("Saved");
    } catch (e) {
      toast(String(e), "error");
    }
  }

  return (
    <PageContainer>
      <PageHeader title="Settings" subtitle="Thresholds, engine and UX preferences" />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Thresholds
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Dedup match distance: {dupDistance}
              </Typography>
              <Slider
                value={dupDistance}
                min={0}
                max={12}
                step={1}
                marks
                onChange={(_, v) => setDupDistance(v as number)}
                onChangeCommitted={(_, v) => persist({ dup_distance: v })}
              />
              <Typography variant="caption" color="text.secondary">
                Explicit (nude) threshold: {explicit.toFixed(2)}
              </Typography>
              <Slider
                value={explicit}
                min={0.2}
                max={0.9}
                step={0.05}
                onChange={(_, v) => setExplicit(v as number)}
                onChangeCommitted={(_, v) => persist({ explicit_threshold: v })}
              />
              <Typography variant="caption" color="text.secondary">
                Gate illustration min: {illustrationMin.toFixed(2)}
              </Typography>
              <Slider
                value={illustrationMin}
                min={0.4}
                max={0.9}
                step={0.05}
                onChange={(_, v) => setIllustrationMin(v as number)}
                onChangeCommitted={(_, v) => persist({ gate_illustration_min: v })}
              />
              <Typography variant="caption" color="text.secondary">
                Character hint confidence: {charThreshold.toFixed(2)}
              </Typography>
              <Slider
                value={charThreshold}
                min={0.4}
                max={0.95}
                step={0.05}
                onChange={(_, v) => setCharThreshold(v as number)}
                onChangeCommitted={(_, v) => persist({ char_threshold: v })}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Engine &amp; UX
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={useGpu}
                    onChange={(e) => {
                      setUseGpu(e.target.checked);
                      persist({ use_gpu: e.target.checked });
                    }}
                  />
                }
                label="Use GPU (onnxruntime-gpu)"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={reducedMotion}
                    onChange={(e) => {
                      setReducedMotion(e.target.checked);
                      localStorage.setItem("image-sorter.reducedMotion", String(e.target.checked));
                      window.dispatchEvent(new Event(REDUCED_MOTION_EVENT));
                    }}
                  />
                }
                label="Reduce motion (freeze SilkRibbons + animations)"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={sentry}
                    onChange={(e) => {
                      setSentry(e.target.checked);
                      persist({ sentry_opt_in: e.target.checked });
                    }}
                  />
                }
                label="Send anonymous crash reports (Sentry)"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Alert severity="info">
            Theme is chosen from the palette button in the top bar — all 11 themes, default Dracula.
          </Alert>
        </Grid>
      </Grid>
    </PageContainer>
  );
}
