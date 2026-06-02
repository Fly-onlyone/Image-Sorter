// Persist a settings patch to the backend + confirm with the themed toast. Shared by the
// Settings screen and New Run's settings-backed controls so both give identical "Saved"
// feedback (and surface errors the same way).

import { useCallback } from "react";
import { api } from "../api/client";
import { useToast } from "./useToast";

export function usePersistSettings() {
  const { toast } = useToast();
  return useCallback(
    async (values: Record<string, unknown>) => {
      try {
        await api.patchSettings(values);
        toast("Saved");
      } catch (e) {
        toast(String(e), "error");
      }
    },
    [toast],
  );
}
