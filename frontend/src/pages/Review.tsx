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
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { MagneticButton } from "../components/effects/MagneticButton";
import { ScrollReveal } from "../components/effects/ScrollReveal";
import { PageContainer, PageHeader } from "../components/PageContainer";
import { useToast } from "../hooks/useToast";
import { useAppState } from "../store/AppState";

type Row = Record<string, unknown>;
type Cluster = { label: number; hashes: string[]; hint: string | null };

// Width-responsive thumbnail grid — columns follow window width (was a fixed
// ImageList cols={min(8, count)} that ignored the viewport).
const GRID_COLUMNS = "repeat(auto-fill, minmax(clamp(96px, 10vw, 160px), 1fr))";
const SKELETON_IDS = Array.from({ length: 12 }, (_, i) => `sk-${i}`);

function Thumb({ hash, size }: { hash: string; size?: number }) {
  return (
    <img
      src={api.thumbUrl(hash)}
      alt={hash}
      loading="lazy"
      style={{
        width: size ?? "100%",
        height: size,
        aspectRatio: size ? undefined : "1",
        objectFit: "cover",
        borderRadius: 8,
        display: "block",
      }}
    />
  );
}

function ThumbGrid({ hashes }: { hashes: string[] }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: GRID_COLUMNS, gap: 1 }}>
      {hashes.slice(0, 24).map((h) => (
        <Thumb key={h} hash={h} />
      ))}
    </Box>
  );
}

export function ReviewScreen() {
  const { run, setView } = useAppState();
  const { toast } = useToast();
  const [tab, setTab] = useState(0);
  const [review, setReview] = useState<Record<string, Row[]>>({});
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [names, setNames] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!run) return;
    setLoading(true);
    setError(null);
    try {
      const [r, c] = await Promise.all([
        api.getReview(run.runId),
        api.getClusters(run.runId, "character"),
      ]);
      setReview(r);
      setClusters(c.clusters);
      setNames(Object.fromEntries(c.clusters.map((cl) => [cl.label, cl.hint ?? ""])));
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
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
    try {
      await api.mediaReassign(run.runId, [hash], mediaType);
      setReview((prev) => ({
        ...prev,
        media_review: (prev.media_review ?? []).filter((row) => row.hash !== hash),
      }));
    } catch (e) {
      toast(String(e), "error");
    }
  }

  async function nameCluster(label: number) {
    if (!run) return;
    const name = names[label]?.trim();
    if (!name) return;
    try {
      await api.nameCluster(run.runId, label, name);
      setClusters((prev) => prev.filter((c) => c.label !== label));
      toast(`Enrolled “${name}”`);
    } catch (e) {
      toast(String(e), "error");
    }
  }

  return (
    <PageContainer maxWidth="fluid" fill>
      <PageHeader
        title="Review"
        subtitle="Resolve borderline media and name unknown clusters"
        actions={
          <MagneticButton variant="contained" onClick={() => setView("commit")}>
            Continue to Commit
          </MagneticButton>
        }
      />

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

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => load()}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: "grid", gridTemplateColumns: GRID_COLUMNS, gap: 1 }}>
          {SKELETON_IDS.map((id) => (
            <Skeleton key={id} variant="rounded" sx={{ width: "100%", aspectRatio: "1" }} />
          ))}
        </Box>
      )}

      {!loading && tab === 0 && (
        <Stack spacing={1.5}>
          {media.length === 0 && (
            <Alert severity="success">No borderline media — gate was confident.</Alert>
          )}
          {media.map((row) => (
            <Card key={String(row.hash)}>
              <CardContent>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                  <Thumb hash={String(row.hash)} size={104} />
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
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

      {!loading && tab === 1 && (
        <Stack spacing={2}>
          {clusters.length === 0 && <Alert severity="success">No unnamed clusters.</Alert>}
          {clusters.map((cluster, i) => (
            <ScrollReveal key={cluster.label} delay={Math.min(i * 0.04, 0.3)}>
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
                  <ThumbGrid hashes={cluster.hashes} />
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </Stack>
      )}

      {!loading && tab === 2 && (
        <Card>
          <CardContent>
            {borderlineChar.length === 0 ? (
              <Alert severity="success">No borderline character matches.</Alert>
            ) : (
              <ThumbGrid hashes={borderlineChar.map((r) => String(r.hash))} />
            )}
          </CardContent>
        </Card>
      )}

      {!loading && tab === 3 && (
        <Card>
          <CardContent>
            {borderlineNude.length === 0 ? (
              <Alert severity="success">Nothing near the explicit threshold.</Alert>
            ) : (
              <ThumbGrid hashes={borderlineNude.map((r) => String(r.hash))} />
            )}
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
