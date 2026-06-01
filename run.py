"""Backend launcher (repo-root entry, matching the TradingAgent convention).

Runs the FastAPI sidecar on a dynamic free port. Also the script
PyInstaller bundles (see product/sidecar.spec).

    uv run python run.py                  # dynamic free port
    IMGSORT_PORT=8771 uv run python run.py  # fixed dev fallback port
"""

import os
import sys

# Make the `app` package under backend/ importable when run as a plain script.
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend"))

from app.__main__ import main  # noqa: E402

if __name__ == "__main__":
    main()
