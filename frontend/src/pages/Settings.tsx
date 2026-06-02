// Settings: a centered single-column sheet of grouped setting-rows — Detection thresholds,
// Engine & UX, Appearance. Sliders persist on release; switches persist immediately. The
// theme picker lives in the AppBar (all 11 themes, default Dracula).

import { Chip, Slider, Stack, Switch } from "@mui/material";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { ScrollReveal } from "../components/effects/ScrollReveal";
import { PageBar, PageContainer } from "../components/PageContainer";
import { SettingRow } from "../components/SettingRow";
import { SettingsSection } from "../components/SettingsSection";
import { usePersistSettings } from "../hooks/usePersistSettings";
import { REDUCED_MOTION_EVENT } from "../hooks/usePrefersReducedMotion";
import { useToast } from "../hooks/useToast";

export function SettingsScreen() {
  const { toast } = useToast();
  const persist = usePersistSettings();
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

  return (
    <PageContainer maxWidth={780}>
      <PageBar title="Settings" subtitle="Thresholds, engine and UX preferences" />

      <Stack spacing={3}>
        <ScrollReveal>
          <SettingsSection title="Detection">
            <SettingRow
              stack
              label="Dedup match distance"
              value={dupDistance}
              helper="Lower is stricter — only near-identical files are treated as duplicates."
              control={
                <Slider
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
            <SettingRow
              stack
              label="Explicit (nude) threshold"
              value={explicit.toFixed(2)}
              helper="Lower flags more images as explicit."
              control={
                <Slider
                  value={explicit}
                  min={0.2}
                  max={0.9}
                  step={0.05}
                  onChange={(_, v) => setExplicit(v as number)}
                  onChangeCommitted={(_, v) => persist({ explicit_threshold: v })}
                />
              }
            />
            <SettingRow
              stack
              label="Gate illustration min"
              value={illustrationMin.toFixed(2)}
              helper="Higher = stricter anime-art gate."
              control={
                <Slider
                  value={illustrationMin}
                  min={0.4}
                  max={0.9}
                  step={0.05}
                  onChange={(_, v) => setIllustrationMin(v as number)}
                  onChangeCommitted={(_, v) => persist({ gate_illustration_min: v })}
                />
              }
            />
            <SettingRow
              stack
              label="Character hint confidence"
              value={charThreshold.toFixed(2)}
              helper="Higher = fewer auto-enrolled character hints."
              control={
                <Slider
                  value={charThreshold}
                  min={0.4}
                  max={0.95}
                  step={0.05}
                  onChange={(_, v) => setCharThreshold(v as number)}
                  onChangeCommitted={(_, v) => persist({ char_threshold: v })}
                />
              }
            />
          </SettingsSection>
        </ScrollReveal>

        <ScrollReveal delay={0.06}>
          <SettingsSection title="Engine & UX">
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
            <SettingRow
              label="Reduce motion"
              helper="Freeze SilkRibbons + animations."
              control={
                <Switch
                  checked={reducedMotion}
                  onChange={(e) => {
                    setReducedMotion(e.target.checked);
                    localStorage.setItem("image-sorter.reducedMotion", String(e.target.checked));
                    window.dispatchEvent(new Event(REDUCED_MOTION_EVENT));
                    toast("Saved");
                  }}
                />
              }
            />
            <SettingRow
              label="Send anonymous crash reports"
              helper="Sentry."
              control={
                <Switch
                  checked={sentry}
                  onChange={(e) => {
                    setSentry(e.target.checked);
                    persist({ sentry_opt_in: e.target.checked });
                  }}
                />
              }
            />
          </SettingsSection>
        </ScrollReveal>

        <ScrollReveal delay={0.12}>
          <SettingsSection title="Appearance">
            <SettingRow
              label="Theme"
              helper="11 themes, default Dracula."
              control={<Chip variant="outlined" size="small" label="Palette button · top bar" />}
            />
          </SettingsSection>
        </ScrollReveal>
      </Stack>
    </PageContainer>
  );
}
