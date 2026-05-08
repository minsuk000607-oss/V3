# Kim Minseok LLM Wiki

Obsidian-powered, LLM-compiled knowledge base. Korean medicine + neuroscience + fascia.

## 배포: Railway

> `scripts/init-volume.py` — 현재 미사용 (Git 기반 운영 중. Railway Volume 추가 시 활성화)

### 환경변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `ANTHROPIC_API_KEY` | ✅ | /admin ingest 기능 |
| `PUBMED_API_KEY` | 선택 | 없으면 rate limit만 낮아짐 |

### Railway 설정

| 항목 | 값 |
|------|-----|
| Build Command | `pip install -r scripts/requirements.txt && python scripts/graphify.py && python scripts/jdocmunch.py && python scripts/jcodemunch.py && python scripts/graph.py && cd site && npm ci && npm run build` |
| Start Command | `cd site && npm start` |

### Cron (논문 자동업데이트)

Railway → New Service → Cron:
- Command: `python scripts/pubmed.py`
- Schedule: `0 9 * * 1` (매주 월요일 오전 9시)

---

## 로컬 실행

```bash
pip install -r scripts/requirements.txt
python scripts/graph.py
cd site && npm install && npm run dev
```

---

## 폴더 구조

```
wiki/
  concepts/     # 개념 페이지
  entities/     # 약재·혈위·근육·신경
  sources/      # 논문·강의 요약
  00_CORE/      # 시스템 페이지
raw/            # 원본 소스 (수정 금지)
generated/      # AI 생성 블록 JSON
scripts/        # 자동화 파이프라인
site/           # Next.js 웹앱
```

## 웹 Ingest

배포 후 `/admin` → 텍스트 붙여넣기 → `⚡ Ingest`

> 참고: /admin에서 생성된 파일은 git push 전까지 배포에 반영 안 됨.
> 생성된 마크다운을 복사해서 `wiki/` 에 커밋하면 영구 반영됨.
