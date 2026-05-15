# 피드백 루프 기록

> `harness-feedback` 스킬 + `/gc` 커맨드가 자동 기록.

| 날짜 | 문제 패턴 | 적용 레벨 | 변경 내용 | 관련 이슈 |
|------|----------|----------|----------|----------|
| 2026-05-15 | 하드코딩 색상(`#f59e0b` 등) + 매직 사이즈(`size={18}`) — PR#33 초안, PR#37 1차 커밋에서 동일 재발 후 2차 커밋(0828fc1)에서 자체 교정. 2회 누적 | **Level 2** (ESLint 룰 추가) | `eslint.config.js`에 `no-restricted-syntax` 2개 추가: ① JSX color/fill prop 16진수 리터럴 차단 → `PALETTE.*` 강제 ② JSX `size` prop 숫자 리터럴 차단 → `ICON_SIZE.*` 또는 파일 상단 const 강제 | #10 |
| 2026-05-14 | 시뮬레이터 자동 트리거 누락 — `xcrun simctl boot` 단계 없이 `expo start`만 띄움 | Level 1 (문서) | CLAUDE.md 빌드/테스트 정책 + feedback_real_device_testing 메모리에 부팅 단계·기본 디바이스(iPhone 16 Pro iOS 18.6) 명시 | PR #33 |
| 2026-05-14 | PR 생성 시 라벨 누락 | Level 1 (문서) | github-issue-work 스킬 단계 8에 이슈 라벨 승계 규칙 추가 | PR #33 |