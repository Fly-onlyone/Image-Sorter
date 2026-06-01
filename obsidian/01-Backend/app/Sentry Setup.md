---
tags: [backend, app]
---

# Sentry Setup

> Optional, opt-in crash reporting for the sidecar — a no-op unless explicitly enabled.

## Source

- `backend/app/sentry_setup.py` — primary implementation

## How it works

`init_sentry()` is called from the [[FastAPI Server]] lifespan hook and short-circuits to `False` unless **both** gates pass: the `IMGSORT_SENTRY_DSN` env var is present **and** `settings['sentry_opt_in']` is truthy in the [[SQLite Repository]]. Only then does it lazily `import sentry_sdk`, init with the `FastApiIntegration`, `traces_sample_rate=0.0`, and `send_default_pii=False`, tagging the `IMGSORT_RELEASE`. Every step is wrapped in `try/except` so a missing SDK or DB never breaks startup.

This dual-gate design means dev runs and privacy-conscious users send nothing by default. ML model-load is the place crash traces on user machines help most.

## Depends on

- [[SQLite Repository]] — reads `sentry_opt_in`

## Used by

- [[FastAPI Server]] — `init_sentry()` in lifespan

## See also

- [[01-Backend/app/_index|app/ modules]]
- [[Sentry Crash Reporting]]
