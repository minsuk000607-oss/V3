#!/usr/bin/env python3
"""빌드 시 git의 wiki/ → /data/wiki/ 복사 (없는 파일만).
Railway Volume이 없으면 조용히 건너뜀."""
import shutil
from pathlib import Path

SRC = Path(__file__).parent.parent / "wiki"
DST = Path("/data/wiki")

try:
    DST.mkdir(parents=True, exist_ok=True)
    copied = 0
    for src in SRC.rglob("*.md"):
        dst = DST / src.relative_to(SRC)
        if not dst.exists():
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
            copied += 1
    print(f"volume init: {copied}개 파일 복사 → {DST}")
except PermissionError:
    print("volume 없음 — 건너뜀")
