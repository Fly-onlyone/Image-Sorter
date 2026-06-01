// Commit & Summary: mandatory preview tree + dedup/gate routes.
// Nothing touches disk until Confirm.

import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { api, type PreviewResult } from "../api/client";
import { MagneticButton } from "../components/effects/MagneticButton";
import { useAppState } from "../store/AppState";
import { openPath } from "../utils/platform";

export function CommitScreen() {
  const { run, setView } = useAppState();
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [committed, setCommitted] = useState<Record<string, number> | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!run) return;
    api
      .preview(run.runId)
      .then(setPreview)
      .catch((e) => setError(String(e)));
  }, [run]);

  if (!run) return <Alert severity="info">No active run — start one from New Run.</Alert>;

  async function confirm() {
    if (!run) return;
    setBusy(true);
    setError(null);
    try {
      const stats = await api.commit(run.runId, "auto");
      setCommitted(stats);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 960 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Commit &amp; Summary
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!preview && !error && <Typography color="text.secondary">Building preview…</Typography>}

      {preview && !committed && (
        <>
          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            <Chip
              color={preview.in_place ? "warning" : "info"}
              label={preview.in_place ? "In-place (MOVE)" : "Copy to output"}
            />
            <Chip
              icon={<DeleteSweepIcon />}
              color="error"
              variant="outlined"
              label={`${preview.trash_count} → Recycle Bin`}
            />
            <Chip variant="outlined" label={`${preview.tree.length} folders`} />
          </Stack>

          <Alert severity="info" sx={{ mb: 2 }}>
            Proposed structure below. Nothing is written until you confirm.
          </Alert>

          <Grid container spacing={1.5}>
            {preview.tree.map((folder) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={folder.folder}>
                <Card>
                  <CardContent>
                    <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: "center" }}>
                      <FolderOpenIcon fontSize="small" color="primary" />
                      <Typography variant="subtitle2" noWrap title={folder.folder}>
                        {folder.folder || "(root)"}
                      </Typography>
                      <Box sx={{ flexGrow: 1 }} />
                      <Chip size="small" label={folder.count} />
                    </Stack>
                    <Stack direction="row" spacing={0.5}>
                      {folder.samples.map((h) => (
                        <img
                          key={h}
                          src={api.thumbUrl(h)}
                          alt={h}
                          style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6 }}
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <MagneticButton variant="contained" size="large" disabled={busy} onClick={confirm}>
              {busy ? "Committing…" : "Confirm & commit"}
            </MagneticButton>
            <Button color="inherit" onClick={() => setView("review")}>
              Back to Review
            </Button>
          </Box>
        </>
      )}

      {committed && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Done
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
              {Object.entries(committed).map(([k, v]) => (
                <Chip key={k} label={`${k}: ${v}`} />
              ))}
            </Stack>
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<FolderOpenIcon />}
                onClick={() => openPath(run.outputDir)}
              >
                Open output folder
              </Button>
              <Button color="inherit" onClick={() => setView("setup")}>
                New run
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
