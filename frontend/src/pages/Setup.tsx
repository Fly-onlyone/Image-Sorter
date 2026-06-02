// New Run: a centered "run sheet" — Source & Output and Folder Layout up top, advanced
// pipeline tuning (dedup, nude, engine, artist) tucked behind a disclosure, and an inline
// footer that pairs a pre-flight summary with Start run. Start run → /scan → Progress.

import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  InputAdornment,
  Slider,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import type { Facet } from "../api/client";
import { api } from "../api/client";
import { CardRadioGroup } from "../components/CardRadioGroup";
import { FadeIn } from "../components/effects/FadeIn";
import { MagneticButton } from "../components/effects/MagneticButton";
import { ScrollReveal } from "../components/effects/ScrollReveal";
import { PageBar, PageContainer } from "../components/PageContainer";
import { SettingRow } from "../components/SettingRow";
import { SettingsSection } from "../components/SettingsSection";
import { usePersistSettings } from "../hooks/usePersistSettings";
import { useToast } from "../hooks/useToast";
import { useAppState } from "../store/AppState";
import { pickDirectory } from "../utils/platform";

const LAYOUTS: { id: string; layout: Facet[]; label: string; preview: string }[] = [
  { id: "c", layout: ["character"], label: "Character", preview: "char/" },
  { id: "a", layout: ["artist"], label: "Artist", preview: "artist/" },
  {
    id: "ca",
    layout: ["character", "artist"],
    label: "Character / Artist",
    preview: "char/ ▸ artist/",
  },
  {
    id: "ac",
    layout: ["artist", "character"],
    label: "Artist / Character",
    preview: "artist/ ▸ char/",
  },
];

