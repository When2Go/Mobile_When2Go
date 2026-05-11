---
name: github-issue-create
description: "GitHub 이슈를 .github/ISSUE_TEMPLATE/ 6종(feature/bug/design/refactor/test/chore) 중 가장 적합한 템플릿으로 생성하는 스킬. '이슈 만들어줘', '이슈 생성', 'issue 만들어', '버그 리포트', '이슈화 해줘', '이슈로 등록' 등 새 이슈를 만들라는 요청이면 반드시 이 스킬을 사용할 것. 자체 포맷이 아닌 레포의 템플릿을 따르며, PRD ID·라벨도 자동 채움. 이미 있는 이슈를 작업하라는 요청(번호가 명시됨)은 github-issue-work를 쓸 것."
---

# github-issue-create

> 트리거: "이슈 만들어줘", "이슈 생성", "issue 만들어", "버그 리포트", "이슈화 해줘"

---

## 핵심 원칙

`.github/ISSUE_TEMPLATE/` 의 기존 템플릿을 반드시 따를 것. 자체 포맷 금지.

---

## 워크플로우

1. `.github/ISSUE_TEMPLATE/` 읽어서 사용 가능한 템플릿 파악
2. 사용자 설명 분석 → 적절한 템플릿 선택:
   - 새 기능 → feature.md
   - 버그 → bug.md
   - 화면/컴포넌트 디자인 → design.md
   - 코드 개선 → refactor.md
   - 테스트 추가 → test.md
   - 설정/도구 작업 → chore.md
3. 템플릿 형식에 맞춰 이슈 내용 작성
4. 생성 전 사용자에게 미리보기 확인
5. `gh issue create --title "{제목}" --body "{내용}" --label "{라벨}"`
6. PRD 기능 ID가 있으면 본문에 `PRD ID: F-M01` 형식으로 포함

## 이슈 제목 규칙

```
[Feature] 목적지 검색 화면 구현
[Bug] 출발 시간 계산 결과가 0으로 표시되는 문제
[Design] 홈 화면 바텀시트 레이아웃 수정
[Refactor] useSetupPage 훅 도메인별 분리
[Test] TripCard 컴포넌트 단위 테스트 추가
[Chore] ESLint 규칙 설정
```

## 범위 밖

- `.github/ISSUE_TEMPLATE/` 템플릿 자체 수정 금지
- 백엔드 이슈 생성 (별도 레포)
