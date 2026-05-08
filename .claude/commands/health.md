# /health — 하네스 건강 점검 워크플로우

하네스 자체가 올바르게 동작하는지 점검.

---

## 점검 항목

1. `docs/generated/component-inventory.md` ↔ 실제 `src/components/` 파일 일치 여부
2. `docs/FRONTEND.md` 규칙 ↔ `.eslintrc.js` 규칙 일치 여부
   - 문서에만 있고 ESLint 규칙 없는 것 → Level 2 승격 제안
   - ESLint 교정 지시가 불충분한 것 → Level 2.5 업데이트 제안
3. `docs/DESIGN.md` 토큰 ↔ `src/constants/colors.ts` + `tailwind.config.js` 일치 여부
4. PostToolUse Hook 설정 정상 동작 확인
5. `.github/ISSUE_TEMPLATE/` 파일 존재 확인
6. `docs/QUALITY_SCORE.md` 업데이트
7. `docs/design-docs/feedback-log.md` 요약 출력
