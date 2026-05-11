<!--
  PR 본문 톤 가이드: docs/PR-writing-guide.md
  - 한 줄 요약 먼저 → 변경 사항은 "무엇을 / 왜 / 어떻게 쓰는지" 순
  - 라이브러리 이름 나열만 있는 줄 금지 (한 줄 풀이 필수)
  - 자동 리뷰 결과는 표로 정리
  - base 브랜치는 develop (main은 배포 전용)
-->

## 관련 이슈

closes #

## 한 줄 요약

<!-- 이 PR이 무엇을 하는지 한 문장 -->

## 변경 사항

<!-- 라이브러리 이름 나열 대신 "무엇을 / 왜 / 어떻게 쓰는지" 순으로 평이한 한국어 -->
- 

## 직접 확인하는 법

<!-- 실행 명령 + 리뷰어가 체크할 항목 -->
```bash
npm install
npx expo start
```

- [ ] 

## 테스트

- [ ] ESLint + TypeScript 에러 없음
- [ ] `npm test` 통과 — 신규 로직(`src/utils/`·`src/hooks/`·`src/stores/`)에 테스트 누락 없음 (`docs/TESTING.md` 4축 기준)
- [ ] Light / Dark 모드 확인
- [ ] 주요 플로우 직접 테스트

## 스크린샷 (UI 변경 시)

| Before | After |
|--------|-------|
|  |  |

## 리뷰어 참고사항

<!-- 리뷰어가 알아야 할 사항, 주의점 -->
