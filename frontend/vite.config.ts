import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Dev fallback port for the FastAPI sidecar. In production the Rust
// shell injects the dynamic free port; for `vite dev` the sidecar is expected on
// the stable dev port 8771 so HMR has a constant proxy target.
const SIDECAR_DEV_PORT = 8771;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Tauri expects a fixed dev server port and no clearScreen swallowing Rust logs.
  clearScreen: false,
  server: {
    port: 5181,
    strictPort: true,
    proxy: {
      "/api": {
        target: `http://127.0.0.1:${SIDECAR_DEV_PORT}`,
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },
  // Produce a relative-path build so the Tauri WebView can load assets via file://.
  base: "./",
  build: {
    target: "es2022",
    outDir: "dist",
    emptyOutDir: true,
  },
  resolve: {
    alias: { "@": "/src" },
  },
});
