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

상세: `docs/FRONTEND.md` / `docs/DESIGN.md` / `frontend-code-quality.md`

## 에이전트 / 스킬 구조

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
- 브랜치: `feat/issue-{설명}-#{번호}`
- PR: `.github/pull_request_template.md` 양식, Squash and Merge

## 자동 교정 루프

PostToolUse Hook이 `.ts/.tsx` 저장 시 자동으로 ESLint fix + TypeScript check 실행.
에러 발생 시 에이전트가 스스로 수정 → 재저장 반복.

## docs/ 경로

- `docs/FRONTEND.md` — 코드 컨벤션
- `docs/DESIGN.md` — 디자인 시스템
- `docs/QUALITY_SCORE.md` — 품질 등급 추적
- `docs/design-docs/core-beliefs.md` — 프로젝트 설계 철학
- `docs/design-docs/feedback-log.md` — 피드백 루프 기록
- `docs/generated/component-inventory.md` — 컴포넌트 목록 (자동 생성)
- `docs/exec-plans/` — 이슈별 작업 계획 (자동 생성)
- `frontend-code-quality.md` — 가독성/예측성/응집도/결합도 품질 기준
- `folder-structure.md` — 확정 폴더 구조

현재 작업: `docs/exec-plans/` 참조
