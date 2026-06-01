// Sidecar HTTP + SSE client. The base URL is resolved at runtime
// from the dynamic free port the Rust shell injects — never hardcoded.

export type Facet = "character" | "artist";

let _base: string | null = null;
let _basePromise: Promise<string> | null = null;

async function resolveBase(): Promise<string> {
  if (window.__SIDECAR_URL__) return window.__SIDECAR_URL__;
  if (window.__SIDECAR_PORT__) return `http://127.0.0.1:${window.__SIDECAR_PORT__}`;
  if (window.__TAURI_INTERNALS__) {
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      return await invoke<string>("sidecar_url");
    } catch {
      /* fall through to fixed fallback */
    }
  }
  // Dev: hit the Vite proxy (→ sidecar dev port 8771). Prod fallback: 8770.
  if (import.meta.env.DEV) return "/api";
  return "http://127.0.0.1:8770";
}

async function base(): Promise<string> {
  if (_base) return _base;
  if (!_basePromise) _basePromise = resolveBase();
  _base = await _basePromise;
  return _base;
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const url = (await base()) + path;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status} ${path}: ${text}`);
  }
  return (await res.json()) as T;
}

const post = <T>(path: string, body?: unknown) =>
  req<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined });

export interface ScanResult {
  run_id: string;
  scanned: number;
  skipped: number;
  in_place: boolean;
}

export interface PreviewFolder {
  folder: string;
  count: number;
  samples: string[];
}

export interface PreviewResult {
  in_place: boolean;
  tree: PreviewFolder[];
  dedup_trash: string[];
  trash_count: number;
}

export interface SseHandlers {
  onEvent: (event: string, data: Record<string, unknown>) => void;
  onError?: () => void;
}

export const api = {
  /** Resolve and cache the base URL up front so thumbUrl/imageUrl are synchronous. */
  async ready(): Promise<string> {
    return base();
  },

  health: () => req<{ status: string; ml: boolean; version: string }>("/health"),

  getSettings: () => req<Record<string, unknown>>("/settings"),
  patchSettings: (values: Record<string, unknown>) =>
    req<Record<string, unknown>>("/settings", {
      method: "PATCH",
      body: JSON.stringify({ values }),
    }),

  scan: (input_dir: string, output_dir: string | null, recursive: boolean) =>
    post<ScanResult>("/scan", { input_dir, output_dir, recursive }),
  process: (run_id: string, layout: Facet[]) =>
    post<{ accepted: boolean; phases: string[] }>("/process", { run_id, layout }),

  dedup: (run_id: string, dup_distance?: number) =>
    post<{ stats: Record<string, number> }>("/dedup", { run_id, dup_distance }),
  gate: (run_id: string) => post<Record<string, number>>("/gate", { run_id }),
  tag: (run_id: string) => post<Record<string, number>>("/tag", { run_id }),
  identify: (run_id: string, layout: Facet[]) =>
    post<Record<string, number>>("/identify", { run_id, layout }),
  cluster: (run_id: string, layout: Facet[]) =>
    post<{ clusters: number }>("/cluster", { run_id, layout }),

  getClusters: (run_id: string, facet: Facet = "character") =>
    req<{ clusters: { label: number; hashes: string[]; hint: string | null }[] }>(
      `/clusters/${run_id}?facet=${facet}`,
    ),
  getReview: (run_id: string) =>
    req<Record<string, Record<string, unknown>[]>>(`/review/${run_id}`),
  mediaReassign: (run_id: string, hashes: string[], media_type: "anime" | "other") =>
    post<{ updated: number }>("/media/reassign", { run_id, hashes, media_type }),

  enroll: (name: string, ref_paths: string[], series?: string, outfit?: string) =>
    post<{ character_id: number }>("/characters", { name, ref_paths, series, outfit }),
  nameCluster: (run_id: string, label: number, name: string, series?: string) =>
    post<{ character_id: number }>(`/clusters/${run_id}/${label}/name`, { name, series }),
  getGallery: () =>
    req<{ characters: { id: number; name: string; series: string; prototypes: number }[] }>(
      "/gallery",
    ),
  deleteCharacter: (id: number) =>
    req<{ deleted: number }>(`/characters/${id}`, { method: "DELETE" }),

  preview: (run_id: string) => req<PreviewResult>(`/preview/${run_id}`),
  commit: (run_id: string, mode: "copy" | "move" | "auto" = "auto") =>
    post<Record<string, number>>("/commit", { run_id, mode }),

  listRuns: () => req<{ runs: Record<string, unknown>[] }>("/runs"),
  getRun: (run_id: string) =>
    req<{ run: Record<string, unknown>; manifest: Record<string, unknown>[] }>(`/runs/${run_id}`),

  thumbUrl: (hash: string) => `${_base ?? ""}/thumb?hash=${hash}`,
  imageUrl: (hash: string) => `${_base ?? ""}/image?hash=${hash}`,

  events(run_id: string, handlers: SseHandlers): EventSource {
    const url = `${_base ?? ""}/jobs/${run_id}/events`;
    const es = new EventSource(url);
    es.onmessage = (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data);
        handlers.onEvent(data.event ?? "message", data);
      } catch {
        /* keepalive / non-JSON */
      }
    };
    es.onerror = () => handlers.onError?.();
    return es;
  },
};
