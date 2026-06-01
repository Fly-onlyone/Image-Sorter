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

interface Character {
  id: number;
  name: string;
  series: string | null;
  prototypes: number;
}

export function GalleryScreen() {
  const [tab, setTab] = useState(0);
  const [characters, setCharacters] = useState<Character[]>([]);

  const load = useCallback(async () => {
    const g = await api.getGallery();
    setCharacters(g.characters as Character[]);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function remove(id: number) {
    await api.deleteCharacter(id);
    setCharacters((c) => c.filter((x) => x.id !== id));
  }

  return (
    <Box sx={{ maxWidth: 880 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        Gallery
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Characters" />
        <Tab label="Artists" />
      </Tabs>

      {tab === 0 && (
        <Stack spacing={1.5}>
          {characters.length === 0 && (
            <Alert severity="info">
              No characters yet — name a cluster during Review or enroll from reference images.
            </Alert>
          )}
          {characters.map((c) => (
            <Card key={c.id}>
              <CardContent>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1">{c.name}</Typography>
                    {c.series && (
                      <Typography variant="caption" color="text.secondary">
                        {c.series}
                      </Typography>
                    )}
                  </Box>
                  <Chip size="small" label={`${c.prototypes} prototypes`} />
                  <IconButton color="error" onClick={() => remove(c.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {tab === 1 && (
        <Alert severity="info">
          Artists are enrolled automatically from download metadata during artist-layout runs.
        </Alert>
      )}
    </Box>
  );
}
