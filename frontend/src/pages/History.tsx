// History / Runs: a DataGrid of past runs from the manifest.

import { Alert, Box, Chip, Typography } from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { api } from "../api/client";

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
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listRuns()
      .then((r) => setRows(r.runs))
      .catch((e) => setError(String(e)));
  }, []);

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>
        History
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}
      <Box sx={{ height: 540 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowId={(r) => r.run_id as string}
          density="compact"
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
}
