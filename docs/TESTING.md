# 단위 테스트 가이드

> Jest + `jest-expo` 프리셋 + `@testing-library/react-native`. `npm test`로 실행.

---

## 1. 무엇을 테스트하는가 — 우선순위

| 우선순위 | 대상 | 위치 | 이유 |
|----------|------|------|------|
| **A (필수)** | 순수 함수·계산 로직 | `src/utils/` | 입출력이 명확하고 회귀가 자주 생김. TDD 적합 |
| **A (필수)** | Zustand 스토어 액션 | `src/stores/` | 액션→상태 변화가 앱 동작의 뼈대 |
| **B (권장)** | 커스텀 훅 비즈니스 로직 | `src/hooks/` | 출발 시간 계산·예약 결과 변환 등 |
| **C (선택)** | API 함수 | `src/api/` | axios mock 또는 msw로 외부 호출 가짜 응답 |
| **D (선택)** | 컴포넌트 인터랙션 | `src/components/` | 복잡한 분기 렌더링·핵심 클릭만 |
| **제외** | 화면 픽셀 위치, 애니메이션, 외부 SDK 내부 동작 | — | 단위 테스트로 못 잡거나 가성비 낮음 |

> 결론: 로직은 무조건 테스트, UI는 핵심 인터랙션만, 시각은 테스트 안 함.

---

## 2. 단위 테스트 4가지 핵심

### 2-1. 정상 케이스 (Happy Path)
**기대한 입력에 기대한 출력이 나오는가.**
```ts
test('도착 시각이 14:00, 이동 시간 30분이면 출발 시각은 13:30', () => {
  expect(calculateDeparture('14:00', 30)).toBe('13:30');
});
```

### 2-2. 경계값 (Edge Cases)
**0, 음수, 빈 배열, null, 자정 넘김 같은 경계.**
```ts
test('이동 시간 0분이면 출발 시각 = 도착 시각', () => {
  expect(calculateDeparture('14:00', 0)).toBe('14:00');
});

test('자정을 넘기는 경우', () => {
  expect(calculateDeparture('00:30', 60)).toBe('23:30');
});
```

### 2-3. 분기 (Branches)
**if / switch / 삼항이 있다면 모든 가지를 한 번씩.**
```ts
test('safety buffer가 켜져 있으면 5분 더 일찍', () => {
  expect(calculateDeparture('14:00', 30, { buffer: 5 })).toBe('13:25');
});
test('safety buffer가 꺼져 있으면 그대로', () => {
  expect(calculateDeparture('14:00', 30, { buffer: 0 })).toBe('13:30');
});
```

### 2-4. 에러 케이스
**잘못된 입력에 의도한 방식으로 실패하는가.**
```ts
test('이동 시간이 음수면 에러', () => {
  expect(() => calculateDeparture('14:00', -1)).toThrow('duration must be >= 0');
});
```

---

## 3. 영역별 작성법

### 3-1. 순수 함수 (`src/utils/`)
가장 쉬움. import → 호출 → 결과 비교.
```ts
// src/utils/__tests__/time.test.ts
import { calculateDeparture } from '../time';

describe('calculateDeparture', () => {
  test('정상 케이스', () => { ... });
  test('경계값', () => { ... });
  test('에러', () => { ... });
});
```

### 3-2. Zustand 스토어 (`src/stores/`)
스토어 인스턴스를 가져와 액션 호출 → state 검증.
```ts
import { useTripStore } from '../tripStore';

beforeEach(() => useTripStore.setState(useTripStore.getInitialState()));

test('addTrip 액션이 trips 배열에 추가한다', () => {
  useTripStore.getState().addTrip({ id: '1', name: '집' });
  expect(useTripStore.getState().trips).toHaveLength(1);
});
```

### 3-3. 커스텀 훅 (`src/hooks/`)
`@testing-library/react-native`의 `renderHook` 사용.
```ts
import { renderHook, act } from '@testing-library/react-native';
import { useDepartureCalc } from '../useDepartureCalc';

test('도착 시각 변경 시 출발 시각 재계산', () => {
  const { result } = renderHook(() => useDepartureCalc('14:00', 30));
  expect(result.current.departureAt).toBe('13:30');
});
```

