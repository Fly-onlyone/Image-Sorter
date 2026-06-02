// Gallery Manager: Characters / Artists. List + prototype counts;
// rename/merge/delete (delete + enroll wired; rename/merge are follow-ups).

import DeleteIcon from "@mui/icons-material/Delete";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { Crossfade } from "../components/effects/Crossfade";
import { FadeIn } from "../components/effects/FadeIn";
import { PageBar, PageContainer } from "../components/PageContainer";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import { useToast } from "../hooks/useToast";

interface Character {
  id: number;
  name: string;
  series: string | null;
  prototypes: number;
}

const CARD_GRID = {
  xs: "1fr",
  sm: "repeat(2, 1fr)",
  lg: "repeat(3, 1fr)",
  xl: "repeat(4, 1fr)",
};

export function GalleryScreen() {
  const { toast } = useToast();
  const reduced = usePrefersReducedMotion();
  const [tab, setTab] = useState(0);
  const [characters, setCharacters] = useState<Character[]>([]);

  const load = useCallback(async () => {
    try {
      const g = await api.getGallery();
      setCharacters(g.characters as Character[]);
    } catch (e) {
      toast(String(e), "error");
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(id: number) {
    try {
      await api.deleteCharacter(id);
      setCharacters((c) => c.filter((x) => x.id !== id));
      toast("Character deleted");
    } catch (e) {
      toast(String(e), "error");
    }
  }

  function renderPanel() {
    if (tab === 0)
      return characters.length === 0 ? (
        <FadeIn>
          <Alert severity="info">
            No characters yet — name a cluster during Review or enroll from reference images.
          </Alert>
        </FadeIn>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: CARD_GRID, gap: 2 }}>
          <AnimatePresence initial={false}>
            {characters.map((c, i) => (
              <motion.div
                key={c.id}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0, scale: 0.95 }}
                transition={{
                  duration: 0.3,
                  delay: reduced ? 0 : Math.min(i * 0.04, 0.3),
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <Card sx={{ height: "100%" }}>
                  <CardContent>
                    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="subtitle1" noWrap>
                          {c.name}
                        </Typography>
                        {c.series && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{ display: "block" }}
                          >
                            {c.series}
                          </Typography>
                        )}
                      </Box>
                      <Chip size="small" label={`${c.prototypes} prototypes`} />
                      <IconButton
                        color="error"
                        aria-label={`Delete ${c.name}`}
                        onClick={() => remove(c.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </Box>
      );
    return (
      <FadeIn>
        <Alert severity="info">
          Artists are enrolled automatically from download metadata during artist-layout runs.
        </Alert>
      </FadeIn>
    );
  }

  return (
    <PageContainer maxWidth="fluid">
      <PageBar title="Gallery" subtitle="Enrolled characters and artists" />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Characters" />
        <Tab label="Artists" />
      </Tabs>

      <Crossfade id={tab}>{renderPanel()}</Crossfade>
    </PageContainer>
  );
}
