#!/usr/bin/env python3
"""raw/ 소스 파일 → Claude API → wiki/sources/ 마크다운.
수동 실행: python scripts/ingest.py [파일경로]"""
import os, sys
from pathlib import Path
import anthropic

RAW_ROOT     = Path(__file__).parent.parent / "raw"
WIKI_SOURCES = Path(__file__).parent.parent / "wiki" / "sources"
PROCESSED    = Path(__file__).parent.parent / "rag" / "source-cache" / "processed.txt"

client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

SYSTEM = """You are a Korean medicine knowledge compiler (김민석 LLM Wiki OS).
Convert raw source into a structured wiki markdown page.
Output ONLY the markdown. No explanation.

Required frontmatter:
---
id: SRC-{unique_5_digit}
slug: {kebab-case}
title: {Korean title}
category: sources
tags: [relevant tags in Korean]
created: {today YYYY-MM-DD}
updated: {today YYYY-MM-DD}
clinical_priority: 1-5
research_priority: 1-5
foundational_priority: 1-5
review_status: draft
---

Content rules:
- Korean for prose, English for technical terms
- Use Obsidian [[wikilinks]] for concepts
- Sections: ## 핵심 내용 / ## 임상 적용 / ## 현대 생리학적 해석 / ## Related
- Separate source facts from interpretation"""

def ingest(path: Path) -> str:
    text = path.read_text(encoding="utf-8", errors="ignore")[:8000]
    msg = client.messages.create(
        model="claude-opus-4-5",
        max_tokens=2000,
        system=SYSTEM,
        messages=[{"role": "user", "content": f"Source: {path.name}\n\n{text}"}],
    )
    return msg.content[0].text

def main():
    WIKI_SOURCES.mkdir(parents=True, exist_ok=True)
    PROCESSED.parent.mkdir(parents=True, exist_ok=True)

    processed = set(PROCESSED.read_text().splitlines()) if PROCESSED.exists() else set()

    # 특정 파일 지정 or raw/ 전체
    targets = [Path(sys.argv[1])] if len(sys.argv) > 1 else [
        f for f in RAW_ROOT.rglob("*")
        if f.is_file() and f.suffix in {".md", ".txt"} and str(f) not in processed
    ]

    for src in targets:
        print(f"ingesting: {src.name}")
        md  = ingest(src)
        out = WIKI_SOURCES / f"{src.stem}.md"
        out.write_text(md, encoding="utf-8")
        with open(PROCESSED, "a") as f:
            f.write(str(src) + "\n")
        print(f"  → {out.name}")

if __name__ == "__main__":
    main()
