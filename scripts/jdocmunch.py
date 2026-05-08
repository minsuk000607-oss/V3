#!/usr/bin/env python3
"""wiki/ md → H1~H6 섹션 단위 인덱스 생성.
질문 시 전체 문서 대신 관련 섹션만 추출하기 위한 1차 구조 추출.
LLM 없음. 로컬 또는 CI에서 실행.

출력: generated/index/docs.index.json
"""
import re, json, yaml
from pathlib import Path
from datetime import date

WIKI_ROOT = Path(__file__).parent.parent / "wiki"
OUT       = Path(__file__).parent.parent / "generated" / "index" / "docs.index.json"
SKIP_DIRS = {"50_PROMPTS", "90_LOGS"}
FM_RE     = re.compile(r"^---\n(.*?)\n---", re.DOTALL)
HEAD_RE   = re.compile(r"^(#{1,6})\s+(.+)$", re.MULTILINE)


def parse_fm(text: str) -> dict:
    m = FM_RE.match(text)
    if not m: return {}
    try: return yaml.safe_load(m.group(1)) or {}
    except: return {}


def split_sections(content: str) -> list[dict]:
    """H1~H6 기준으로 섹션 분리. 각 섹션 = {level, heading, body}"""
    matches = list(HEAD_RE.finditer(content))
    sections = []
    for i, m in enumerate(matches):
        level   = len(m.group(1))
        heading = m.group(2).strip()
        start   = m.end()
        end     = matches[i + 1].start() if i + 1 < len(matches) else len(content)
        body    = content[start:end].strip()
        sections.append({"level": level, "heading": heading, "body": body})
    return sections


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    index = []

    for md in WIKI_ROOT.rglob("*.md"):
        parts = md.relative_to(WIKI_ROOT).parts
        if parts[0] in SKIP_DIRS: continue

        text    = md.read_text(encoding="utf-8")
        fm      = parse_fm(text)
        content = FM_RE.sub("", text).strip()

        slug    = fm.get("slug") or md.stem
        doc_id  = fm.get("id")   or slug
        title   = fm.get("title") or slug
        tags    = fm.get("tags") or []
        cat     = fm.get("category") or parts[0].lower()

        # 섹션 없으면 전체를 하나로
        sections = split_sections(content) or [{"level": 1, "heading": title, "body": content}]

        for sec in sections:
            index.append({
                "doc_id":   doc_id,
                "slug":     slug,
                "title":    title,
                "category": cat,
                "tags":     tags,
                "section":  sec["heading"],
                "level":    sec["level"],
                "body":     sec["body"][:600],   # 검색용 excerpt (600자)
            })

    OUT.write_text(json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"docs.index.json: {len(index)} sections from {WIKI_ROOT}")


if __name__ == "__main__":
    main()
