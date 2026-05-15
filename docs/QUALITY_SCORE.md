# 품질 등급 추적

> `/quality` 커맨드가 자동 업데이트. 직접 수정 금지.
> 등급: A(우수) B(양호) C(보통) D(개선필요) F(심각)

---

## 현재 등급 (2026-05-15 — `/quality` 재평가, PR #42 시점)

| 영역 | 등급 | 변화 | 주요 갭 | 마지막 평가일 |
|------|------|------|---------|------------|
| 컴포넌트 재사용성 | B+ | ↑ (B) | 스와이프 삭제 카드 3종(routes·schedule·repeat) 동일 상수·패턴으로 안정. `TimeWheelPicker`가 setup→repeat 횡단 재사용. `BottomSheetModal` 8 파일에서 사용. 향후 `SwipeableCard` 래퍼 추출 시 A | 2026-05-15 |
| 디자인 시스템 일관성 | A | → | 하드코딩 hex 0건, 모든 시각 컴포넌트 `isDark` 분기, DESIGN.md↔tailwind↔PALETTE 토큰 완전 일치. `no-restricted-syntax`로 hex/size 매직 ESLint 차단 중 | 2026-05-15 |
| 상태 관리 | B | → | Zustand 3개 store(`deviceStore`/`settingsStore`/`routeDraftStore`). `routeDraftStore`로 search ↔ routes 위치 선택 복귀 패턴 검증. 비즈니스 훅(`src/hooks/`)은 여전히 부재 (mock 단계) | 2026-05-15 |
| API 패턴 | C | → | `axios` 인스턴스 + `X-Device-Id` 자동 주입 셋업 유지. 도메인 API 함수는 mock 단계라 부재. ODsay 직접 호출 0건 | 2026-05-15 |
| 타입 안전성 | A | → | `any` 0건(eslint 강제), `tsc --noEmit` 클린. 이전 평가의 `as never` 캐스트 1건은 `/result` 라우트 구현으로 해소 — 갭 사라짐 | 2026-05-15 |
| 코드 품질 | A | → | 매직 넘버·중첩 삼항·`console.*`·`TODO` 모두 0건. PR #42에서 `let nextId` 모듈 mutable state 1회 발생했으나 같은 PR 내 `useRef` 교정 — 패턴 재발 없음 | 2026-05-15 |
| 테스트 커버리지 | C | → | `src/stores/__tests__` 18건 전부 pass (14→18, `routeDraftStore.test.ts` 신규). `src/utils/`·`src/hooks/` 디렉토리 여전히 부재(비즈니스 로직 부재로 정당). UI는 TDD 비대상 | 2026-05-15 |
| 접근성 | A- | → | Pressable 67/accessibilityRole 69로 100% 부여. `hitSlop` 분포 8×12·6×2·4×1·12×1로 8 dominant. outlier 4·6·12는 작은 토글/아이콘 버튼에서 의도된 값이나, 토큰 상수화(`HIT_SLOP.sm/md/lg`) 시 A | 2026-05-15 |

### 등급 산정 근거

**A — 우수 (3영역, 유지)**
- 디자인 시스템: hex/size 매직 ESLint 차단 후 위반 0건 지속. 신규 도메인(`repeat/`) 추가에도 토큰 일관.
- 타입 안전성: ESLint `no-explicit-any: error` 강제 + tsc 0 에러. 이전 INFO였던 `as never`도 해소.
- 코드 품질: 컨벤션 위반 자동 감지 0. 신규 카드 3종이 동일 상수(`SWIPE_*`) 패턴 따름.

**B+ — 양호 상위 (1영역, ↑ B에서 상승)**
- 컴포넌트 재사용성: PR #37·#38·#42 누적으로 횡단 재사용 사례 다수 확보.
  - `BottomSheetModal` 8 파일, `BufferSheetBody` 2 도메인, `TimeWheelPicker` setup→repeat 재사용.
  - 스와이프 삭제 카드 3종이 동일 임계값·애니메이션 상수 사용 — 패턴 일관.
  - 캘린더 2종(schedule/setup) 분리는 여전히 맥락 차이로 정당화.

**B — 양호 (1영역, 유지)**
- 상태 관리: store 3개로 책임 분리 명확. 비즈니스 훅 부재는 mock 단계 한계.

**A- — 우수에 가까움 (1영역, 유지)**
- 접근성: 빠짐 없는 라벨 부여. `hitSlop` 토큰 상수화 시 A.

**C — 보통 (2영역, 유지)**
- API 패턴·테스트 커버리지: mock 단계 한계. 도메인 첫 구현 시 C→B 즉시 상승 여지.

### 평균 변화
이전 평가(2026-05-14): A 3 / A- 1 / B 2 / C 2 — 평균 B+
**현재(2026-05-15): A 3 / A- 1 / B+ 1 / B 1 / C 2 — 평균 B+ (소폭 상승)**

상승 동인: 신규 도메인 3종(routes/result/repeat) 추가에도 위반 0건 유지 + 횡단 재사용 사례 누적. 다음 등급 상승(B+→A 또는 A-→A)을 위해선 `SwipeableCard` 래퍼 추출과 `HIT_SLOP` 토큰화가 후보.

---

## 변경 이력

| 날짜 | 트리거 | 변화 |
|------|--------|------|
| 2026-05-14 | `/health` 첫 실행 | 정식 등급 미평가, 관찰 기록 시작 |
| 2026-05-14 | `/quality` 첫 실행 (PR #33 시점) | 8영역 신규 평가 — A 3 / A- 1 / B 2 / C 2. 평균 B+. mock 단계 한계로 API·테스트 영역 C |
| 2026-05-15 | `/health` (PR #42 시점) | 등급 변동 없음. component-inventory에 `repeat/`·`result/`·`routes/` 폴더 누락 발견 → 같은 브랜치 갱신. 테스트 14→18로 증가했으나 비즈니스 로직 부재로 커버리지 C 유지 |
| 2026-05-15 | `/quality` 재평가 (PR #42 시점) | 컴포넌트 재사용성 B→B+ 상승 (스와이프 카드 3종 패턴 일관 + TimeWheelPicker 횡단 재사용). 타입 안전성 INFO(`as never`) 해소. 나머지 7영역 등급 유지. 평균 B+ (소폭 상승) |
