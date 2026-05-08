# /wiki-ingest

raw/ 소스를 wiki 지식으로 수집한다.

## 입력 소스

- raw 강의 노트, 논문 요약, YouTube transcript, 대화 로그, OCR 텍스트

## 절차

1. raw 소스 읽기
2. 핵심 개념 추출 (방제·약재·혈위·근육·신경·자율신경 패턴·임상 패턴·연구 주장)
3. 기존 wiki 페이지 검색
4. 판단: 기존 업데이트 / 신규 생성 / 관계만 추가 / research gap 기록
5. YAML frontmatter 포함
6. Obsidian [[wikilink]] 사용
7. 소스 사실 / 사용자 해석 / 가설 / 연구 공백 분리
8. `raw/` 수정 금지

## 신규 페이지 frontmatter

```yaml
id:
slug:
title:
aliases:
  -
category:
tags:
  -
created:
updated:
clinical_priority:
research_priority:
foundational_priority:
review_status: draft
```

## 출력 구조

## 핵심 내용 / ## 임상 적용 / ## 현대 생리학적 해석 / ## Related
