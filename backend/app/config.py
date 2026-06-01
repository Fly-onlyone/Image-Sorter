"""Runtime configuration for the sidecar.

All runtime knobs (dedup, media gate, nude policy, identity) live here. Values are
read from environment variables (prefix ``IMGSORT_``) with sane defaults, and persisted user overrides
are layered on top from the SQLite ``settings`` table at runtime.
"""

from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


def _default_data_dir() -> Path:
    base = os.environ.get("LOCALAPPDATA") or str(Path.home() / ".local" / "share")
    return Path(base) / "ImageSorter"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="IMGSORT_", extra="ignore")

    # ── networking (dynamic free port) ───────────────────────
    host: str = "127.0.0.1"
    # 0 → ask the OS for a free port. Fixed fallbacks (8770 prod / 8771 dev) are
    # applied by __main__ only when explicitly requested.
    port: int = 0

    # ── storage ───────────────────────────────────────────────────────────
    data_dir: Path = Field(default_factory=_default_data_dir)

    # ── dedup ──────────────────────────────────────────────────────
    dup_distance: int = 6  # phash Hamming threshold
    dup_lpips_max: float = 0.45  # LPIPS "same image" cutoff for gray-zone pairs
    dup_trash: bool = True  # True → send2trash losers; False → flag only

    # ── media gate ─────────────────────────────────────────────────
    gate_ai_max: float = 0.65  # is_ai_created above this → other/
    gate_anime_min: float = 0.5  # anime_real anime score below this → other/
    gate_illustration_min: float = 0.65  # classify illustration ≥ → continue
    gate_other_min: float = 0.6  # classify {comic,bangumi,3d,not_painting} ≥ → other/

    # ── nude policy ──────────────────────────────────────────────────
    explicit_threshold: float = 0.5
    strict_nude: bool = True
    censor_review_floor: float = 0.25

    # ── character identity ──────────────────────────────────────────
    ccip_model: str = "ccip-caformer_b36-24"
    char_threshold: float = 0.75  # tagger-hint confidence for auto-enroll
    ccip_threshold: float = 0.0  # 0 → load the model's own published threshold

    # ── engine ────────────────────────────────────────────────────────────
    use_gpu: bool = False
    recursive_default: bool = True

    @property
    def db_path(self) -> Path:
        return self.data_dir / "image-sorter.sqlite"

    @property
    def thumbs_dir(self) -> Path:
        return self.data_dir / "thumbs"

    @property
    def models_dir(self) -> Path:
        return self.data_dir / "models"

    def ensure_dirs(self) -> None:
        for p in (self.data_dir, self.thumbs_dir, self.models_dir):
            p.mkdir(parents=True, exist_ok=True)


@lru_cache
def get_settings() -> Settings:
    s = Settings()
    s.ensure_dirs()
    return s
