"""Optional Sentry init (wire from P0).

No-ops unless ``IMGSORT_SENTRY_DSN`` is set and the user has opted in
(``settings['sentry_opt_in']``), so dev runs and privacy-conscious users send
nothing. ML model-load is exactly where crash traces on user machines help.
"""

from __future__ import annotations

import os


def init_sentry() -> bool:
    dsn = os.environ.get("IMGSORT_SENTRY_DSN")
    if not dsn:
        return False
    try:
        from .db import get_db

        if not get_db().get_setting("sentry_opt_in", False):
            return False
    except Exception:
        return False
    try:
        import sentry_sdk
        from sentry_sdk.integrations.fastapi import FastApiIntegration

        sentry_sdk.init(
            dsn=dsn,
            integrations=[FastApiIntegration()],
            traces_sample_rate=0.0,
            send_default_pii=False,
            release=os.environ.get("IMGSORT_RELEASE"),
        )
        return True
    except Exception:
        return False
