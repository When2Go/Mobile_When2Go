# 피드백 루프 기록

> `harness-feedback` 스킬 + `/gc` 커맨드가 자동 기록.

| 날짜 | 문제 패턴 | 적용 레벨 | 변경 내용 | 관련 이슈 |
|------|----------|----------|----------|----------|
| 2026-05-14 | 시뮬레이터 자동 트리거 누락 — `xcrun simctl boot` 단계 없이 `expo start`만 띄움 | Level 1 (문서) | CLAUDE.md 빌드/테스트 정책 + feedback_real_device_testing 메모리에 부팅 단계·기본 디바이스(iPhone 16 Pro iOS 18.6) 명시 | PR #33 |
| 2026-05-14 | PR 생성 시 라벨 누락 | Level 1 (문서) | github-issue-work 스킬 단계 8에 이슈 라벨 승계 규칙 추가 | PR #33 |
| 2026-05-14 | `shadowColor: '#000'` 하드코딩 hex (SearchEntryBar) | Level 1 (문서) | PALETTE.zinc950 토큰 교체 + component-inventory 동기화 | /gc 2026-05-14 |
