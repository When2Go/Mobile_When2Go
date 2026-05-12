# 지금 나가? (When2Go)

실시간 출발 타이밍 판단 모바일 앱. 도착 시간 입력 → 출발 시간 역산 → 단계별 알림.

## 내 역할

**프론트엔드 전담** (React Native + Expo). 백엔드는 별도 레포 — 관련 코드 작성 금지.

## 기술 스택

React Native + Expo (TypeScript) / Expo Router / NativeWind / Zustand / lucide-react-native

## 핵심 컨벤션

1. **스타일**: NativeWind 시맨틱 토큰만 사용. 하드코딩 색상값(`#2563eb`, `style={{color:...}}`) 금지.
2. **다크모드**: 모든 화면에 `isDark` 조건부 클래스 필수. 누락 시 QA 반려.
3. **상수**: 숫자 리터럴 직접 사용 금지. `constants/` 또는 파일 상단에 상수명 선언.
4. **훅**: 도메인별 분리 (`hooks/trip/`, `hooks/route/`). 로직 종류 기준 혼합 금지.
5. **ODsay**: 프론트 직접 호출 금지. Spring Boot 프록시를 통해서만.
6. **UI 시안 참조**: 화면·컴포넌트 구현 시 상위 폴더 `../design/`(Vite HTML 시안)을 1차 자료로 삼는다. 시안과 다르게 구현하려면 PR 본문에 사유 명시.
7. **PRD 동기화**: `../PRD_지금나가_v1.1.md` 변경 시 `docs/references/PRD-지금나가-v1.1.md`도 같이 갱신. 레포 안이 단일 진실 원천이 되도록.
8. **TDD 적용 범위**: 비즈니스 로직(`src/utils/` 계산, `src/stores/` Zustand 액션, `src/hooks/` 분기·계산 있는 훅)은 **테스트 먼저 작성**. 단순 wrapper·외부 SDK 어댑터(`src/api/`)·trivial getter는 예외. UI(`src/components/`, `app/`, 애니메이션)는 TDD 비대상.
9. **테스트 1회 원칙**: TDD로 만든 테스트가 곧 영구 자산. PR 직전에 같은 동작에 대한 테스트를 새로 만들지 않는다(중복 금지). `/review`는 "테스트 누락 여부 확인 + 전체 통과"만 체크.
10. **광고 슬롯**: 모든 광고 영역(F-AD01 배너, F-AD04 스플래시, Trip 완료 광고 등)은 빈 placeholder 컴포넌트(`AdSlot`)로만 구현. 실제 광고 SDK(GoogleAds 등) 연동은 **앱 심사 통과 후** 별도 이슈로 분리. 상세: `docs/FRONTEND.md`.

상세: `docs/FRONTEND.md` / `docs/DESIGN.md` / `docs/frontend-code-quality.md`

## 에이전트 / 스킬 구조

> 구조 패턴: **파이프라인 + 생성-검증 혼합** — `when2go-ui`/`when2go-logic`이 작성 → `when2go-qa`가 별도 컨텍스트로 검증.

```
.claude/agents/
  when2go-ui      — 화면 컴포넌트, 스타일, 애니메이션
  when2go-logic   — API, Zustand, 커스텀 훅, 비즈니스 로직
  when2go-qa      — 코드 리뷰 (별도 컨텍스트로만 실행)

.claude/skills/
  github-issue-work   — "issue #숫자" 트리거
  github-issue-create — "이슈 만들어줘" 트리거
  harness-feedback    — 반복 위반 패턴 감지 시 자동 제안

.claude/commands/
  /review   — QA 리뷰 (별도 세션)
  /gc       — 가비지 컬렉션
  /health   — 하네스 건강 점검
  /quality  — 품질 등급 재평가

.github/ISSUE_TEMPLATE/
  feature.md   — 신규 기능 (PRD ID 필수)
  bug.md       — 버그 리포트
  design.md    — 디자인 작업
  refactor.md  — 리팩터링
  test.md      — 테스트 작업
  chore.md     — 설정 · 의존성 · 잡무

.github/pull_request_template.md  — PR 본문 기본 양식
```

