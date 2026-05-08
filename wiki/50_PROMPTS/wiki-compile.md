# /wiki-compile

raw/ 소스 또는 draft 페이지를 완성된 wiki 페이지로 컴파일한다.

## 입력

- `raw/` 파일 경로 또는 `wiki/` draft 페이지

## 절차

1. 소스 전체 읽기
2. 핵심 개념 추출 (방제·약재·혈위·근육·신경·자율신경 패턴)
3. 기존 wiki 페이지 검색 → 중복 확인
4. 판단:
   - 기존 페이지 업데이트 / 신규 페이지 생성 / 관계만 추가
5. YAML frontmatter 작성 (id, slug, category, priority 포함)
6. Obsidian [[wikilink]] 사용
7. 소스 사실 / 사용자 해석 / 가설 / 연구 공백 분리

## 출력 구조

```markdown
---
id:
slug:
title:
category: concepts | entities | sources
tags:
created:
updated:
clinical_priority: 1-5
research_priority: 1-5
foundational_priority: 1-5
review_status: draft
---

## 핵심 정의

## 원문/근거

## 임상 패턴

## 현대 생리학적 해석

## Neuro-Fascial ANS Framework

## 감별점

## Research Gaps

## Related
```

## 주의

- `raw/` 파일 수정 금지
- generated/ 출력을 source of truth로 취급 금지
- 불확실한 cross-domain 연결은 confidence 명시
