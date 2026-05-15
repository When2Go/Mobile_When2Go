# 품질 등급 추적

> `/quality` 커맨드가 자동 업데이트. 직접 수정 금지.
> 등급: A(우수) B(양호) C(보통) D(개선필요) F(심각)

---

## 현재 등급 (2026-05-14 — `/quality` 첫 정식 평가)

| 영역 | 등급 | 변화 | 주요 갭 | 마지막 평가일 |
|------|------|------|---------|------------|
| 컴포넌트 재사용성 | B | 신규 | 도메인 분리 양호. 캘린더 2종(`schedule/CalendarHeader`, `setup/DateCalendarPicker`) 분리는 의도가 다르므로 정당화되나 향후 공통화 검토 여지 | 2026-05-14 |
| 디자인 시스템 일관성 | A | 신규 | 하드코딩 hex 0건, 모든 시각 컴포넌트 `isDark` 분기, DESIGN.md↔tailwind↔PALETTE 토큰 완전 일치 | 2026-05-14 |
| 상태 관리 | B | 신규 | Zustand 2개 store(`deviceStore`/`settingsStore`) persist 적용. 사용자 default ↔ 경로 override 분리 명확. 비즈니스 훅(`src/hooks/`)은 아직 부재 (mock 단계) | 2026-05-14 |
| API 패턴 | C | 신규 | `axios` 인스턴스 + `X-Device-Id` 자동 주입 셋업 완료. 도메인 API 함수는 mock 단계라 부재. ODsay 직접 호출 0건 | 2026-05-14 |
| 타입 안전성 | A | 신규 | `any` 0건(eslint 강제), `tsc --noEmit` 클린. `as never` 캐스트 1건은 `/result` 라우트 미존재로 인한 일시 우회(후속 이슈에서 제거 예정) | 2026-05-14 |
| 코드 품질 | A | 신규 | 매직 넘버·중첩 삼항·`console.*`·`TODO` 모두 0건. `ArrivalTimePicker` Props 15개는 INFO로 향후 `useArrivalPicker` 훅 추출 여지 | 2026-05-14 |
| 테스트 커버리지 | C | 신규 | `src/stores/__tests__` 14건 전부 pass. `src/utils/`·`src/hooks/` 디렉토리 부재(비즈니스 로직 부재로 정당). UI는 TDD 비대상 | 2026-05-14 |
| 접근성 | A- | 신규 | 모든 Pressable에 `accessibilityRole`·`accessibilityLabel` 부여. `accessibilityState`로 disabled 표현. `hitSlop` 값 4·6·8 혼재(통일하면 A) | 2026-05-14 |

### 등급 산정 근거

**A — 우수 (3영역)**
- 디자인 시스템: 보강된 GC·health에서 위반 0건 재확인. 변경된 SearchEntryBar 토큰화로 hex가 1건도 남지 않음.
- 타입 안전성: ESLint `no-explicit-any: error`로 강제 + tsc 0 에러.
- 코드 품질: 컨벤션 위반 패턴 자동 감지 결과 모두 0.

**B — 양호 (2영역)**
- 컴포넌트 재사용성: `BufferSheetBody`가 mypage → common으로 승격된 사례가 정책 작동 증거. 캘린더 중복은 사용 맥락 차이(스케줄 dot 표시 vs 셋업 과거 비활성)로 분리 정당화.
- 상태 관리: store와 local state 책임 분리 명확(특히 안전 버퍼 정책). 다만 비즈니스 훅이 아직 없어 패턴 검증 표본 부족.

**A- — 우수에 가까움 (1영역)**
- 접근성: 빠짐 없는 라벨 부여. `hitSlop` 값 통일(권장 8 또는 토큰 상수화) 시 A.

**C — 보통 (2영역)**
- API 패턴·테스트 커버리지: mock 단계 한계로 실제 도메인 API/비즈니스 로직 부재. 인프라(axios·jest·deviceStore·settingsStore)는 셋업되어 있으므로 도메인 첫 구현 시 C→B 즉시 상승 여지.

---

## 변경 이력

| 날짜 | 트리거 | 변화 |
|------|--------|------|
| 2026-05-14 | `/health` 첫 실행 | 정식 등급 미평가, 관찰 기록 시작 |
| 2026-05-14 | `/quality` 첫 실행 (PR #33 시점) | 8영역 신규 평가 — A 3 / A- 1 / B 2 / C 2. 평균 B+. mock 단계 한계로 API·테스트 영역 C |
| 2026-05-15 | `/health` (PR #42 시점) | 등급 변동 없음. component-inventory에 `repeat/`·`result/`·`routes/` 폴더 누락 발견 → 같은 브랜치 갱신. 테스트 14→18로 증가했으나 비즈니스 로직 부재로 커버리지 C 유지 |
