"""Single ML facade over ``dghs-imgutils``.

Every model call goes through here so there is exactly one place that:

* lazy-imports imgutils (so the sidecar boots without the heavy ONNX stack),
* pins ``model='ccip-caformer_b36-24'`` and loads *its own* threshold, and
* provides a deterministic **heuristic fallback** when imgutils is absent — a weak
  16×16 colour embedding stands in for CCIP, gate classifiers assume "anime
  illustration", and the rating assumes SFW. This keeps the full pipeline runnable
  end-to-end in dev; install ``--extra ml`` for the real offline models.

⚠️  Verify every signature against the installed ``dghs-imgutils >= 0.19.0`` before
relying on it — the API shifts between releases.
"""

from __future__ import annotations

import functools
import os

import numpy as np
from PIL import Image, ImageOps

CCIP_MODEL = "ccip-caformer_b36-24"
_FALLBACK_DIM = 768  # 16*16*3


@functools.lru_cache(maxsize=1)
def has_ml() -> bool:
    """True when dghs-imgutils is importable (the real ONNX engine is present)."""
    try:
        import imgutils  # noqa: F401

        return True
    except Exception:
        return False


def _force_offline() -> None:
    # Belt-and-braces: never hit the network at inference time.
    os.environ.setdefault("HF_HUB_OFFLINE", "1")
    os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")


def _open_rgb(path: str) -> Image.Image:
    img = Image.open(path)
    img = ImageOps.exif_transpose(img)
    return img.convert("RGB")


# ── CCIP identity ──────────────────────────────────────────
def _fallback_feature(path: str) -> np.ndarray:
    """Weak but deterministic 768-d colour embedding (dev fallback for CCIP)."""
    arr = np.asarray(_open_rgb(path).resize((16, 16))).astype("float32").reshape(-1)
    norm = np.linalg.norm(arr)
    return arr / norm if norm else arr


def ccip_extract(path: str) -> np.ndarray:
    if not has_ml():
        return _fallback_feature(path)
    _force_offline()
    from imgutils.metrics import ccip_extract_feature

    return np.asarray(ccip_extract_feature(path, model=CCIP_MODEL), dtype="float32")


def ccip_batch_extract(paths: list[str]) -> np.ndarray:
    if not paths:
        return np.zeros((0, _FALLBACK_DIM), dtype="float32")
    if not has_ml():
        return np.stack([_fallback_feature(p) for p in paths])
    _force_offline()
    from imgutils.metrics import ccip_batch_extract_features

    return np.asarray(ccip_batch_extract_features(paths, model=CCIP_MODEL), dtype="float32")


def ccip_extract_image(img: Image.Image) -> np.ndarray:
    """CCIP feature from an in-memory PIL crop (used for multi-character boxes)."""
    rgb = img.convert("RGB")
    if not has_ml():
        arr = np.asarray(rgb.resize((16, 16))).astype("float32").reshape(-1)
        norm = np.linalg.norm(arr)
        return arr / norm if norm else arr
    _force_offline()
    import tempfile
    from pathlib import Path as _Path

    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        rgb.save(tmp.name)
        feat = ccip_extract(tmp.name)
    _Path(tmp.name).unlink(missing_ok=True)
    return feat


def ccip_threshold(default: float = 0.0) -> float:
    """The b36 model's own published cutoff (~0.2132), not the library default 0.178."""
    if default:
        return default
    if not has_ml():
        return 0.18  # fallback-feature space; tuned loosely
    _force_offline()
    try:
        from imgutils.metrics import ccip_default_threshold

        return float(ccip_default_threshold(model=CCIP_MODEL))
    except Exception:
        return 0.2132


def ccip_difference(a: np.ndarray, b: np.ndarray) -> float:
    """Distance between two precomputed feature vectors (lower = more similar)."""
    if has_ml():
        _force_offline()
        try:
            from imgutils.metrics import ccip_difference as _diff

            return float(_diff(a, b))
        except Exception:
            pass
    return float(np.linalg.norm(a - b))


