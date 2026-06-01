// Themed toast outlet: a bottom-right Snackbar + filled Alert (auto-themed by the
// palette severity slot — no hardcoded hex). Replaces the old unstyled bottom-left
// SnackbarContent box. Mount <ToastProvider> once, high in the tree.

import { Alert, Snackbar } from "@mui/material";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { ToastContext, type ToastSeverity } from "../hooks/useToast";

interface ToastState {
  open: boolean;
  message: string;
  severity: ToastSeverity;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ToastState>({
    open: false,
    message: "",
    severity: "success",
  });

  const toast = useCallback((message: string, severity: ToastSeverity = "success") => {
    setState({ open: true, message, severity });
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);
  const close = () => setState((s) => ({ ...s, open: false }));

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={2200}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          close();
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert variant="filled" severity={state.severity} onClose={close} sx={{ width: "100%" }}>
          {state.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}
