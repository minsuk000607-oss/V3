# AGENTS.md

You are operating inside Kim Minseok's LLM Wiki OS.

Obsidian-powered, markdown-first, LLM-compiled knowledge base.  
Deployable as a Next.js site on **Railway**.

## Purpose

Build a second brain that preserves and extends 김민석's academic, clinical, and creative reasoning.

Focus areas: Korean medicine · Shanghanlun six-channel theory · formulas & herbs ·
acupoints & meridians · MPS/IMS · fascia & Anatomy Trains · ANS · neurophysiology · clinical reasoning

## Directory rules

| Directory | Purpose |
|---|---|
| `raw/` | Source material. **Never modify.** |
| `wiki/concepts/` | Compiled concept pages |
| `wiki/entities/` | Entities: herbs, acupoints, muscles, nerves |
| `wiki/sources/` | Paper summaries, lecture notes |
| `wiki/00_CORE/` | System identity pages |
| `generated/` | AI-derived blocks (insights, papers, relations JSON) |
| `scripts/` | Automation: ingest.py · pubmed.py · graph.py |
| `site/` | Next.js website |

## Pipeline

```
raw/ ──ingest.py──▶ wiki/sources/
PubMed ─pubmed.py─▶ wiki/sources/
wiki/ ──graph.py──▶ site/public/graph.json (빌드 시 자동)
```

## Source hierarchy (for answering/compiling)

1. User-provided corrections
2. `raw/` source files
3. `wiki/` files
4. `generated/` files
5. External general knowledge

## Core behavior

- Structure first. Separate source facts from interpretation.
- Separate KM concepts from biomedical mapping.
- Use confidence levels for cross-domain links.
- Prefer markdown with YAML frontmatter.
- Use Obsidian [[wikilinks]].
- Preserve immutable IDs.

## Operation modes

| Mode | Purpose |
|---|---|
| `/wiki-ingest` | raw 소스 → wiki 페이지 |
| `/wiki-compile` | draft → 완성 페이지 |
| `/wiki-lint` | 일관성·broken link·중복 검사 |
| `/wiki-query` | wiki 기반 질의응답 |
| `/site-build` | Next.js 사이트 수정 |

## Output language

Korean for prose. English for code, schema, filenames, APIs.

## Document identity (required frontmatter)

```yaml
id: FML-00001
slug: oryeongsan
title: 오령산
aliases:
  - 五苓散
category: concepts
tags:
  - 수습
created: 2026-05-08
updated: 2026-05-08
clinical_priority: 5
research_priority: 4
foundational_priority: 5
review_status: draft
```

## Deployment

- **Platform:** Railway
- **Build:** `pip install -r scripts/requirements.txt && python scripts/graph.py && cd site && npm install && npm run build`
- **Start:** `cd site && npm start`
- **Cron (논문 자동업데이트):** `python scripts/pubmed.py` — Railway Cron Service로 주 1회 실행

---

## 코딩 행동 지침

본 지침은 속도보다 신중함에 우선순위를 둔다. 사소한 작업은 상황에 맞게 판단한다.

### 1. 구현 전 사고

- 자신의 가정을 명시적으로 기술한다. 불확실한 경우 질문한다.
- 해석의 여지가 여러 가지라면 임의로 선택하지 말고 대안들을 제시한다.
- 더 간단한 접근 방식이 있다면 제안한다.
- 불분명한 부분이 있다면 작업을 중단하고 구체적으로 질문한다.

### 2. 단순성 우선

- 문제를 해결하는 최소한의 코드만 작성한다.
- 요청되지 않은 기능은 추가하지 않는다.
- 200줄을 50줄로 줄일 수 있다면 다시 작성한다.
- "시니어 엔지니어가 보기에 이 코드가 지나치게 복잡한가?" 그렇다면 단순화한다.

### 3. 정밀한 수정

- 인접한 코드, 주석, 포맷을 임의로 개선하지 않는다.
- 망가지지 않은 부분을 리팩토링하지 않는다.
- 본인의 수정으로 인해 불필요해진 임포트·변수·함수는 제거한다.
- 변경된 모든 라인은 요청사항과 직접적으로 연결되어야 한다.

### 4. 목표 중심 실행

작업을 검증 가능한 목표로 변환한다:
- "버그 수정" → "버그를 재현하는 테스트 작성 후 통과 확인"
- "X 리팩토링" → "리팩토링 전후 테스트 통과 확인"

다단계 작업은 간략한 계획 수립 후 단계별 검증한다.

---

## 로컬 사전 생성 워크플로 (Railway 빌드 전)

Railway는 배포·렌더링만 담당. 무거운 인덱싱은 로컬에서 사전 실행 후 git push.

```bash
# 1차 추출 (LLM 없음 — 빠름)
python scripts/jdocmunch.py   # wiki/ → generated/index/docs.index.json
python scripts/jcodemunch.py  # 코드 심볼 → generated/index/code.index.json
python scripts/graphify.py    # KG 후보 → generated/index/graph.index.json
python scripts/graph.py       # 위키링크 → site/public/graph.json

# 2차 추론 (LLM 사용 — raw 소스 있을 때만)
python scripts/ingest.py      # raw/ → wiki/sources/

# 배포
git add . && git commit -m "update index" && git push
```

## 파이프라인 역할 분리

| 스크립트 | LLM | 역할 | 실행 위치 |
|---------|-----|------|---------|
| `jdocmunch.py` | ❌ | md 섹션 인덱싱 | 로컬 |
| `jcodemunch.py` | ❌ | 코드 심볼 인덱싱 | 로컬 |
| `graphify.py` | ❌ | KG 노드·엣지 후보 | 로컬 |
| `graph.py` | ❌ | 사이트용 graph.json | Railway 빌드 |
| `ingest.py` | ✅ | raw → wiki 변환 | 로컬 |
| `pubmed.py` | ❌ | 논문 자동수집 | Railway Cron |
