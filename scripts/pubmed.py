#!/usr/bin/env python3
"""PubMed 자동 크롤 → wiki/sources/pubmed-{PMID}.md 생성.
Railway Cron Service로 주기 실행."""
import os, requests
from datetime import date, timedelta
from pathlib import Path

WIKI_SOURCES = Path(__file__).parent.parent / "wiki" / "sources"
API_KEY      = os.getenv("PUBMED_API_KEY", "")   # 없어도 동작 (rate limit만 낮아짐)
DAYS_BACK    = int(os.getenv("PUBMED_DAYS_BACK", "7"))

# AGENTS.md 키워드와 동기화
KEYWORDS = [
    "acupuncture autonomic nervous system",
    "meridian fascia myofascial",
    "IMS intramuscular stimulation",
    "Shanghanlun six channel theory",
    "Korean medicine herbal clinical trial",
    "trigger point neuroscience",
]

BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

def search_ids(query: str) -> list[str]:
    mindate = (date.today() - timedelta(days=DAYS_BACK)).strftime("%Y/%m/%d")
    r = requests.get(f"{BASE}/esearch.fcgi", params={
        "db": "pubmed", "term": query,
        "mindate": mindate, "datetype": "pdat",
        "retmax": 5, "retmode": "json", "api_key": API_KEY,
    }, timeout=10)
    return r.json().get("esearchresult", {}).get("idlist", [])

def fetch_summary(pmid: str) -> dict:
    r = requests.get(f"{BASE}/esummary.fcgi", params={
        "db": "pubmed", "id": pmid, "retmode": "json", "api_key": API_KEY,
    }, timeout=10)
    return r.json().get("result", {}).get(pmid, {})

def to_md(pmid: str, s: dict, query: str) -> str:
    authors = ", ".join(a.get("name","") for a in s.get("authors",[])[:3])
    if len(s.get("authors",[])) > 3: authors += " et al."
    doi = next((x.get("value","") for x in s.get("elocationid",[]) if x.get("eidtype")=="doi"), "")
    link = f"https://doi.org/{doi}" if doi else f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
    today = date.today().isoformat()
    title = s.get("title", pmid)

    return f"""---
id: PUB-{pmid}
slug: pubmed-{pmid}
title: "{title[:80].replace('"', "'")}"
category: sources
tags:
  - pubmed
  - auto-ingested
created: {today}
updated: {today}
research_priority: 3
review_status: auto
---

# {title}

**저널:** {s.get("source","")}  
**저자:** {authors}  
**출판일:** {s.get("pubdate","")}  
**링크:** {link}  
**검색어:** `{query}`

## 내용 요약

> 자동 수집. `/wiki-ingest` 로 내용 보강 필요.

## Research Gaps

- [ ] Abstract 전문 요약
- [ ] 기존 wiki 개념 cross-link 추가
"""

def main():
    WIKI_SOURCES.mkdir(parents=True, exist_ok=True)
    existing = {f.stem for f in WIKI_SOURCES.glob("pubmed-*.md")}
    new = 0

    for kw in KEYWORDS:
        for pmid in search_ids(kw):
            slug = f"pubmed-{pmid}"
            if slug in existing:
                continue
            s = fetch_summary(pmid)
            if not s: continue
            (WIKI_SOURCES / f"{slug}.md").write_text(to_md(pmid, s, kw), encoding="utf-8")
            existing.add(slug)
            new += 1
            print(f"  + {slug}: {s.get('title','')[:60]}")

    print(f"\n총 {new}개 논문 추가")

if __name__ == "__main__":
    main()
