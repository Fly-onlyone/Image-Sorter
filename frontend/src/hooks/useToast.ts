// Toast context — a single themed snackbar shared app-wide via `toast(msg, severity?)`.
// The provider + visual outlet live in components/Toast.tsx.

import { createContext, useContext } from "react";

export type ToastSeverity = "success" | "info" | "warning" | "error";

export interface ToastApi {
  toast: (message: string, severity?: ToastSeverity) => void;
}

export const ToastContext = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
