---
tags: [integration]
---

# Sentry Crash Reporting

> Optional crash reporting for the FastAPI sidecar — most useful around ML model-load failures on user machines.

## Used for

- [[Sentry Setup]] — initializes the SDK at sidecar startup when enabled
- [[Settings Config]] — `sentry_opt_in` gate read from the `settings` table

## Configuration

- Env var: `IMGSORT_SENTRY_DSN` (required) and optional `IMGSORT_RELEASE`
- Dependency: `sentry-sdk[fastapi]>=2.18` (core, not the `ml` extra)
- Opt-in: only initializes when DSN is set AND `settings['sentry_opt_in']` is true

## Wire-up

- `backend/app/sentry_setup.py` — `init_sentry()` no-ops unless both conditions hold

## Auth mode

DSN

## Gotchas

- `traces_sample_rate=0.0` and `send_default_pii=False` — errors only, no perf traces, no PII. Dev runs and privacy-conscious users send nothing.

## See also

- [[_index]]
- [[Sentry Setup]]
- [[Settings Config]]
