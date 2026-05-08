# Frontend Code Quality Guide

> 출처: https://frontend-fundamentals.com/code-quality/code/  
> 이 문서는 하네스 에이전트/스킬이 코드를 작성하고 리뷰할 때 반드시 참조하는 기준입니다.  
> React Native + Expo + NativeWind + TypeScript 맥락에 맞게 적용합니다.

---

## 4가지 품질 기준

| 기준 | 핵심 질문 |
|------|---------|
| **가독성** | 코드를 읽는 사람이 고려해야 할 맥락이 최소인가? |
| **예측 가능성** | 이름과 타입만 보고 동작을 정확히 예측할 수 있는가? |
| **응집도** | 함께 수정되는 코드가 같은 곳에 있는가? |
| **결합도** | 수정의 영향 범위가 최소한으로 격리되어 있는가? |

---

## 1. 가독성

### 1-1. 같이 실행되지 않는 코드 분리하기

동시에 실행되지 않는 로직이 하나의 컴포넌트/함수에 섞이면 읽는 사람이 모든 경우를 동시에 고려해야 한다.

**나쁜 예 — 권한별 분기가 한 컴포넌트 안에 산재**
```tsx
function SubmitButton({ role }: { role: 'viewer' | 'admin' }) {
  useEffect(() => {
    if (role === 'viewer') { /* viewer 로직 */ }
    else { /* admin 로직 */ }
  }, [role]);

  if (role === 'viewer') return <Text>열람만 가능</Text>;
  return <Pressable onPress={handleSubmit}><Text>제출</Text></Pressable>;
}
```

**좋은 예 — 실행 경로별로 완전히 분리**
```tsx
function SubmitButtonContainer({ role }: { role: 'viewer' | 'admin' }) {
  if (role === 'viewer') return <ViewerSubmitButton />;
  return <AdminSubmitButton />;
}

function ViewerSubmitButton() { /* viewer 로직만 */ }
function AdminSubmitButton() { /* admin 로직만 */ }
```

> **RN 적용**: 탭별 컴포넌트, 로그인/비로그인 화면, 진행중/완료/예정 Trip 카드를 각각 별도 컴포넌트로 분리한다.

---

### 1-2. 구현 상세 추상화하기

불필요한 구현 세부사항을 노출하면 컴포넌트를 읽을 때 고려해야 할 맥락이 증가한다.

**나쁜 예 — 인증 로직이 화면 컴포넌트에 노출**
```tsx
function HomeScreen() {
  const { data: user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user == null) router.replace('/login');
  }, [user]);

  if (user == null) return null;
  return <MapView />;
}
```

**좋은 예 — 인증 가드로 추상화**
```tsx
function HomeScreen() {
  return (
    <AuthGuard>
      <MapView />
    </AuthGuard>
  );
}
```

> **RN 적용**: Expo Router의 `_layout.tsx`에서 인증 가드, 디바이스 ID 초기화 등 인프라 로직을 처리하고, 화면 컴포넌트는 UI에만 집중하게 한다.

---

### 1-3. 로직 종류가 아닌 도메인으로 분리하기

"쿼리 파라미터 관리", "API 호출", "상태 관리"처럼 로직 종류 기준으로 Hook을 만들지 않는다. 도메인 기준으로 쪼갠다.

**나쁜 예 — 페이지 전체 상태를 하나의 Hook에서 관리**
```tsx
// 모든 쿼리 파라미터가 한 Hook에 몰려 있음
function usePageState() {
  const [destination, setDestination] = useQueryParam('destination');
  const [arrivalTime, setArrivalTime] = useQueryParam('arrivalTime');
  const [routeOption, setRouteOption] = useQueryParam('routeOption');
  const [tripId, setTripId] = useQueryParam('tripId');
  // ...
}
```

**좋은 예 — 도메인별로 분리**
```tsx
function useDestinationParam() { /* 목적지 파라미터만 */ }
function useArrivalTimeParam() { /* 도착 시간 파라미터만 */ }
function useRouteOptionParam() { /* 경로 옵션 파라미터만 */ }
```

---

### 1-4. 복잡한 조건에 이름 붙이기

조건식이 복잡하면 변수에 이름을 붙여 의도를 드러낸다.

**나쁜 예**
```tsx
if (trip.status === 'active' && Date.now() < trip.arrivalTime && trip.userId === deviceId) {
  // ...
}
```

