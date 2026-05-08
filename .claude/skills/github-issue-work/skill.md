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
7. PR 생성 — 이슈 close는 하지 않음 (PR Squash Merge 시 자동 close)
8. **PR Approve 후 exec-plan 정리** — 리뷰어 approve가 떨어지면 해당 exec-plan 파일을 삭제 후 같은 PR에 포함:
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

## 범위 밖

- 백엔드 레이블 이슈 처리 거부 (별도 레포)
- 이슈 직접 close 금지
