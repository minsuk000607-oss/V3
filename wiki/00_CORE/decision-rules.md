---
id: CORE-DECISION-RULES
slug: decision-rules
title: Decision Rules
category: CORE
tags: [decision-rules, source-hierarchy, core]
review_status: draft
evidence_status: reviewed
rag_check_frequency: manual
---

# Decision Rules

## 자료 판단 우선순위

1. 사용자가 직접 제공한 정오표와 수정사항
2. `raw/` 원자료
3. `wiki/`의 검토된 문서
4. 원문, 교과서, 논문, 공식 자료
5. `generated/`의 AI 파생 결과
6. 일반 지식

## 한의학 해석 규칙

- 원문과 방증을 먼저 본다.
- 병기 구조를 우선한다.
- 현대 생리학적 해석은 보조 해석으로 둔다.
- 전통 개념과 현대 개념을 혼동하지 않는다.
- 연결 가능성은 confidence 또는 hypothesis로 표시한다.
- 검증되지 않은 연결은 research gap으로 남긴다.

## AI 사용 규칙

- AI 생성물은 원문이 아니다.
- AI는 연결 후보와 구조화 초안을 제시한다.
- 최종 판단은 사용자가 한다.
- 불확실한 내용은 단정하지 않는다.
- 원문 markdown은 명시적 지시 없이 덮어쓰지 않는다.
- generated layer는 검토 전 파생물로 취급한다.

## 웹사이트 구현 규칙

- 최종 산출물은 Railway 배포 가능한 Next.js 웹사이트다.
- 운영 데이터는 GitHub 저장소의 `wiki/`와 `generated/`를 source of truth로 삼는다.
- 런타임 파일 쓰기에 의존하지 않는다.
- AI 생성물은 원문 아래 별도 블록으로 렌더링한다.