**좋은 예**
```tsx
const isMyActiveTrip =
  trip.status === 'active' &&
  Date.now() < trip.arrivalTime &&
  trip.userId === deviceId;

if (isMyActiveTrip) { /* ... */ }
```

---

### 1-5. 매직 넘버에 이름 붙이기

숫자 리터럴을 코드에 직접 쓰지 않는다. 의미를 설명하는 상수명을 붙인다.

**나쁜 예**
```tsx
await delay(300);
if (progress >= 0.9) showWarning();
const BUFFER_OPTIONS = [5, 10, 15, 20, 30];
```

**좋은 예**
```tsx
const ANIMATION_DELAY_MS = 300;
const LATE_ARRIVAL_THRESHOLD = 0.9;
const BUFFER_TIME_OPTIONS_MIN = [5, 10, 15, 20, 30] as const;

await delay(ANIMATION_DELAY_MS);
if (progress >= LATE_ARRIVAL_THRESHOLD) showWarning();
```

> **적용 범위**: `constants/` 또는 해당 도메인 파일에 상수를 선언한다.

---

### 1-6. 시점 이동 줄이기

관련 로직을 여러 파일/함수에 분산시키지 않는다. 읽는 사람이 파일을 오가지 않아도 되도록 한다.

**나쁜 예 — 권한 정책이 3개 파일에 분산**
```tsx
// policy.ts
const canLeave = policy.canLeave;  // → getPolicyByRole() → POLICY_SET 순으로 파일 이동 필요
```

**좋은 예 — 권한 정책을 사용 위치에 인라인**
```tsx
const policyByRole = {
  admin: { canLeave: true, canInvite: true },
  viewer: { canLeave: false, canInvite: false },
};
const policy = policyByRole[role];
```

> **기준**: 로직이 단순하고 재사용 없을 때는 추상화보다 인라인이 낫다.

---

### 1-7. 삼항 연산자 단순하게 하기

중첩 삼항 연산자를 금지한다. 조건이 3개 이상이면 if-else 또는 IIFE로 변환한다.

**나쁜 예**
```tsx
const statusLabel = trip.status === 'active' ? '진행중' : trip.status === 'done' ? '완료' : '예정';
```

**좋은 예**
```tsx
const statusLabel = (() => {
  if (trip.status === 'active') return '진행중';
  if (trip.status === 'done') return '완료';
  return '예정';
})();
```

> **ESLint 규칙**: `no-nested-ternary` — error

---

### 1-8. 범위 조건은 왼쪽에서 오른쪽으로

범위 비교는 수학 부등식처럼 작은 값 → 검사값 → 큰 값 순으로 작성한다.

**나쁜 예**
```tsx
if (progress >= 0 && progress <= 1) { /* ... */ }
```

**좋은 예**
```tsx
if (0 <= progress && progress <= 1) { /* ... */ }
```

---

## 2. 예측 가능성

### 2-1. 이름이 같으면 동작도 같아야 한다

같은 이름의 함수/변수는 동일하게 동작해야 한다. 라이브러리의 이름과 충돌하지 않도록 주의한다.

**나쁜 예**
```tsx
import axios from 'axios';
const http = createAuthenticatedAxios(); // axios와 이름 충돌, 내부에 인증 로직 숨어있음
http.get('/trips'); // 단순 GET처럼 보이지만 실제로는 토큰 주입
```

**좋은 예**
```tsx
const apiClient = createAuthenticatedAxios();
apiClient.getWithAuth('/trips'); // 이름에서 인증 포함임을 드러냄
```

---

### 2-2. 같은 종류의 함수는 반환 타입을 통일한다

같은 목적을 가진 함수들의 반환 타입이 달라지면 매번 반환값을 확인해야 한다.

**나쁜 예 — API 훅의 반환 타입이 제각각**
```tsx
function useTrips() { return useQuery(...); }            // Query 객체 반환
function useDeviceId() { return deviceId; }              // 문자열 직접 반환
function useNotificationSetting() { return setting; }   // 객체 직접 반환
```

**좋은 예 — 서버 상태 훅은 모두 Query 객체 반환**
```tsx
function useTrips() { return useQuery(...); }
function useUserSetting() { return useQuery(...); }
// 로컬 상태만 예외 (useState 반환 괜찮음)
```

**나쁜 예 — 검증 함수의 반환 타입이 불일치**
```tsx
function validateDestination(dest: string): boolean { ... }
function validateArrivalTime(time: number): { ok: boolean; reason?: string } { ... }
```

