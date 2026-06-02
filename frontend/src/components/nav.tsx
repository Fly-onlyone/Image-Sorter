// Shared navigation metadata — single source of truth for AppShell (sidebar + run-flow
// highlight) and PageBar (rail icon + the relocated run-flow stepper). Keeping the icon
// map + flow definition here avoids duplicating them across the shell and the title rail.

import AutorenewIcon from "@mui/icons-material/Autorenew";
import CollectionsIcon from "@mui/icons-material/Collections";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import HistoryIcon from "@mui/icons-material/History";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import SettingsIcon from "@mui/icons-material/Settings";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import type { ReactNode } from "react";
import type { View } from "../store/AppState";

// Mirrors the default MUI desktop Toolbar height; PageBar pins just beneath the fixed
// AppBar. A single constant so a future AppBar-height change is a one-line edit.
export const APPBAR_HEIGHT = 64;

// One icon per view (superset of the sidebar NAV — also covers progress/commit).
export const VIEW_ICONS: Record<View, ReactNode> = {
  setup: <PhotoLibraryIcon />,
  progress: <AutorenewIcon />,
  review: <FactCheckIcon />,
  commit: <TaskAltIcon />,
  gallery: <CollectionsIcon />,
  history: <HistoryIcon />,
  settings: <SettingsIcon />,
};

// The run-flow stepper sequence (Setup → Process → Review → Commit).
export const FLOW: View[] = ["setup", "progress", "review", "commit"];
export const FLOW_LABELS = ["Setup", "Process", "Review", "Commit"];
