// Active-theme context + provider. Persists the choice to localStorage
// (and mirrors it to the backend settings table) and applies the MUI theme.

import { CssBaseline, ThemeProvider } from "@mui/material";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../api/client";
import { buildTheme, DEFAULT_THEME_ID, getPreset, PRESETS } from "./index";
import type { ThemePreset } from "./types";

const STORAGE_KEY = "image-sorter.theme";

interface ThemeController {
  presetId: string;
  preset: ThemePreset;
  presets: ThemePreset[];
  setPresetId: (id: string) => void;
}

const Ctx = createContext<ThemeController | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [presetId, setPresetIdState] = useState<string>(
    () => localStorage.getItem(STORAGE_KEY) ?? DEFAULT_THEME_ID,
  );

  const setPresetId = useCallback((id: string) => {
    setPresetIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
    api.patchSettings({ theme: id }).catch(() => void 0);
  }, []);

  // Hydrate from the backend's persisted setting once on mount.
  useEffect(() => {
    api
      .getSettings()
      .then((s) => {
        const remote = s.theme as string | undefined;
        if (remote && PRESETS.some((p) => p.id === remote)) {
          setPresetIdState(remote);
          localStorage.setItem(STORAGE_KEY, remote);
        }
      })
      .catch(() => void 0);
  }, []);

  const preset = getPreset(presetId);
  const theme = useMemo(() => buildTheme(preset), [preset]);

  const value = useMemo<ThemeController>(
    () => ({ presetId, preset, presets: PRESETS, setPresetId }),
    [presetId, preset, setPresetId],
  );

  return (
    <Ctx.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </Ctx.Provider>
  );
}

export function useThemeController(): ThemeController {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useThemeController must be used within AppThemeProvider");
  return ctx;
}
