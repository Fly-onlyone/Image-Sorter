// Themed toast outlet: a bottom-CENTER Snackbar + outlined Alert (auto-themed by the
// palette severity slot — no hardcoded hex). Outlined (no severity fill) over a SOLID
// `background.paper` surface so it reads as a centered pill over the SilkRibbons — NO
// backdrop-filter (a blur on a fixed/portaled element forms a compositing layer that
// hid the toast in the WebView). Snappy auto-hide; each toast() replaces the prior state
// so rapid saves reset rather than stack. Mount <ToastProvider> once, high in the tree.

import { Alert, Portal, Snackbar } from "@mui/material";
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
      <Portal>
        <Snackbar
          open={state.open}
          autoHideDuration={1600}
          onClose={(_, reason) => {
            if (reason === "clickaway") return;
            close();
          }}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            variant="outlined"
            severity={state.severity}
            onClose={close}
            sx={{
              backgroundColor: "background.paper",
              backgroundImage: "none",
              boxShadow: 8,
              borderRadius: 2,
            }}
          >
            {state.message}
          </Alert>
        </Snackbar>
      </Portal>
    </ToastContext.Provider>
  );
}
