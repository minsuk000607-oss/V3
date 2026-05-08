#!/usr/bin/env python3
"""wiki/ 문서에서 KG 노드·엣지 후보를 구조적으로 추출. LLM 없음.
frontmatter + wikilink + heading 기반 1차 추출.
출력: generated/index/graph.index.json

graph.py의 site/public/graph.json과 다름:
- graph.py: Next.js 그래프 시각화용 (렌더링)
- graphify.py: Claude Code/Codex가 KG 갱신 시 참조하는 구조적 인덱스
"""
import re, json, yaml
from pathlib import Path

WIKI_ROOT = Path(__file__).parent.parent / "wiki"
OUT       = Path(__file__).parent.parent / "generated" / "index" / "graph.index.json"
SKIP_DIRS = {"50_PROMPTS", "90_LOGS"}
FM_RE     = re.compile(r"^---\n(.*?)\n---", re.DOTALL)
WIKILINK  = re.compile(r"\[\[([^\]|]+)(?:\|[^\]]+)?\]\]")
HEAD_RE   = re.compile(r"^#{1,3}\s+(.+)$", re.MULTILINE)


def parse_fm(text: str) -> dict:
    m = FM_RE.match(text)
    if not m: return {}
    try: return yaml.safe_load(m.group(1)) or {}
    except: return {}


def main():
    nodes, edges = [], []
    slug_map: dict[str, str] = {}   # 모든 식별자 → id

    mds = [f for f in WIKI_ROOT.rglob("*.md")
           if f.relative_to(WIKI_ROOT).parts[0] not in SKIP_DIRS]

    # 1차: 노드 수집 + slug_map 구성
    for md in mds:
        text = md.read_text(encoding="utf-8")
        fm   = parse_fm(text)
        slug = fm.get("slug") or md.stem
        nid  = fm.get("id")   or slug

        slug_map[slug.lower()] = nid
        slug_map[str(fm.get("title","")).lower()] = nid
        for a in fm.get("aliases") or []:
            slug_map[str(a).lower()] = nid

        # 주요 헤딩도 노드 후보로 등록
        headings = HEAD_RE.findall(FM_RE.sub("", text))

        nodes.append({
            "id":       nid,
            "slug":     slug,
            "title":    fm.get("title") or slug,
            "category": fm.get("category") or md.relative_to(WIKI_ROOT).parts[0].lower(),
            "tags":     fm.get("tags") or [],
            "aliases":  fm.get("aliases") or [],
            "headings": headings[:10],
            "priorities": {
                "clinical":     fm.get("clinical_priority", 3),
                "research":     fm.get("research_priority", 3),
                "foundational": fm.get("foundational_priority", 3),
            },
        })

    # 2차: 엣지 수집
    for md in mds:
        text   = md.read_text(encoding="utf-8")
        fm     = parse_fm(text)
        src_id = fm.get("id") or fm.get("slug") or md.stem

        seen = set()
        for m in WIKILINK.finditer(FM_RE.sub("", text)):
            tgt = m.group(1).strip().lower()
            tgt_id = slug_map.get(tgt)
            if tgt_id and tgt_id != src_id and tgt_id not in seen:
                edges.append({"source": src_id, "target": tgt_id, "type": "wikilink"})
                seen.add(tgt_id)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"nodes": nodes, "edges": edges}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"graph.index.json: {len(nodes)} nodes, {len(edges)} edges")


if __name__ == "__main__":
    main()
