# PyInstaller spec for the Image Sorter FastAPI sidecar.
#
# Tauri's externalBin expects a single file, so this is a one-file build with
# collect_all() pulling in onnxruntime's native DLLs + imgutils/imagehash data so
# they aren't dropped (the failure mode the plan warns about). If a one-file build
# still drops a DLL on a target machine, switch to a one-dir build (EXE + COLLECT)
# and ship the folder via Tauri `bundle.resources`, spawning the exe from there.

import os

from PyInstaller.utils.hooks import collect_all, collect_submodules

# Spec lives in product/; the project (run.py, backend/) is one level up. PyInstaller
# resolves Analysis script paths relative to the spec dir, so make them absolute.
ROOT = os.path.dirname(SPECPATH)  # noqa: F821 (SPECPATH injected by PyInstaller)

datas, binaries, hiddenimports = [], [], []

# ML stack is optional at build time; collect whatever is installed.
for pkg in ("onnxruntime", "imgutils", "imagehash"):
    try:
        d, b, h = collect_all(pkg)
        datas += d
        binaries += b
        hiddenimports += h
    except Exception:
        pass

hiddenimports += collect_submodules("uvicorn")
# uvicorn imports the app via the string "app.server:app", and engine/models.py
# lazy-imports imgutils as strings, so neither is found by static analysis. Bundle
# the whole app package explicitly.
hiddenimports += collect_submodules("app")
hiddenimports += [
    "anyio",
    "sentry_sdk.integrations.fastapi",
    "sentry_sdk.integrations.starlette",
]

a = Analysis(
    [os.path.join(ROOT, "run.py")],
    pathex=[os.path.join(ROOT, "backend"), ROOT],
    binaries=binaries,
    datas=datas,
    hiddenimports=hiddenimports,
    hookspath=[],
    runtime_hooks=[],
    # onnxruntime.quantization needs onnx (not installed / not used at inference).
    excludes=["tkinter", "matplotlib", "pytest", "onnx", "onnxruntime.quantization"],
    noarchive=False,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name="image-sorter-sidecar",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=True,
    disable_windowed_traceback=False,
    target_arch=None,
)
