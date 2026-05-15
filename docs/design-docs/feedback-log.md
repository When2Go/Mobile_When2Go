# 피드백 루프 기록

> `harness-feedback` 스킬 + `/gc` 커맨드가 자동 기록.

| 날짜 | 문제 패턴 | 적용 레벨 | 변경 내용 | 관련 이슈 |
|------|----------|----------|----------|----------|
| 2026-05-15 | 하드코딩 색상(`#f59e0b` 등) + 매직 사이즈(`size={18}`) — PR#33 초안, PR#37 1차 커밋에서 동일 재발 후 2차 커밋(0828fc1)에서 자체 교정. 2회 누적 | **Level 2** (ESLint 룰 추가) | `eslint.config.js`에 `no-restricted-syntax` 2개 추가: ① JSX color/fill prop 16진수 리터럴 차단 → `PALETTE.*` 강제 ② JSX `size` prop 숫자 리터럴 차단 → `ICON_SIZE.*` 또는 파일 상단 const 강제 | #10 |