**좋은 예 — Discriminated Union으로 통일**
```tsx
type ValidationResult = { ok: true } | { ok: false; reason: string };

function validateDestination(dest: string): ValidationResult { ... }
function validateArrivalTime(time: number): ValidationResult { ... }
```

---

### 2-3. 숨은 로직을 드러내기

함수 이름과 시그니처로 예측할 수 없는 부수 효과를 함수 내부에 숨기지 않는다.

**나쁜 예**
```tsx
async function fetchRoute(params: RouteParams): Promise<Route> {
  const route = await odsayClient.getRoute(params);
  analytics.track('route_fetched'); // 이름에서 예측 불가
  return route;
}
```

**좋은 예**
```tsx
async function fetchRoute(params: RouteParams): Promise<Route> {
  return odsayClient.getRoute(params);
}

// 호출처에서 명시적으로
const route = await fetchRoute(params);
analytics.track('route_fetched');
```

---

## 3. 응집도

### 3-1. 함께 수정되는 파일은 같은 디렉토리에

파일을 "컴포넌트", "훅", "유틸"처럼 기술 종류로 나누지 않는다. 함께 변경되는 파일은 같은 도메인 디렉토리에 둔다.

**나쁜 예 — 기술 종류 기반 구조**
```
src/
├── components/  ← Trip 카드, 검색바, 바텀시트 모두 여기
├── hooks/       ← Trip 훅, 검색 훅, 알림 훅 모두 여기
└── utils/       ← 모든 유틸 여기
```

**좋은 예 — 도메인 기반 구조**
```
src/
├── features/
│   ├── trip/
│   │   ├── components/   ← Trip 카드, Trip 상세
│   │   ├── hooks/        ← useTrips, useTripStatus
│   │   └── api.ts        ← Trip API 함수
│   ├── route/
│   │   ├── components/   ← 경로 옵션, 결과 카드
│   │   └── hooks/        ← useRouteSearch
│   └── notification/
└── components/ui/        ← 공용 원자 컴포넌트만
```

---

### 3-2. 매직 넘버는 사용처 가까이에 상수로 선언

매직 넘버를 상수로 선언할 때, 해당 상수를 사용하는 코드와 가까운 위치에 선언해 응집도를 높인다.

```tsx
// 상수와 사용처가 같은 파일에 있어야 함께 수정됨
const DEPARTURE_RECALC_INTERVALS_MS = {
  ONE_HOUR_BEFORE: 60 * 60 * 1000,
  THIRTY_MIN_BEFORE: 30 * 60 * 1000,
  TWENTY_MIN_BEFORE: 20 * 60 * 1000,
} as const;
```

---

### 3-3. 폼은 전체 단위 응집도로 관리

모든 필드가 하나의 완결된 기능을 이룰 때는 Zod 스키마로 검증 로직을 한곳에 모은다.

**나쁜 예 — 검증 로직이 각 필드에 분산**
```tsx
<Controller name="destination" rules={{ required: '필수', minLength: { value: 2, ... } }} />
<Controller name="arrivalTime" rules={{ validate: (v) => v > Date.now() || '미래 시간' }} />
```

**좋은 예 — Zod 스키마로 응집**
```tsx
const tripSchema = z.object({
  destination: z.string().min(2, '목적지를 입력해주세요'),
  arrivalTime: z.number().refine((v) => v > Date.now(), '미래 시간을 입력해주세요'),
  routeOption: z.enum(['OPTIMAL', 'MIN_TRANSFER', 'SUBWAY', 'BUS']),
});

const form = useForm<z.infer<typeof tripSchema>>({
  resolver: zodResolver(tripSchema),
});
```

---

## 4. 결합도

### 4-1. 책임을 하나씩 관리하기

하나의 Hook/컴포넌트가 너무 많은 것을 담당하면 수정 시 영향 범위가 넓어진다.

**적용 기준**: Hook 하나가 담당하는 상태/사이드이펙트가 3개를 넘으면 분리를 고려한다.

**나쁜 예**
```tsx
function useSetupPage() {
  const [destination, setDestination] = useDestinationParam();
  const [arrivalTime, setArrivalTime] = useArrivalTimeParam();
  const [routeOption, setRouteOption] = useRouteOptionParam();
  const { data: route } = useRouteSearch(destination, arrivalTime, routeOption);
  const { mutate: saveTrip } = useSaveTrip();
  // 너무 많은 책임
}
```

