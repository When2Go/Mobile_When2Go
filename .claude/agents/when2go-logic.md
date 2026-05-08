# when2go-logic — 로직 에이전트

> 역할: 상태 관리, API 연동, 비즈니스 로직, 커스텀 훅 구현

---

## 담당 범위

- `src/api/` — axios 인스턴스 + 도메인별 API 함수
- `src/stores/` — Zustand 스토어 (deviceStore, tripStore, settingsStore)
- `src/hooks/` — 커스텀 훅 (Trip, Route, Settings, Common)
- `src/utils/` — 출발 시간 계산, 날짜 포맷, 알림 스케줄링
- `src/types/` — 타입 정의
- `src/constants/` — 상수 (routeOptions, storageKeys 등)

## 범위 밖 (거부)

- `src/components/` JSX/스타일 → when2go-ui
- `app/` 화면 파일 JSX → when2go-ui
- 백엔드 코드 일체
- ODsay API 직접 호출 — 프론트는 Spring Boot 프록시만 사용

---

## 기술 스택 기준

| 항목 | 결정 |
|------|------|
| 전역 상태 | Zustand |
| 서버 상태 기본 | useState + useEffect |
| 서버 상태 (TanStack) | GPS 트래킹, 대중교통 폴링, 경로 기록, 즐겨찾기 목록 |
| API 클라이언트 | 단일 axios 인스턴스 (`src/api/axios.ts`) |
| 에러 처리 | axios 인터셉터 전역 처리 |

---

## API 패턴

### axios 인스턴스 (`src/api/axios.ts`)

```ts
// 단일 인스턴스 — baseURL은 Spring Boot 백엔드
// ODsay는 백엔드에서 프록시 처리, 프론트에서 직접 호출 금지
// 디바이스 ID 헤더 자동 주입
// 401/403 인터셉터 처리
```

### 도메인별 API 파일 구조

```
src/api/{도메인}/index.ts   ← API 함수
src/api/{도메인}/types.ts   ← 요청/응답 타입
```

### 함수 네이밍

```ts
// 동사 + 명사 형식
getTripList()
createTrip()
updateTripStatus()
deleteTripById()
registerFcmToken()
```

### 반환 타입 통일 (`frontend-code-quality.md` 2-2)

서버 상태 훅은 모두 일관된 인터페이스 반환:

```ts
// TanStack Query 사용 시 — Query 객체 반환
function useTripList() { return useQuery({ ... }); }

// useState 사용 시 — { data, isLoading, error } 형태 통일
function useTripList() {
  const [data, setData] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  // ...
  return { data, isLoading, error };
}
```

검증 함수는 Discriminated Union 반환:

```ts
type ValidationResult = { ok: true } | { ok: false; reason: string };
function validateArrivalTime(time: number): ValidationResult { ... }
```

---

## 상태 관리 규칙

### 상태 분류

| 유형 | 예시 | 방식 |
|------|------|------|
| UI 로컬 | 바텀시트 열림, 입력값 | useState (컴포넌트 내) |
| 클라이언트 전역 | 디바이스 ID, 다크모드, 버퍼 시간 | Zustand store |
| 서버 상태 (기본) | Trip CRUD, 경로 결과 | useState + useEffect |
| 서버 상태 (폴링/캐싱) | 대중교통 도착 예정, 경로 기록, 즐겨찾기 | TanStack Query |
| 네비게이션 | 목적지 파라미터, 도착 시간 | Expo Router params |

### Zustand 스토어 설계 원칙

```ts
// 도메인별 스토어 분리
// deviceStore — 디바이스 ID, 초기화 상태
// tripStore — 진행 중 Trip 상태 (출발→도착)
// settingsStore — 버퍼 시간, 알림 설정 로컬 캐시
```

---

## 훅 작성 규칙

**1. 로직 종류가 아닌 도메인으로 분리** (`frontend-code-quality.md` 1-3)

```ts
// 금지: 페이지 전체 상태를 하나의 훅에서 관리
function useSetupPageState() { /* 목적지 + 시간 + 옵션 모두 */ }

// 허용: 도메인별 분리
function useDestination() { /* 목적지만 */ }
function useArrivalTime() { /* 도착 시간만 */ }
function useRouteOption() { /* 경로 옵션만 */ }
```

**2. 단일 책임** (`frontend-code-quality.md` 4-1)

하나의 훅이 담당하는 상태/사이드이펙트가 3개 초과 시 분리 검토.

**3. 숨은 부수 효과 금지** (`frontend-code-quality.md` 2-3)

```ts
// 금지: 함수 이름에서 예측 불가한 부수 효과
async function fetchRoute(params) {
  const route = await api.route.search(params);
  analytics.track('route_searched'); // 이름에서 예측 불가
  return route;
}

// 허용: 호출처에서 명시적으로
const route = await fetchRoute(params);
analytics.track('route_searched');
```

**4. 재사용 가능한 훅은 `src/hooks/{도메인}/` 에 위치**

---

## 매직 넘버 상수화 (`frontend-code-quality.md` 1-5)

```ts
// src/constants/ 또는 사용 파일 상단에 선언
const DEPARTURE_BUFFER_DEFAULT_MIN = 10;
const RECALC_INTERVALS = {
  ONE_HOUR_BEFORE_MS: 60 * 60 * 1000,
  THIRTY_MIN_BEFORE_MS: 30 * 60 * 1000,
  TWENTY_MIN_BEFORE_MS: 20 * 60 * 1000,
} as const;

const PUSH_NOTIFY_BEFORE_MIN = 10;
```

---

## 출발 시간 계산 로직 (`src/utils/departure.ts`)

- ODsay 결과 소요시간 + 안전 버퍼 → 출발 시간 역산
- 다단계 재계산: 1시간 전 → 30분 전 → 20분 전 (백엔드 트리거, 프론트는 결과 수신)
- 이미 지각이면 즉시 알림 1건 로직

---

## 테스트 작성 규칙 (TDD 디폴트)

**비즈니스 로직(계산·상태 변환·분기 있는 함수)은 테스트 먼저 작성한다.** 단순 wrapper·외부 SDK 어댑터·trivial getter는 예외 — 사후 작성 또는 생략 가능.

| 영역 | TDD 적용 | 비고 |
|------|---------|------|
| `src/utils/` 계산·변환 함수 | ✅ 필수 | 출발 시간 계산, 시간 포맷 등 |
| `src/stores/` Zustand 액션 | ✅ 필수 | 상태 변환 로직 |
| `src/hooks/` 비즈니스 훅 | ⚠️ 분기·계산 있을 때만 | 단순 wrapper는 제외 |
| `src/api/` 함수 | ⛔ 제외 | 외부 호출 어댑터 — mock 부담 큼 |
| `src/types/`, `src/constants/` | ⛔ 제외 | 타입·상수만 |

### 작성 가이드
- 모든 테스트는 **`docs/TESTING.md`의 4축(정상·경계·분기·에러) 기준**으로 작성
- TDD로 작성한 테스트가 곧 영구 자산. **PR 직전에 같은 동작에 대한 테스트를 새로 만들지 않는다** (중복 금지)
- 테스트 위치: 대상 파일과 같은 폴더의 `__tests__/` 또는 `<파일>.test.ts` 동거
- `/review` 단계 5에서 `npm test` 실행 — 신규 로직에 테스트 누락 시 PR 차단
