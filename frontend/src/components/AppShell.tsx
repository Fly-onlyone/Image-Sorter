// App shell: AppBar (title + run-status chip + theme picker) +
// persistent left Drawer nav + SilkRibbons background behind everything. The run is
// a Stepper flow (Setup → Progress → Review → Commit); Gallery/History/Settings are
// standalone destinations.

import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import {
  AppBar,
  Box,
  Chip,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useAppState, type View } from "../store/AppState";
import { SilkRibbons } from "./effects/SilkRibbons";
import { FLOW, VIEW_ICONS } from "./nav";
import { PageTransition } from "./PageTransition";
import { ThemePicker } from "./ThemePicker";

const DRAWER_WIDTH = 232;

const NAV: { view: View; label: string }[] = [
  { view: "setup", label: "New Run" },
  { view: "review", label: "Review" },
  { view: "gallery", label: "Gallery" },
  { view: "history", label: "History" },
  { view: "settings", label: "Settings" },
];

// Views with their own sidebar entry. Flow-only steps (progress/commit) have none, so they
// fall back to highlighting New Run; every other view highlights itself — exactly one item
// is ever active (the old `flowIndex >= 0` rule lit New Run AND Review at once on Review).
const NAV_VIEWS = NAV.map((n) => n.view);

export function AppShell({ children }: { children: ReactNode }) {
  const { view, setView, run } = useAppState();
  const theme = useTheme();
  const reduced = usePrefersReducedMotion();
  const flowIndex = FLOW.indexOf(view);
  const activeNav: View = NAV_VIEWS.includes(view) ? view : flowIndex >= 0 ? "setup" : view;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Full intensity on every screen so the signature background reads consistently — the
          ribbons are heavily blurred + low-alpha, so they don't fight the thumbnail grids. */}
      <SilkRibbons />

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
          {NAV.map((item) => {
            const selected = item.view === activeNav;
            return (
              <ListItemButton
                key={item.view}
                selected={selected}
                onClick={() => setView(item.view)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  position: "relative",
                  // The pill below is the highlight (in both motion modes), so drop MUI's
                  // per-item selected fill and just tint the active label/icon. Kept
                  // unconditional so toggling reduce-motion doesn't swap the highlight style
                  // on the active item (which flashed).
                  "&.Mui-selected, &.Mui-selected:hover": {
                    backgroundColor: "transparent",
                    color: "primary.main",
                    "& .MuiListItemIcon-root": { color: "primary.main" },
                  },
                }}
              >
                {selected && (
                  // Reduced-motion drops the shared layoutId so the pill jump-cuts to the
                  // active item instead of sliding (but the pill itself always renders).
                  <motion.div
                    layoutId={reduced ? undefined : "nav-active-pill"}
                    transition={
                      reduced ? { duration: 0 } : { type: "spring", ...theme.app.spring.snappy }
                    }
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 8,
                      background: alpha(theme.palette.primary.main, 0.16),
                      boxShadow: `inset 2px 0 0 ${theme.palette.primary.main}`,
                      zIndex: 0,
                    }}
                  />
                )}
                <ListItemIcon sx={{ minWidth: 40, position: "relative", zIndex: 1 }}>
                  {VIEW_ICONS[item.view]}
                </ListItemIcon>
                <ListItemText primary={item.label} sx={{ position: "relative", zIndex: 1 }} />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          position: "relative",
          zIndex: 1,
          p: 3,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Toolbar sx={{ flexShrink: 0 }} />
        <AnimatePresence mode="wait">
          <PageTransition key={view}>{children}</PageTransition>
        </AnimatePresence>
      </Box>
    </Box>
  );
}
