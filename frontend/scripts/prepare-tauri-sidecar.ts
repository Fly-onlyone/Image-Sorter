// Build the FastAPI sidecar with PyInstaller and drop it into
// frontend/src-tauri/binaries/ renamed to <name>-<target-triple>.exe so Tauri's
// externalBin can find it (ports ZZZ Bot's prepare-tauri-sidecar.ts).
//
// Run from the frontend dir:  bun run tauri:prepare-sidecar

import { existsSync } from "node:fs";
import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { $ } from "bun";

const ROOT = resolve(import.meta.dir, "..", ".."); // repo root
const BIN_DIR = join(ROOT, "frontend", "src-tauri", "binaries");
const DIST = join(ROOT, "product", "dist");
const SIDECAR_NAME = "image-sorter-sidecar";

async function targetTriple(): Promise<string> {
  // Parse `rustc -Vv` → "host: x86_64-pc-windows-msvc".
  const out = await $`rustc -Vv`.text();
  const host = out.split("\n").find((l) => l.startsWith("host:"));
  if (!host) throw new Error("could not determine Rust host target triple");
  return host.replace("host:", "").trim();
}

async function main() {
  const triple = await targetTriple();
  console.log(`> target triple: ${triple}`);

  console.log("> ensuring ML + build deps are installed (uv sync --extra ml --extra build)…");
  await $`uv sync --extra ml --extra build`.cwd(ROOT);

  console.log("> building sidecar with PyInstaller…");
  await $`uv run pyinstaller product/sidecar.spec --noconfirm --clean --distpath product/dist --workpath product/build-sidecar`.cwd(
    ROOT,
  );

  const built = join(DIST, `${SIDECAR_NAME}.exe`);
  if (!existsSync(built)) {
    throw new Error(`PyInstaller output not found at ${built}`);
  }

  const target = join(BIN_DIR, `${SIDECAR_NAME}-${triple}.exe`);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(built, target);
  console.log(`> sidecar ready: ${target}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
