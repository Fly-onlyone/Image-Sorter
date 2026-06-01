// Setup / New Run: layout, source & output, cleanup (dedup), nude
// policy, engine, optional artist. Start run → /scan → Progress.

import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Slider,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useState } from "react";
import type { Facet } from "../api/client";
import { api } from "../api/client";
import { MagneticButton } from "../components/effects/MagneticButton";
import { useAppState } from "../store/AppState";
import { pickDirectory } from "../utils/platform";

const LAYOUTS: { id: string; layout: Facet[]; label: string }[] = [
  { id: "c", layout: ["character"], label: "Character" },
  { id: "a", layout: ["artist"], label: "Artist" },
  { id: "ca", layout: ["character", "artist"], label: "Character / Artist" },
  { id: "ac", layout: ["artist", "character"], label: "Artist / Character" },
];

function FolderField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <TextField
      fullWidth
      size="small"
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                onClick={async () => {
                  const picked = await pickDirectory(label);
                  if (picked) onChange(picked);
                }}
              >
                <FolderOpenIcon />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

export function SetupScreen() {
  const { setRun, setView } = useAppState();
  const [layoutId, setLayoutId] = useState("c");
  const [inputDir, setInputDir] = useState("");
  const [outputDir, setOutputDir] = useState("");
  const [recursive, setRecursive] = useState(true);
  const [dedup, setDedup] = useState(true);
  const [dupDistance, setDupDistance] = useState(6);
  const [strictNude, setStrictNude] = useState(true);
  const [explicitThreshold, setExplicitThreshold] = useState(0.5);
  const [useGpu, setUseGpu] = useState(false);
  const [saucenaoKey, setSaucenaoKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const layout = LAYOUTS.find((l) => l.id === layoutId)?.layout ?? ["character"];
  const hasArtist = layout.includes("artist");
  const inPlace = outputDir.trim() !== "" && outputDir.trim() === inputDir.trim();

  async function start() {
    setError(null);
    if (!inputDir.trim()) {
      setError("Choose an input folder first.");
      return;
    }
    setBusy(true);
    try {
      await api.patchSettings({
        dup_distance: dupDistance,
        strict_nude: strictNude,
        explicit_threshold: explicitThreshold,
        use_gpu: useGpu,
        dedup_enabled: dedup,
        saucenao_key: saucenaoKey || null,
      });
      const out = outputDir.trim() || null;
      const res = await api.scan(inputDir.trim(), out, recursive);
      setRun({
        runId: res.run_id,
        inputDir: inputDir.trim(),
        outputDir: out ?? inputDir.trim(),
        inPlace: res.in_place,
        layout,
        scanned: res.scanned,
      });
      setView("progress");
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 920 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        New Run
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Layout
              </Typography>
              <ToggleButtonGroup
                exclusive
                value={layoutId}
                onChange={(_, v) => v && setLayoutId(v)}
                size="small"
              >
                {LAYOUTS.map((l) => (
                  <ToggleButton key={l.id} value={l.id}>
                    {l.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Source &amp; Output
              </Typography>
              <Stack spacing={2}>
                <FolderField label="Input folder" value={inputDir} onChange={setInputDir} />
                <FolderField
                  label="Output folder (blank = in-place)"
                  value={outputDir}
                  onChange={setOutputDir}
                />
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={recursive}
                        onChange={(e) => setRecursive(e.target.checked)}
                      />
                    }
                    label="Scan subfolders"
                  />
                  <Chip
                    size="small"
                    label={inPlace ? "In-place — files will MOVE" : "Copy to output"}
                    color={inPlace ? "warning" : "default"}
                  />
                </Stack>
                {inPlace && (
                  <Alert severity="warning">
                    Output equals input: images are reorganised in place (moved, not copied).
                    Re-runs stay idempotent — reserved folders are skipped.
                  </Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Cleanup — Deduplication
              </Typography>
              <FormControlLabel
                control={<Switch checked={dedup} onChange={(e) => setDedup(e.target.checked)} />}
                label="Keep the highest-resolution copy"
              />
              <Box sx={{ px: 1, mt: 1, opacity: dedup ? 1 : 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  Match distance: {dupDistance}
                </Typography>
                <Slider
                  disabled={!dedup}
                  value={dupDistance}
                  min={0}
                  max={12}
                  step={1}
                  marks
                  onChange={(_, v) => setDupDistance(v as number)}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Nude policy
              </Typography>
              <FormControlLabel
                control={
                  <Switch checked={strictNude} onChange={(e) => setStrictNude(e.target.checked)} />
                }
                label="Strict (escalate via censor detection)"
              />
              <Box sx={{ px: 1, mt: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Explicit threshold: {explicitThreshold.toFixed(2)}
                </Typography>
                <Slider
                  value={explicitThreshold}
                  min={0.2}
                  max={0.9}
                  step={0.05}
                  onChange={(_, v) => setExplicitThreshold(v as number)}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: hasArtist ? 6 : 12 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Engine
              </Typography>
              <FormControlLabel
                control={<Switch checked={useGpu} onChange={(e) => setUseGpu(e.target.checked)} />}
                label="Use GPU (onnxruntime-gpu)"
              />
            </CardContent>
          </Card>
        </Grid>

        {hasArtist && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  Artist (reverse lookup)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  label="SauceNAO API key (optional)"
                  value={saucenaoKey}
                  onChange={(e) => setSaucenaoKey(e.target.value)}
                />
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <Box sx={{ mt: 3 }}>
        <MagneticButton
          variant="contained"
          size="large"
          startIcon={<PlayArrowIcon />}
          disabled={busy}
          onClick={start}
        >
          {busy ? "Scanning…" : "Start run"}
        </MagneticButton>
      </Box>
    </Box>
  );
}
