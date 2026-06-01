"""Pydantic request/response models for the endpoints in"""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

Facet = Literal["character", "artist"]
Layout = list[Facet]


class ScanRequest(BaseModel):
    input_dir: str
    output_dir: str | None = None  # None → defaults to input_dir (in-place)
    recursive: bool = True


class ScanResponse(BaseModel):
    run_id: str
    scanned: int
    skipped: int
    in_place: bool


class DedupRequest(BaseModel):
    run_id: str
    dup_distance: int | None = None  # None → use settings default


class GateRequest(BaseModel):
    run_id: str


class TagRequest(BaseModel):
    run_id: str


class IdentifyRequest(BaseModel):
    run_id: str
    layout: Layout = Field(default_factory=lambda: ["character"])


class ClusterRequest(BaseModel):
    run_id: str
    facet: Facet = "character"


class LookupRequest(BaseModel):
    run_id: str


class EnrollRequest(BaseModel):
    name: str
    series: str | None = None
    ref_paths: list[str]
    outfit: str | None = None


class NameClusterRequest(BaseModel):
    name: str
    series: str | None = None


class CommitRequest(BaseModel):
    run_id: str
    mode: Literal["copy", "move", "auto"] = "auto"  # auto → move when in-place


class MediaReassignRequest(BaseModel):
    run_id: str
    hashes: list[str]
    media_type: Literal["anime", "other"]


class SettingsPatch(BaseModel):
    """Any subset of the persisted knobs (validated loosely)."""

    values: dict[str, object]
