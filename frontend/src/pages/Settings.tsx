// Settings: thresholds, dedup, GPU, reduced motion, Sentry opt-in.
// The theme picker lives in the AppBar (all 11 themes, default Tokyo Night).

import {
  Alert,
  Box,
  Card,
  CardContent,
  FormControlLabel,
  Slider,
  Snackbar,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { api } from "../api/client";

export function SettingsScreen() {
  const [dupDistance, setDupDistance] = useState(6);
  const [explicit, setExplicit] = useState(0.5);
  const [illustrationMin, setIllustrationMin] = useState(0.65);
  const [charThreshold, setCharThreshold] = useState(0.75);
  const [useGpu, setUseGpu] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(
    () => localStorage.getItem("image-sorter.reducedMotion") === "true",
  );
  const [sentry, setSentry] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getSettings().then((s) => {
      if (typeof s.dup_distance === "number") setDupDistance(s.dup_distance);
      if (typeof s.explicit_threshold === "number") setExplicit(s.explicit_threshold);
      if (typeof s.gate_illustration_min === "number") setIllustrationMin(s.gate_illustration_min);
      if (typeof s.char_threshold === "number") setCharThreshold(s.char_threshold);
      if (typeof s.use_gpu === "boolean") setUseGpu(s.use_gpu);
      if (typeof s.sentry_opt_in === "boolean") setSentry(s.sentry_opt_in);
    });
  }, []);

  async function persist(values: Record<string, unknown>) {
    await api.patchSettings(values);
    setSaved(true);
  }

  return (
    <Box sx={{ maxWidth: 720 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Settings
      </Typography>

      <Stack spacing={2}>
        <Card>
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

        <Card>
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

        <Alert severity="info">
          Theme is chosen from the palette button in the top bar — all 11 themes, default Tokyo
          Night.
        </Alert>
      </Stack>

      <Snackbar
        open={saved}
        autoHideDuration={1500}
        onClose={() => setSaved(false)}
        message="Saved"
      />
    </Box>
  );
}
