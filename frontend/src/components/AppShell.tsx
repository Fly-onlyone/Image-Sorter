// App shell: AppBar (title + run-status chip + theme picker) +
// persistent left Drawer nav + SilkRibbons background behind everything. The run is
// a Stepper flow (Setup → Progress → Review → Commit); Gallery/History/Settings are
// standalone destinations.

import CollectionsIcon from "@mui/icons-material/Collections";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import HistoryIcon from "@mui/icons-material/History";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  AppBar,
  Box,
  Chip,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Step,
  StepLabel,
  Stepper,
  Toolbar,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import { useAppState, type View } from "../store/AppState";
import { SilkRibbons } from "./effects/SilkRibbons";
import { ThemePicker } from "./ThemePicker";

const DRAWER_WIDTH = 232;

const NAV: { view: View; label: string; icon: ReactNode }[] = [
  { view: "setup", label: "New Run", icon: <PhotoLibraryIcon /> },
  { view: "review", label: "Review", icon: <FactCheckIcon /> },
  { view: "gallery", label: "Gallery", icon: <CollectionsIcon /> },
  { view: "history", label: "History", icon: <HistoryIcon /> },
  { view: "settings", label: "Settings", icon: <SettingsIcon /> },
];

const FLOW: View[] = ["setup", "progress", "review", "commit"];
const FLOW_LABELS = ["Setup", "Process", "Review", "Commit"];

// Dial the background down on image-heavy screens so it never fights thumbnails.
const RIBBON_INTENSITY: Partial<Record<View, number>> = { review: 0.12, gallery: 0.12 };

export function AppShell({ children }: { children: ReactNode }) {
  const { view, setView, run } = useAppState();
  const flowIndex = FLOW.indexOf(view);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <SilkRibbons intensity={RIBBON_INTENSITY[view] ?? 1} />

      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <PhotoLibraryIcon sx={{ mr: 1.5, color: "primary.main" }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Image Sorter
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          {run && (
            <Chip
              size="small"
              color="info"
              variant="outlined"
              label={`run ${run.runId} · ${run.scanned} imgs`}
              sx={{ mr: 1 }}
            />
          )}
          <ThemePicker />
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        <List sx={{ px: 1, pt: 1 }}>
          {NAV.map((item) => (
            <ListItemButton
              key={item.view}
              selected={view === item.view || (item.view === "setup" && flowIndex >= 0)}
              onClick={() => setView(item.view)}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, position: "relative", zIndex: 1, p: 3 }}>
        <Toolbar />
        {flowIndex >= 0 && (
          <Stepper activeStep={flowIndex} sx={{ mb: 3, maxWidth: 720 }}>
            {FLOW_LABELS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        )}
        {children}
      </Box>
    </Box>
  );
}