### 3-4. 컴포넌트 (`src/components/`)
렌더 → query → 인터랙션 → 결과 확인. 픽셀 위치 검사하지 말 것.
```ts
import { render, fireEvent } from '@testing-library/react-native';
import { PrimaryButton } from '../PrimaryButton';

test('disabled가 true면 onPress 호출 안 됨', () => {
  const onPress = jest.fn();
  const { getByText } = render(<PrimaryButton disabled onPress={onPress}>확인</PrimaryButton>);
  fireEvent.press(getByText('확인'));
  expect(onPress).not.toHaveBeenCalled();
});
```

---

## 4. 좋은 테스트의 6가지 특징

1. **이름이 곧 명세**: `'도착 시각이 14:00, 이동 30분이면 출발 13:30'` (X: `'works'`)
2. **3줄 구조**: Arrange(준비) → Act(실행) → Assert(검증)
3. **독립적**: 다른 테스트와 순서 의존 없음. `beforeEach`로 초기화
4. **결정적**: 같은 입력은 같은 결과. `Date.now()`/난수는 mock (`jest.useFakeTimers`)
5. **하나의 사실만**: assertion 1~2개. 여러 가지 검증 = 여러 테스트로 분리
6. **빠름**: 단위 테스트 1건 수십 ms 이내. 느려지면 통합 영역으로 분리

---

## 5. 안 좋은 테스트 (피하기)

| 안티패턴 | 왜 나쁜가 |
|---------|----------|
| `expect(true).toBe(true)` 같은 placeholder | 안전망이 아님 |
| 구현 디테일 검증 (private 함수, 내부 상태) | 리팩터링 시 깨짐 |
| 거대한 setup, 한 테스트에 10가지 검증 | 실패 원인 파악 어려움 |
| 외부 API 실호출 | 느리고, 외부 사정에 좌우됨. 항상 mock |
| 타이머·Date 그대로 사용 | 시간 흐름에 따라 결과 바뀜 |

---

## 6. TDD 흐름 (로직 영역만 적용)

```
1. RED   : 실패하는 테스트 먼저 작성 (구현은 비어 있음 → 빨강)
2. GREEN : 테스트 통과할 최소 구현 (코드는 추하더라도 OK)
3. REFACTOR : 통과 유지하면서 코드 정리
```

Claude에 시킬 때 예시:
```
"src/utils/time.ts에 calculateDeparture 함수를 TDD로 작성해줘.
스펙:
- 입력: 도착 시각 'HH:MM', 이동 시간(분), { buffer?: 분 }
- 출력: 출발 시각 'HH:MM'
- 자정 넘김 처리
- duration < 0 이면 throw"
```

---

## 7. 자주 쓰는 jest 매처

| 의도 | 매처 |
|------|------|
| 정확히 같음 | `toBe`, `toEqual` |
| 포함 | `toContain`, `toMatchObject` |
| 길이/존재 | `toHaveLength`, `toBeDefined`, `toBeNull` |
| boolean | `toBeTruthy`, `toBeFalsy` |
| 호출 | `toHaveBeenCalled`, `toHaveBeenCalledWith` |
| 예외 | `toThrow` |

---

## 8. 실행 명령

| 명령 | 용도 |
|------|------|
| `npm test` | 전체 테스트 1회 실행 |
| `npm test -- --watch` | 파일 변경 감지 자동 재실행 (개발 중) |
| `npm test -- --coverage` | 커버리지 리포트 |
| `npm run test:related <파일>` | 변경된 파일과 관련된 테스트만 |

---

## 9. 우리 레포에서 시작하는 순서

1. `src/utils/time.ts` (출발 시간 계산) 작성 시 먼저 `src/utils/__tests__/time.test.ts`부터
2. Zustand 스토어 만들면 액션 단위 테스트 추가
3. 훅은 비즈니스 로직 분기 위주 (단순 wrapper는 제외)
4. 컴포넌트는 "props에 따라 다르게 동작"하는 곳만 (`disabled`, 조건부 렌더 등)
5. 화면(`app/`)은 거의 테스트 안 함 — 통합·E2E 영역
