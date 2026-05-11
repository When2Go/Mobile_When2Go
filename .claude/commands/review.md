# /review — 코드 리뷰 워크플로우

변경된 파일을 전부 분석해서 아래 항목을 체크한다.
**반드시 when2go-qa 에이전트를 별도 서브에이전트(새 컨텍스트)로 실행.**

---

## 두 가지 모드

| 모드 | 트리거 | 검증 범위 | 언제 사용 |
|------|--------|----------|----------|
| **Full**(기본) | `/review` | 브랜치의 모든 변경 파일 | PR 생성 직전 |
| **Incremental** | `/review {경로}` 또는 `/review --module {도메인}` | 지정 경로/도메인만 | **모듈 단위 완성 직후** (예: API 1개 + 대응 훅 1개 짝이 끝났을 때) |

**Incremental QA 권장 이유**: 버그를 빌드 후가 아니라 **각 모듈 완성 직후** 잡으면 누적·전파 비용이 줄어든다. 특히 백엔드 API ↔ 프론트 훅처럼 경계면이 있는 짝은 짝이 완성되자마자 한 번 돌리는 게 효율적이다.

**적용 예**:
```
# Trip API + useTripList 훅 짝이 끝난 시점
/review --module trip
→ src/api/trip/, src/hooks/trip/, src/stores/tripStore.ts만 검증

# 특정 파일 묶음만
/review src/utils/departure.ts src/hooks/trip/useDepartureCalc.ts
```

Incremental 실행 시 변경 범위 외 파일의 위반은 보고하지 않음(노이즈 차단). PR 직전엔 반드시 Full로 한 번 더 돌릴 것.

---

## 체크 항목

### 1. Hook 통과 확인

- 모든 .ts/.tsx 파일에서 ESLint + TypeScript 에러 없음
- Hook이 자동 수정한 내역 로그 확인

### 2. 코드 품질 검증 (`docs/frontend-code-quality.md` 기준)

| 항목 | 검사 방법 |
|------|---------|
| 중첩 삼항 연산자 | grep으로 삼항 중첩 패턴 탐색 |
| 매직 넘버 | 숫자 리터럴 직접 사용 여부 |
| Props Drilling | 3단계+ 동일 prop 전달 여부 |
| 단일 책임 | 훅/컴포넌트 담당 범위 |

### 3. 디자인 시스템 준수 (`docs/DESIGN.md` 기준)

- 하드코딩 색상값 없음
- 다크모드 대응 누락 없음
- `BottomSheetModal` 래퍼 사용
- 간격/라운딩 토큰 사용

### 4. 반복 패턴 감지

- 이전 리뷰와 동일 패턴 재발 → `harness-feedback` 제안
- "이 패턴을 ESLint 규칙(Level 2)으로 승격할까요?"
- "교정 지시를 업데이트할까요?" (Level 2.5)

### 5. 단위 테스트 실행

- `npm test` 실행 — 변경 영역 관련 테스트 전부 통과 확인
- 신규 로직(`src/utils/`, `src/hooks/`, `src/stores/`)이 추가됐다면 **테스트 누락 여부 확인**. 누락 시 [CRITICAL]
- 테스트 통과 + 커버리지 누락 없음이 확인돼야 PR 생성 단계로 진행
- 자세한 작성 가이드는 `docs/TESTING.md` 참조

---

## 결과 분류

```
[CRITICAL] 수정 없이 머지 불가
[WARNING]  수정 권장
[INFO]     개선 제안
[PASS]     통과
```
