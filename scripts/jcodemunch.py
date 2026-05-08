#!/usr/bin/env python3
"""wiki/ + raw/ 코드 파일에서 함수·클래스·상수 심볼 추출.
LLM 없음. 정규식 기반 1차 추출.
출력: generated/index/code.index.json

현재 위키는 코드 파일이 없지만, 추후 raw/code/ 폴더 사용 시 작동.
"""
import re, json
from pathlib import Path

ROOT = Path(__file__).parent.parent

CODE_ROOTS = [
    Path(__file__).parent.parent / "raw",
    Path(__file__).parent.parent / "site" / "lib",
    Path(__file__).parent.parent / "site" / "app",
    Path(__file__).parent.parent / "scripts",
]
OUT = Path(__file__).parent.parent / "generated" / "index" / "code.index.json"

# 언어별 심볼 추출 패턴
PATTERNS = {
    ".py":  [
        ("function", re.compile(r"^def\s+(\w+)\s*\(", re.MULTILINE)),
        ("class",    re.compile(r"^class\s+(\w+)[\s(:]", re.MULTILINE)),
    ],
    ".ts":  [
        ("function", re.compile(r"(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*[<(]", re.MULTILINE)),
        ("const",    re.compile(r"export\s+const\s+(\w+)\s*=", re.MULTILINE)),
        ("type",     re.compile(r"export\s+type\s+(\w+)\s*[={<]", re.MULTILINE)),
    ],
    ".tsx": [
        ("component", re.compile(r"export\s+(?:default\s+)?function\s+(\w+)", re.MULTILINE)),
        ("const",     re.compile(r"export\s+(?:const|function)\s+(\w+)", re.MULTILINE)),
    ],
}


def extract_symbols(path: Path) -> list[dict]:
    ext     = path.suffix
    pats    = PATTERNS.get(ext, [])
    if not pats: return []

    text    = path.read_text(encoding="utf-8", errors="ignore")
    lines   = text.splitlines()
    symbols = []

    for kind, pat in pats:
        for m in pat.finditer(text):
            lineno  = text[:m.start()].count("\n")
            context = "\n".join(lines[max(0, lineno):lineno + 5])
            symbols.append({
                "file":    str(path.relative_to(ROOT)),
                "kind":    kind,
                "name":    m.group(1),
                "line":    lineno + 1,
                "context": context[:300],
            })

    return symbols


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    index = []

    for root in CODE_ROOTS:
        if not root.exists(): continue
        for ext in [".py", ".ts", ".tsx"]:
            for f in root.rglob(f"*{ext}"):
                index.extend(extract_symbols(f))

    OUT.write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"code.index.json: {len(index)} symbols")


if __name__ == "__main__":
    main()