## GitHub 이슈 워크플로우

- 모든 작업은 GitHub 이슈 기반 — `.github/ISSUE_TEMPLATE/`의 6종 템플릿 중 선택
- 작업 시작: `issue #번호 작업해줘`
- 이슈 생성: `이슈 만들어줘` (스킬이 적합한 템플릿을 골라 채움)
- 브랜치: `feat/issue-{설명}#{번호}`
- **exec-plan 라이프사이클**: 작업 전 `docs/exec-plans/{날짜}-issue-{번호}.md` 작성 → 작업은 이 plan을 1차 참조 → PR Approve 시점에 plan 삭제 후 머지. approve 전 삭제 금지
- PR: `.github/pull_request_template.md` 양식, Squash and Merge

## 자동 교정 루프

PostToolUse Hook이 `.ts/.tsx` 저장 시 자동으로 ESLint fix + TypeScript check 실행.
에러 발생 시 에이전트가 스스로 수정 → 재저장 반복.

## 빌드/테스트 정책

- **OS별 default**:
  - macOS (l2juhan) → `npx expo run:ios` (iOS 시뮬레이터)
  - Windows (kangwook-kim02) → `npx expo run:android` (Android 에뮬레이터, Android Studio 필요)
- **PR 검증 분업**: 한 PR을 두 OS에서 모두 검증한다. 작성자는 자기 OS, 리뷰어는 반대 OS로 돌려본다. 한쪽만 OK는 [WARNING], 양쪽 OK여야 머지
- **자동 트리거**: 네이티브 모듈(Expo 모듈, `@react-native-*`, `react-native-*`)이 추가되면 커밋 후 호스트 OS에 맞는 `npx expo run:ios` 또는 `npx expo run:android`를 `run_in_background`로 자동 실행. JS-only 패키지(zustand, dayjs 등)는 제외
- **EAS 실기기 빌드** (`eas build --profile development --platform <ios|android>`)는 자동 트리거 X. 푸시·백그라운드 위치·OS 보안 등 에뮬레이터 재현 불가 동작 또는 사용자 명시 요청 시에만
- 사용자가 "빌드하지 마" 명시 시 자동 실행 X

## 단위 테스트

- **언제 작성**: 로직 영역은 코드 작성 전(TDD). `when2go-logic` 에이전트의 "테스트 작성 규칙" 참조
- **어떻게 작성**: `docs/TESTING.md` 4축(정상·경계·분기·에러) 기준
- **로컬 강제**: `/review` 단계 5에서 `npm test` 실행. 신규 로직에 테스트 누락 시 [CRITICAL]
- **원격 강제**: `.github/workflows/test.yml`이 push/PR 시 자동 실행. 실패 시 머지 차단
- **PR 체크**: `.github/pull_request_template.md`에 테스트 통과·누락 없음 체크박스

## docs/ 경로

- `docs/FRONTEND.md` — 코드 컨벤션
- `docs/DESIGN.md` — 디자인 시스템
- `docs/QUALITY_SCORE.md` — 품질 등급 추적
- `docs/design-docs/core-beliefs.md` — 프로젝트 설계 철학
- `docs/design-docs/feedback-log.md` — 피드백 루프 기록
- `docs/generated/component-inventory.md` — 컴포넌트 목록 (자동 생성)
- `docs/exec-plans/` — 이슈별 작업 계획 (자동 생성, PR Approve 후 삭제)
- `docs/references/PRD-지금나가-v1.1.md` — 상위 폴더 PRD 사본 (변경 시 양쪽 동기화)
- `docs/TESTING.md` — 단위 테스트 가이드 (대상·예시·우선순위)
- `docs/DEPLOY.md` — EAS Build / TestFlight / Play 배포 가이드
- `docs/frontend-code-quality.md` — 가독성/예측성/응집도/결합도 품질 기준
- `docs/folder-structure.md` — 확정 폴더 구조

현재 작업: `docs/exec-plans/` 참조
