---
tags: [operations]
---

# Release Please

> Conventional Commits on `dev` drive release-please, which fans one version into three manifests.

## Source

- `release-please-config.json` / `.release-please-manifest.json` — release config
- `.pre-commit-config.yaml` — `commit-msg` hook enforcing Conventional Commits

## How it works

The default branch is `dev`: PRs target `dev` and release-please runs there. Conventional
Commits are enforced by pre-commit; install the hook with `pre-commit install --hook-type
commit-msg`. release-please uses the **"simple"** strategy and fans the released version into
three manifests:

1. `pyproject.toml` (Python project version)
2. `frontend/src-tauri/tauri.conf.json` (Tauri app version)
3. `frontend/src-tauri/Cargo.toml` (Rust crate version)

This keeps the sidecar, the Tauri shell, and the installer metadata on a single version.

## Depends on

- [[Tauri Config]] — `tauri.conf.json` is one of the fanned-out version targets

## See also

- [[_index]]
- [[Tauri Build]]
- [[Linting and Formatting]]