function FolderField({
  label,
  helperText,
  value,
  onChange,
}: {
  label: string;
  helperText?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <TextField
      fullWidth
      size="small"
      label={label}
      helperText={helperText}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                aria-label={`Browse ${label}`}
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
  const { toast } = useToast();
  const persist = usePersistSettings();
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

  const layoutChoice = LAYOUTS.find((l) => l.id === layoutId) ?? LAYOUTS[0];
  const layout = layoutChoice.layout;
  const hasArtist = layout.includes("artist");
  const inPlace = outputDir.trim() !== "" && outputDir.trim() === inputDir.trim();
  const inputName = inputDir.trim() ? (inputDir.trim().split(/[\\/]/).pop() ?? "") : "";

  // The advanced controls are settings-backed (same keys `start()` sends): `persist` saves +
  // toasts on change so New Run gives the same "Saved" feedback as Settings; `start()` still
  // re-sends them as a pre-flight safety net.

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
    <PageContainer maxWidth={780}>
      <PageBar title="New Run" subtitle="Pick a folder, choose a layout, then launch" />

      {error && (
        <FadeIn>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </FadeIn>
      )}

      <Stack spacing={3}>
        <ScrollReveal>
          <SettingsSection
            title="Source & Output"
            footer={
              inPlace && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Output equals input: images are reorganised in place (moved, not copied). Re-runs
                  stay idempotent — reserved folders are skipped.
                </Alert>
              )
            }
          >
            <Box sx={{ py: 1.5 }}>
              <FolderField
                label="Input folder"
                helperText="Where unsorted images live."
                value={inputDir}
                onChange={setInputDir}
              />
            </Box>
            <Box sx={{ py: 1.5 }}>
              <FolderField
                label="Output folder"
                helperText="Leave blank to reorganise the input folder in place."
                value={outputDir}
                onChange={setOutputDir}
              />
            </Box>
            <SettingRow
              label="Scan subfolders"
              helper="Walk nested directories under the input folder."
              control={
                <Switch
                  checked={recursive}
                  onChange={(e) => {
                    setRecursive(e.target.checked);
                    toast("Saved");
                  }}
                />
              }
            />
          </SettingsSection>
        </ScrollReveal>

        <ScrollReveal delay={0.06}>
          <SettingsSection title="Folder Layout">
            <Box sx={{ py: 1.5 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 1.5 }}
              >
                How sorted folders are named.
              </Typography>
              <CardRadioGroup
                options={LAYOUTS.map((l) => ({ value: l.id, label: l.label, preview: l.preview }))}
                value={layoutId}
                onChange={(v) => {
                  setLayoutId(v);
                  toast("Saved");
                }}
              />
            </Box>
          </SettingsSection>
        </ScrollReveal>

        <ScrollReveal delay={0.12}>
          <SettingsSection title="Deduplication">
            <SettingRow
              label="Keep the highest-resolution copy"
              control={
                <Switch
                  checked={dedup}
                  onChange={(e) => {
                    setDedup(e.target.checked);
                    persist({ dedup_enabled: e.target.checked });
                  }}
                />
              }
            />
            <SettingRow
              stack
              disabled={!dedup}
              label="Match distance"
              value={dupDistance}
              helper="Lower is stricter — only near-identical files merge."
              control={
                <Slider
                  disabled={!dedup}
                  value={dupDistance}
                  min={0}
                  max={12}
                  step={1}
                  marks
                  onChange={(_, v) => setDupDistance(v as number)}
                  onChangeCommitted={(_, v) => persist({ dup_distance: v })}
                />
              }
            />
          </SettingsSection>
        </ScrollReveal>

        <ScrollReveal delay={0.18}>
          <SettingsSection title="Nude policy">
            <SettingRow
              label="Strict"
              helper="Escalate via censor detection."
              control={
                <Switch
                  checked={strictNude}
                  onChange={(e) => {
                    setStrictNude(e.target.checked);
                    persist({ strict_nude: e.target.checked });
                  }}
                />
              }
            />
            <SettingRow
              stack
              label="Explicit threshold"
              value={explicitThreshold.toFixed(2)}
              helper="Lower flags more images as explicit."
              control={
                <Slider
                  value={explicitThreshold}
                  min={0.2}
                  max={0.9}
                  step={0.05}
                  onChange={(_, v) => setExplicitThreshold(v as number)}
                  onChangeCommitted={(_, v) => persist({ explicit_threshold: v })}
                />
              }
            />
          </SettingsSection>
        </ScrollReveal>

        <ScrollReveal delay={0.24}>
          <SettingsSection title="Engine">
            <SettingRow
              label="Use GPU (onnxruntime-gpu)"
              control={
                <Switch
                  checked={useGpu}
                  onChange={(e) => {
                    setUseGpu(e.target.checked);
                    persist({ use_gpu: e.target.checked });
                  }}
                />
              }
            />
            {hasArtist && (
              <Box sx={{ py: 1.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="SauceNAO API key"
                  helperText="Artist reverse-lookup (optional)."
                  value={saucenaoKey}
                  onChange={(e) => setSaucenaoKey(e.target.value)}
                  onBlur={() => persist({ saucenao_key: saucenaoKey || null })}
                />
              </Box>
            )}
          </SettingsSection>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <Card>
            <CardContent>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{ alignItems: { sm: "center" }, justifyContent: "space-between" }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      display: "block",
                      mb: 1,
                    }}
                  >
                    Ready to sort
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                    <Chip size="small" label={layoutChoice.label} />
                    <Chip
                      size="small"
                      variant="outlined"
                      color={inputName ? "default" : "warning"}
                      label={inputName || "no input folder"}
                    />
                    <Chip
                      size="small"
                      variant={inPlace ? "filled" : "outlined"}
                      color={inPlace ? "warning" : "default"}
                      label={inPlace ? "in-place (MOVE)" : "copy to output"}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={dedup ? `dedup ${dupDistance}` : "no dedup"}
                    />
                  </Stack>
                </Box>
                <Box sx={{ flexShrink: 0 }}>
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
              </Stack>
            </CardContent>
          </Card>
        </ScrollReveal>
      </Stack>
    </PageContainer>
  );
}
