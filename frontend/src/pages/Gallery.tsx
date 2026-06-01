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
import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { ScrollReveal } from "../components/effects/ScrollReveal";
import { PageContainer, PageHeader } from "../components/PageContainer";
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

  return (
    <PageContainer maxWidth="fluid">
      <PageHeader title="Gallery" subtitle="Enrolled characters and artists" />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Characters" />
        <Tab label="Artists" />
      </Tabs>

      {tab === 0 &&
        (characters.length === 0 ? (
          <Alert severity="info">
            No characters yet — name a cluster during Review or enroll from reference images.
          </Alert>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: CARD_GRID, gap: 2 }}>
            {characters.map((c, i) => (
              <ScrollReveal key={c.id} delay={Math.min(i * 0.04, 0.3)}>
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
              </ScrollReveal>
            ))}
          </Box>
        ))}

      {tab === 1 && (
        <Alert severity="info">
          Artists are enrolled automatically from download metadata during artist-layout runs.
        </Alert>
      )}
    </PageContainer>
  );
}
