// Theme switcher — lists all 11 themes with name + hue + swatch row,
// persists the choice via the theme controller.

import PaletteIcon from "@mui/icons-material/Palette";
import {
  Box,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useThemeController } from "../theme/ThemeContext";

function Swatches({ colors }: { colors: string[] }) {
  return (
    <Stack direction="row" spacing={0.5}>
      {colors.map((c) => (
        <Box key={c} sx={{ width: 14, height: 14, borderRadius: "4px", bgcolor: c }} />
      ))}
    </Stack>
  );
}

export function ThemePicker() {
  const { presets, presetId, setPresetId } = useThemeController();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  return (
    <>
      <Tooltip title="Theme">
        <IconButton
          color="inherit"
          aria-label="Choose theme"
          onClick={(e) => setAnchor(e.currentTarget)}
        >
          <PaletteIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        slotProps={{ paper: { sx: { maxHeight: 460, width: 320 } } }}
      >
        {presets.map((p) => (
          <MenuItem
            key={p.id}
            selected={p.id === presetId}
            onClick={() => {
              setPresetId(p.id);
              setAnchor(null);
            }}
          >
            <ListItemText
              primary={p.name}
              secondary={p.hue}
              slotProps={{ secondary: { sx: { fontSize: 11 } } }}
            />
            <Swatches
              colors={[p.colors.primary, p.colors.secondary, p.colors.success, p.colors.error]}
            />
          </MenuItem>
        ))}
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Studio is the neutral, gallery-friendly option for long review sessions.
          </Typography>
        </Box>
      </Menu>
    </>
  );
}
