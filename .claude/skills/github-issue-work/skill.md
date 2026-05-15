---
name: github-issue-work
description: "GitHub 이슈를 받아서 코드 작업·PR까지 끝내는 워크플로우. '#숫자', 'issue 42', '이슈 12 작업해줘', '깃허브 이슈로 받아둔 거 진행', '#15 끝내줘' 등 이슈 번호가 언급되거나 이슈 기반으로 작업하라는 요청이면 반드시 이 스킬을 사용할 것. 이슈 조회 → exec-plan 작성 → 브랜치 생성 → 에이전트 위임 → PR 생성 → Approve 후 plan 삭제까지 전체 라이프사이클을 관리한다."
---

# github-issue-work

> 트리거: "issue #숫자", "이슈 #숫자", "#숫자 작업해줘", "#숫자 해줘", "깃허브 이슈"

---

## 워크플로우

1. `gh issue view {번호} --json title,body,labels,assignees,milestone` 로 이슈 조회
2. 이슈 내용 분석 → 작업 유형 판단 (feature / bug / design / refactor / test / chore)
3. **작업 전 계획 문서화** — `docs/exec-plans/{날짜}-issue-{번호}.md` 생성:
   - 원본 이슈 URL, Labels, PRD ID (있으면)
   - 목표 (이슈 본문에서 추출)
   - 관련 파일 (docs/folder-structure.md 기반으로 파악)
   - 작업 분해 체크리스트
   - 완료 기준
4. 작업 유형에 맞는 에이전트 연계 — **모든 작업은 위 exec-plan을 1차 참조 자료로 진행**:
   - UI/스타일/애니메이션 → when2go-ui
   - API/훅/스토어/로직 → when2go-logic
   - 두 영역 혼합 → ui + logic 순서로
5. 작업 시작 전 이슈 코멘트: `gh issue comment {번호} --body "🚀 작업 시작: {제목}"`
6. 작업 완료 후 이슈 코멘트 (변경 파일 목록 + 요약)
7. **자동 코드리뷰** — `Agent` 툴로 `when2go-qa` 서브에이전트를 **새 컨텍스트**에서 spawn해 Full 모드 리뷰 실행:
   - 전달 정보: 브랜치명, 변경 파일 목록(`git diff --name-only main...HEAD`), exec-plan 경로(`docs/exec-plans/{날짜}-issue-{번호}.md`), 이슈 번호
   - 지시: `.claude/commands/review.md`의 체크 항목(Hook 통과·코드 품질·디자인 시스템·반복 패턴·테스트) 전부 검사 후 [CRITICAL]/[WARNING]/[INFO]/[PASS] 분류 리포트 반환
   - 결과 처리:
     - **[CRITICAL] 0건** → 8번(PR 생성)으로 진행. [WARNING]/[INFO]는 PR 본문 하단 `## 자동 리뷰 결과` 섹션에 첨부
     - **[CRITICAL] 발생** → 메인 에이전트가 ui/logic 서브에이전트를 다시 호출해 수정 → 7번 재실행 (**최대 2회**, when2go-qa 자체 재시도 정책과 일치)
     - **2회 후에도 [CRITICAL] 잔존** → PR 생성 중단. 리포트를 사용자에게 제출하고 판단 요청
   - 사용자가 명시적으로 "리뷰 건너뛰기" / "리뷰 없이 PR 생성" 요청한 경우만 7번 생략. 수동 `/review`는 별개 — 자동 리뷰가 통과해도 PR 직전 추가로 돌리고 싶으면 사용자가 수동 호출 가능
8. PR 생성 — 이슈 close는 하지 않음 (PR Squash Merge 시 자동 close). PR 본문 하단에 자동 리뷰 결과 첨부
   - **base 브랜치는 `develop`** (main은 배포 전용). `gh pr create --base develop ...`
   - **PR 라벨은 원본 이슈의 라벨을 그대로 승계한다.** 1번에서 받은 `labels` 배열을 `--label` 옵션으로 모두 전달:
     - 예: 이슈 라벨이 `design`, `ui`면 `gh pr create --base develop --label design --label ui --title ... --body ...`
     - 이슈에 PRD 관련 라벨(`F-M01` 등)이 있으면 PR에도 같이 부여
     - 누락 시 사후 `gh pr edit <num> --add-label <라벨1> --add-label <라벨2>`로 보정. 라벨 없는 PR을 머지하지 않는다
   - **PR 본문은 `docs/PR-writing-guide.md` 규칙을 반드시 따른다**:
     - 맨 위에 한 줄 요약
     - 변경 사항은 라이브러리 이름 나열 대신 "무엇을 / 왜 / 어떻게 쓰는지" 순으로 평이한 한국어
     - "직접 확인하는 법" 섹션 포함 (실행 명령 + 체크 항목)
     - 자동 리뷰 결과는 표로 정리
     - 작성 후 가이드 하단의 톤 체크리스트로 자가 점검
9. **PR Approve 후 exec-plan 정리** — 리뷰어 approve가 떨어지면 해당 exec-plan 파일을 삭제 후 같은 PR에 포함:
   - `git rm docs/exec-plans/{날짜}-issue-{번호}.md`
   - 머지 전에 정리해 `docs/exec-plans/`에는 **현재 진행 중인 이슈만** 남도록 유지
   - approve 전엔 절대 삭제 금지 (리뷰어가 계획 ↔ 결과를 대조해야 하므로)

## 브랜치 생성 규칙

```
형식: feat/issue-{짧은설명}-#{번호}
예시: feat/issue-home-map#34
      fix/issue-trip-calc-error#42
      design/issue-bottom-sheet#17
```

## 참조 문서

- `docs/FRONTEND.md` — 코드 컨벤션
- `docs/DESIGN.md` — 디자인 시스템
- `docs/frontend-code-quality.md` — 코드 품질 기준
- `docs/folder-structure.md` — 파일 위치 기준
- `docs/PR-writing-guide.md` — PR 본문 작성 톤·구조 가이드

## 범위 밖

- 백엔드 레이블 이슈 처리 거부 (별도 레포)
- 이슈 직접 close 금지
