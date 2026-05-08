#!/usr/bin/env python3
"""wiki/ → site/public/graph.json 생성. 빌드 시 자동 실행."""
import re, json, yaml
from pathlib import Path

WIKI_ROOT = Path(__file__).parent.parent / "wiki"
OUTPUT    = Path(__file__).parent.parent / "site" / "public" / "graph.json"

SKIP_DIRS  = {"50_PROMPTS", "90_LOGS"}
WIKILINK   = re.compile(r'\[\[([^\]|]+)(?:\|[^\]]+)?\]\]')
FRONTMATTER = re.compile(r'^---\n(.*?)\n---', re.DOTALL)

CATEGORY_COLORS = {
    "concepts":      "#60a5fa",
    "entities":      "#a78bfa",
    "sources":       "#34d399",
    "uncategorized": "#94a3b8",
}

def parse_fm(text: str) -> dict:
    m = FRONTMATTER.match(text)
    if not m: return {}
    try: return yaml.safe_load(m.group(1)) or {}
    except: return {}

def skip(md: Path) -> bool:
    return md.relative_to(WIKI_ROOT).parts[0] in SKIP_DIRS

def main():
    nodes, edges, slug_to_id = [], [], {}

    mds = [f for f in WIKI_ROOT.rglob("*.md") if not skip(f)]

    for md in mds:
        text = md.read_text(encoding="utf-8")
        fm   = parse_fm(text)
        slug = fm.get("slug") or md.stem
        nid  = fm.get("id")   or slug
        cat  = fm.get("category") or md.relative_to(WIKI_ROOT).parts[0].lower()

        slug_to_id[slug.lower()]                    = nid
        slug_to_id[str(fm.get("title","")).lower()] = nid
        for alias in fm.get("aliases") or []:
            slug_to_id[str(alias).lower()]          = nid

        nodes.append({
            "id":       nid,
            "slug":     slug,
            "title":    fm.get("title") or slug,
            "category": cat,
            "color":    CATEGORY_COLORS.get(cat, "#94a3b8"),
        })

    for md in mds:
        text   = md.read_text(encoding="utf-8")
        fm     = parse_fm(text)
        src_id = fm.get("id") or fm.get("slug") or md.stem

        for m in WIKILINK.finditer(text):
            tgt = slug_to_id.get(m.group(1).strip().lower())
            if tgt and tgt != src_id:
                edges.append({"source": src_id, "target": tgt})

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(
        json.dumps({"nodes": nodes, "edges": edges}, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )
    print(f"graph.json: {len(nodes)} nodes, {len(edges)} edges → {OUTPUT}")

if __name__ == "__main__":
    main()