def ccip_merge(features: np.ndarray) -> np.ndarray:
    """L2-normalize + average a few refs into one prototype."""
    if has_ml():
        _force_offline()
        try:
            from imgutils.metrics import ccip_merge as _merge

            return np.asarray(_merge(features), dtype="float32")
        except Exception:
            pass
    feats = np.atleast_2d(features).astype("float32")
    norms = np.linalg.norm(feats, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    mean = (feats / norms).mean(axis=0)
    n = np.linalg.norm(mean)
    return mean / n if n else mean


def ccip_cluster(features: np.ndarray, *, min_samples: int = 5) -> list[int]:
    """Cluster residual features. -1 = noise (OPTICS labels)."""
    if features.shape[0] == 0:
        return []
    if has_ml():
        _force_offline()
        try:
            from imgutils.metrics import ccip_clustering

            return [int(x) for x in ccip_clustering(list(features), method="optics")]
        except Exception:
            pass
    # Fallback: greedy distance grouping in the weak-feature space.
    thr = ccip_threshold() * 1.5
    labels = [-1] * features.shape[0]
    next_label = 0
    for i in range(features.shape[0]):
        if labels[i] != -1:
            continue
        members = [i]
        for j in range(i + 1, features.shape[0]):
            if labels[j] == -1 and float(np.linalg.norm(features[i] - features[j])) <= thr:
                members.append(j)
        if len(members) >= max(2, min_samples - 3):
            for m in members:
                labels[m] = next_label
            next_label += 1
    return labels


# ── dedup confirmer ────────────────────────────────────────────
def lpips_difference(path_a: str, path_b: str) -> float:
    if has_ml():
        _force_offline()
        try:
            from imgutils.metrics import lpips_difference as _lpips

            return float(_lpips(path_a, path_b))
        except Exception:
            pass
    a, b = _fallback_feature(path_a), _fallback_feature(path_b)
    return float(np.linalg.norm(a - b))


# ── media gate ─────────────────────────────────────────────────
def ai_created_score(path: str) -> float:
    if not has_ml():
        return 0.0
    _force_offline()
    from imgutils.validate import get_ai_created_score

    return float(get_ai_created_score(path))


def anime_real_score(path: str) -> float:
    """Probability the image is an anime drawing (vs a real photo)."""
    if not has_ml():
        return 1.0
    _force_offline()
    from imgutils.validate import anime_real_score as _real

    # Installed imgutils returns {type: score} (e.g. {"anime": .., "real": ..}),
    # not a (label, score) tuple — take P(anime) directly.
    return float(_real(path).get("anime", 0.0))


def anime_classify_scores(path: str) -> dict[str, float]:
    """Probabilities over {3d, bangumi, comic, illustration, not_painting}."""
    if not has_ml():
        return {"illustration": 1.0, "comic": 0.0, "bangumi": 0.0, "3d": 0.0, "not_painting": 0.0}
    _force_offline()
    from imgutils.validate import anime_classify_score

    return {k: float(v) for k, v in anime_classify_score(path).items()}


# ── tagging ──────────────────────────────────────────────────────
def wd14_tags(path: str) -> tuple[dict[str, float], dict[str, float], dict[str, float]]:
    """Returns (rating, general, chars). chars is weak — PixAI is the primary hint."""
    if not has_ml():
        return ({"general": 1.0}, {}, {})
    _force_offline()
    from imgutils.tagging import get_wd14_tags

    rating, general, chars = get_wd14_tags(path)
    return (dict(rating), dict(general), dict(chars))


def pixai_char_tags(path: str) -> dict[str, float]:
    """Primary character-name hint (PixAI-Tagger v0.9, char F1 ~0.865)."""
    if not has_ml():
        return {}
    _force_offline()
    from imgutils.tagging import get_pixai_tags

    result = get_pixai_tags(path)
    # Return shape varies by version — confirm against installed build.
    if isinstance(result, tuple):
        # (rating, general, character) style
        chars = result[-1]
    elif isinstance(result, dict):
        chars = result.get("character", result)
    else:
        chars = {}
    return {str(k): float(v) for k, v in dict(chars).items()}


# ── rating ───────────────────────────────────────────────────────
def db_rating_scores(path: str) -> dict[str, float]:
    if not has_ml():
        return {"general": 1.0, "sensitive": 0.0, "questionable": 0.0, "explicit": 0.0}
    _force_offline()
    from imgutils.validate import anime_dbrating_score

    return {k: float(v) for k, v in anime_dbrating_score(path).items()}


def count_censors(path: str) -> int:
    if not has_ml():
        return 0
    _force_offline()
    try:
        from imgutils.detect import detect_censors

        return len(detect_censors(path))
    except Exception:
        return 0
