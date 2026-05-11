---
name: harness-feedback
description: "동일 위반 패턴이 반복 발생할 때 하네스 자체를 보강하는 스킬. '같은 실수가 반복돼', '하네스 보강해줘', '규칙 추가해줘', '피드백 루프', '에이전트가 자꾸 X를 빼먹어' 같은 메타 피드백이 나오거나, /review가 같은 패턴을 2회 이상 [WARNING]으로 잡거나, PostToolUse Hook이 같은 ESLint 규칙을 3회 이상 자동 교정할 때 반드시 트리거. Level 1(문서) → Level 2(ESLint) → Level 2.5(교정 지시) → Level 3(구조 테스트) 4단계 중 적절한 강도를 제안하고 docs/design-docs/feedback-log.md에 기록한다."
---

# harness-feedback

> 트리거: "같은 실수가 반복돼", "하네스 보강해줘", "규칙 추가해줘", "피드백 루프"
> QA 에이전트가 동일 패턴 위반 2회 이상 감지 시 자동 제안
> Hook 자동 교정에서 같은 규칙이 3회 이상 걸릴 때 자동 제안

---

## 4단계 보강 제안

### Level 1 — 문서 보강 (소프트 강제)
`docs/FRONTEND.md` 또는 `docs/DESIGN.md`에 규칙 추가.
에이전트가 읽고 다음 작업부터 반영.

### Level 2 — ESLint 규칙 추가 (자동 교정 강화)
ESLint 규칙으로 변환 → `.eslintrc.js` 추가 → PostToolUse Hook이 자동으로 잡음.
교정 지시(remediation message) 포함 필수:
```js
// 에러 메시지에 "어떻게 고칠지" 포함
// 예: "any 대신: API 응답이면 src/api/{도메인}/types.ts 참조,
//     props이면 interface 정의, 불확실하면 unknown + 타입 가드"
```

### Level 2.5 — 교정 지시 업데이트
에이전트가 린트 에러를 잘못된 방식으로 반복 수정할 때:
- 어떻게 잘못 고쳤는지 패턴 분석
- 올바른 교정 방법을 반영해서 `.eslintrc.js` 교정 지시 업데이트 제안

### Level 3 — 구조적 테스트 추가
`__tests__/structural/` 에 패턴 검증 테스트 생성.
예: 모든 화면에 다크모드 대응 검증, 하드코딩 색상 검증.

---

## 워크플로우

1. 반복되는 문제 패턴 파악
2. Level 1 → 3 중 적절한 단계 제안
3. 사용자 확인 후 적용
4. `docs/design-docs/feedback-log.md`에 기록
