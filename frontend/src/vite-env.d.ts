/// <reference types="vite/client" />

interface Window {
  /** Injected by the Tauri Rust shell once the sidecar reports its dynamic port. */
  __SIDECAR_PORT__?: number;
  __SIDECAR_URL__?: string;
  __TAURI_INTERNALS__?: unknown;
}
