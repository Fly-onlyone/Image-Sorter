// History / Runs: a DataGrid of past runs from the manifest.

import { Alert, Box, Chip } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { FadeIn } from "../components/effects/FadeIn";
import { PageBar, PageContainer } from "../components/PageContainer";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";

const columns: GridColDef[] = [
  { field: "run_id", headerName: "Run", width: 120 },
  { field: "input_dir", headerName: "Input", flex: 1, minWidth: 200 },
  { field: "output_dir", headerName: "Output", flex: 1, minWidth: 200 },
  {
    field: "in_place",
    headerName: "In-place",
    width: 100,
    renderCell: (p) => (p.value ? <Chip size="small" color="warning" label="yes" /> : "—"),
  },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: (p) => <Chip size="small" label={String(p.value)} />,
  },
  { field: "started_at", headerName: "Started", width: 200 },
];

export function HistoryScreen() {
  const reduced = usePrefersReducedMotion();
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listRuns()
      .then((r) => setRows(r.runs))
      .catch((e) => setError(String(e)));
  }, []);

  const grid = (
    <DataGrid
      rows={rows}
      columns={columns}
      getRowId={(r) => r.run_id as string}
      density="compact"
      disableRowSelectionOnClick
      sx={{ flex: 1 }}
    />
  );

  return (
    <PageContainer maxWidth="fluid" fill>
      <PageBar title="History" subtitle="Past runs from the manifest" />
      {error && (
        <FadeIn>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </FadeIn>
      )}
      <Box sx={{ flexGrow: 1, minHeight: 360, display: "flex" }}>
        {reduced ? (
          grid
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ flex: 1, display: "flex", minWidth: 0 }}
          >
            {grid}
          </motion.div>
        )}
      </Box>
    </PageContainer>
  );
}
