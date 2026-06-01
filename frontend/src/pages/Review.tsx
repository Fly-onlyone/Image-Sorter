// Review — the heart. Tabs: Media review, Unknown clusters,
// Borderline characters, Borderline Nude. Naming a cluster auto-enrolls it.

import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  ImageList,
  ImageListItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { ScrollReveal } from "../components/effects/ScrollReveal";
import { useAppState } from "../store/AppState";

type Row = Record<string, unknown>;
type Cluster = { label: number; hashes: string[]; hint: string | null };

function Thumb({ hash, size = 104 }: { hash: string; size?: number }) {
  return (
    <ImageListItem>
      <img
        src={api.thumbUrl(hash)}
        alt={hash}
        loading="lazy"
        style={{ width: size, height: size, objectFit: "cover", borderRadius: 8 }}
      />
    </ImageListItem>
  );
}

function Grid({ hashes, size }: { hashes: string[]; size?: number }) {
  return (
    <ImageList cols={Math.min(8, Math.max(2, hashes.length))} gap={8} sx={{ m: 0 }}>
      {hashes.slice(0, 24).map((h) => (
        <Thumb key={h} hash={h} size={size} />
      ))}
    </ImageList>
  );
}

export function ReviewScreen() {
  const { run, setView } = useAppState();
  const [tab, setTab] = useState(0);
  const [review, setReview] = useState<Record<string, Row[]>>({});
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [names, setNames] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!run) return;
    setLoading(true);
    const [r, c] = await Promise.all([
      api.getReview(run.runId),
      api.getClusters(run.runId, "character"),
    ]);
    setReview(r);
    setClusters(c.clusters);
    setNames(Object.fromEntries(c.clusters.map((cl) => [cl.label, cl.hint ?? ""])));
    setLoading(false);
  }, [run]);

  useEffect(() => {
    load();
  }, [load]);

  if (!run) return <Alert severity="info">No active run — start one from New Run.</Alert>;

  const media = review.media_review ?? [];
  const borderlineChar = review.borderline_char ?? [];
  const borderlineNude = review.borderline_nude ?? [];

  async function reassign(hash: string, mediaType: "anime" | "other") {
    if (!run) return;
    await api.mediaReassign(run.runId, [hash], mediaType);
    setReview((prev) => ({
      ...prev,
      media_review: (prev.media_review ?? []).filter((row) => row.hash !== hash),
    }));
  }

  async function nameCluster(label: number) {
    if (!run) return;
    const name = names[label]?.trim();
    if (!name) return;
    await api.nameCluster(run.runId, label, name);
    setClusters((prev) => prev.filter((c) => c.label !== label));
  }

  return (
    <Box>
      <Stack direction="row" sx={{ mb: 1, alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h4">Review</Typography>
        <Button variant="contained" onClick={() => setView("commit")}>
          Continue to Commit
        </Button>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab
          label={
            <Badge color="warning" badgeContent={media.length}>
              Media review
            </Badge>
          }
        />
        <Tab
          label={
            <Badge color="info" badgeContent={clusters.length}>
              Unknown clusters
            </Badge>
          }
        />
        <Tab
          label={
            <Badge color="warning" badgeContent={borderlineChar.length}>
              Borderline chars
            </Badge>
          }
        />
        <Tab
          label={
            <Badge color="error" badgeContent={borderlineNude.length}>
              Borderline nude
            </Badge>
          }
        />
      </Tabs>

      {loading && <Typography color="text.secondary">Loading…</Typography>}

      {tab === 0 && (
        <Stack spacing={1.5}>
          {media.length === 0 && (
            <Alert severity="success">No borderline media — gate was confident.</Alert>
          )}
          {media.map((row) => (
            <Card key={String(row.hash)}>
              <CardContent>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                  <Thumb hash={String(row.hash)} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" noWrap>
                      {String(row.src_path)}
                    </Typography>
                    <Chip
                      size="small"
                      label="uncertain: anime vs other"
                      color="warning"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => reassign(String(row.hash), "anime")}
                  >
                    Anime
                  </Button>
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => reassign(String(row.hash), "other")}
                  >
                    Other
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {tab === 1 && (
        <Stack spacing={2}>
          {clusters.length === 0 && <Alert severity="success">No unnamed clusters.</Alert>}
          {clusters.map((cluster) => (
            <ScrollReveal key={cluster.label}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={2} sx={{ mb: 1, alignItems: "center" }}>
                    <Typography variant="subtitle1">Cluster #{cluster.label}</Typography>
                    <Chip size="small" label={`${cluster.hashes.length} images`} />
                    <Box sx={{ flexGrow: 1 }} />
                    <TextField
                      size="small"
                      placeholder="Character name"
                      value={names[cluster.label] ?? ""}
                      onChange={(e) => setNames((n) => ({ ...n, [cluster.label]: e.target.value }))}
                    />
                    <Button variant="contained" onClick={() => nameCluster(cluster.label)}>
                      Name &amp; enroll
                    </Button>
                  </Stack>
                  <Grid hashes={cluster.hashes} />
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </Stack>
      )}

      {tab === 2 && (
        <Card>
          <CardContent>
            {borderlineChar.length === 0 ? (
              <Alert severity="success">No borderline character matches.</Alert>
            ) : (
              <Grid hashes={borderlineChar.map((r) => String(r.hash))} />
            )}
          </CardContent>
        </Card>
      )}

      {tab === 3 && (
        <Card>
          <CardContent>
            {borderlineNude.length === 0 ? (
              <Alert severity="success">Nothing near the explicit threshold.</Alert>
            ) : (
              <Grid hashes={borderlineNude.map((r) => String(r.hash))} />
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
