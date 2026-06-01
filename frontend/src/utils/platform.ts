// Thin wrappers over Tauri plugins with graceful web-dev fallbacks, so the UI runs
// in a plain browser (`vite dev`) as well as inside the Tauri shell.

export function isTauri(): boolean {
  return typeof window !== "undefined" && Boolean(window.__TAURI_INTERNALS__);
}

/** Native folder picker (Tauri) → returns the chosen path, or null if cancelled. */
export async function pickDirectory(title = "Choose folder"): Promise<string | null> {
  if (isTauri()) {
    const { open } = await import("@tauri-apps/plugin-dialog");
    const result = await open({ directory: true, multiple: false, title });
    return typeof result === "string" ? result : null;
  }
  // Web-dev fallback: prompt for a path.
  return window.prompt(title) ?? null;
}

/** Open a folder/file in the OS file explorer. */
export async function openPath(path: string): Promise<void> {
  if (isTauri()) {
    const { open } = await import("@tauri-apps/plugin-shell");
    await open(path);
  } else {
    window.alert(`Output folder:\n${path}`);
  }
}