**좋은 예 — 도메인별로 책임 분리**
```tsx
// 각 도메인이 자신의 상태만 관리
const [destination, setDestination] = useDestinationParam();
const [arrivalTime, setArrivalTime] = useArrivalTimeParam();
const { data: route } = useRouteSearch(destination, arrivalTime);
```

---

### 4-2. 중복 코드를 섣불리 공통화하지 않기

코드가 비슷해 보여도 미래에 다르게 변할 가능성이 있으면 공통화를 미룬다. 불필요한 공통화는 결합도를 높인다.

**판단 기준**:
- 동일하게 변경될 것이 확실할 때만 공통화한다
- "우연히 같은 코드"와 "본질적으로 같은 코드"를 구분한다
- 공통화 전 팀원과 미래 변경 가능성을 논의한다

```
❌ 홈 배너 광고 + 결과 화면 배너 광고를 하나의 공통 컴포넌트로 성급히 통합
   → 위치마다 크기, 여백, 노출 조건이 달라지면 공통 컴포넌트가 분기로 가득 참

✅ 일단 각각 구현하고, 3번 이상 동일 변경이 발생하면 그때 공통화
```

---

### 4-3. Props Drilling 제거

3단계 이상 Props를 내려 보내면 Composition 패턴 또는 Context로 해결한다.

**나쁜 예 — Props Drilling**
```tsx
<ResultScreen trip={trip} onConfirm={onConfirm} onCancel={onCancel}>
  <RouteDetail trip={trip} onConfirm={onConfirm} onCancel={onCancel}>
    <ConfirmButton trip={trip} onConfirm={onConfirm} onCancel={onCancel} />
  </RouteDetail>
</ResultScreen>
```

**좋은 예 A — Composition 패턴**
```tsx
// 부모에서 직접 조립
<ResultScreen>
  <RouteDetail>
    <ConfirmButton onConfirm={onConfirm} onCancel={onCancel} />
  </RouteDetail>
</ResultScreen>
```

**좋은 예 B — Context**
```tsx
const TripContext = createContext<TripContextValue>(null!);

function ResultScreen({ trip }: Props) {
  return (
    <TripContext.Provider value={{ trip, onConfirm, onCancel }}>
      <RouteDetail />
    </TripContext.Provider>
  );
}
// 하위에서 useTripContext()로 직접 접근
```

---

## 5. ESLint 자동화 가능 규칙

| 규칙 | ESLint 설정 | 대응 가이드 |
|------|------------|------------|
| 중첩 삼항 연산자 금지 | `no-nested-ternary: error` | if-else 또는 IIFE로 변환 |
| console.log 금지 | `no-console: warn` | `logger.ts` 유틸 사용 |
| any 타입 금지 | `@typescript-eslint/no-explicit-any: error` | 타입 정의 또는 unknown + 타입 가드 |
| 매직 넘버 금지 | `no-magic-numbers: warn` | `constants/` 에 상수 선언 |
| 미사용 변수 금지 | `@typescript-eslint/no-unused-vars: error` | 즉시 삭제 |

---

## 6. QA 체크리스트

코드 리뷰 및 QA 에이전트가 확인할 항목:

```
가독성:
  [ ] 같이 실행되지 않는 코드가 분리되어 있는가?
  [ ] 구현 상세가 적절히 추상화되어 있는가?
  [ ] 복잡한 조건에 이름이 붙어 있는가?
  [ ] 매직 넘버 없이 상수명이 사용되는가?
  [ ] 중첩 삼항 연산자가 없는가?

예측 가능성:
  [ ] 같은 종류의 함수(API 훅, 검증 함수)의 반환 타입이 통일되어 있는가?
  [ ] 함수 이름으로 예측 불가능한 부수 효과가 숨어있지 않은가?
  [ ] 라이브러리 이름과 충돌하는 변수명이 없는가?

응집도:
  [ ] 함께 수정되는 파일이 같은 디렉토리에 있는가?
  [ ] 폼 검증 로직이 한곳에 모여 있는가?
  [ ] 상수가 사용처와 가까운 위치에 선언되어 있는가?

결합도:
  [ ] 하나의 Hook이 너무 많은 책임을 갖지 않는가?
  [ ] Props Drilling이 3단계 이상 없는가?
  [ ] 공통화의 근거가 명확한가? (우연히 같은 코드 아닌지)
```
