# Frontend 코드 컨벤션

> 이 문서는 when2go-ui, when2go-logic 에이전트가 코드를 작성할 때 따르는 기준입니다.
> 코드 품질 기준 상세: `docs/frontend-code-quality.md`

---

## 1. 폴더 구조

`docs/folder-structure.md` 참조. 핵심 규칙:

- `app/` — Expo Router 라우트 파일만 (JSX 최소화, 로직은 `src/`에서)
- `src/api/{도메인}/` — API 함수 + 타입 (도메인별 응집)
- `src/components/common/` — 공용 컴포넌트 (설계 단계부터 공용 예상되면 여기)
- `src/components/{도메인}/` — 화면 전용 컴포넌트
- `src/hooks/{도메인}/` — 커스텀 훅 (도메인별)
- `src/stores/` — Zustand 스토어 3개 (device / trip / settings)
- `src/constants/` — 상수 (colors, storageKeys, routeOptions)
- `src/types/` — 공용 타입 정의

### 파일 위치 기준

함께 수정되는 파일은 같은 도메인 디렉토리에. 기술 종류(컴포넌트, 훅, 유틸) 기준으로만 묶지 않는다.

---

## 2. 컴포넌트 패턴

### 기본 방침
- 컴포넌트 내부에서 훅으로 로직 처리 (presentation/container 미분리)
- 재사용 가능한 훅은 `src/hooks/{도메인}/`에 분리
- 공용 컴포넌트는 설계 단계부터 공용이 예상되면 `components/common/`

### 같이 실행되지 않는 코드는 분리

```tsx
// Trip 상태별 분리 예시
function TripCard({ trip }: { trip: Trip }) {
  if (trip.status === 'active') return <ActiveTripCard trip={trip} />;
  if (trip.status === 'done')   return <DoneTripCard trip={trip} />;
  return <ScheduledTripCard trip={trip} />;
}
```

### 중첩 삼항 금지

```tsx
// 금지
const label = s === 'active' ? '진행중' : s === 'done' ? '완료' : '예정';

// 허용
const label = (() => {
  if (s === 'active') return '진행중';
  if (s === 'done') return '완료';
  return '예정';
})();
```

### Props Drilling 금지 (3단계 이상)

3단계 이상: Composition 패턴 또는 Context 사용.

---

## 3. 네이밍 규칙

| 대상 | 규칙 | 예시 |
|------|------|------|
| 컴포넌트 파일 | PascalCase | `TripCard.tsx`, `BottomSheetModal.tsx` |
| 훅 파일 | camelCase, use 접두사 | `useTripList.ts` |
| API 함수 파일 | camelCase | `index.ts` (도메인 폴더 내) |
| 상수 | UPPER_SNAKE_CASE | `ANIMATION_DELAY_MS` |
| 타입/인터페이스 | PascalCase | `Trip`, `RouteStep`, `ApiResponse<T>` |
| 불리언 변수 | is/has/can 접두사 | `isLoading`, `hasError`, `isMyActiveTrip` |

---

## 4. 상태 관리

### 상태 분류 기준

| 유형 | 예시 | 방식 |
|------|------|------|
| UI 로컬 | 바텀시트 열림, 입력값 | `useState` |
| 클라이언트 전역 | 디바이스 ID, 다크모드, 버퍼 시간 | Zustand |
| 서버 상태 (기본) | Trip CRUD, 경로 결과 | `useState + useEffect` |
| 서버 상태 (폴링/캐싱) | 대중교통 도착 예정, 경로 기록 목록, 즐겨찾기 | TanStack Query |
| 네비게이션 | 목적지, 도착 시간 파라미터 | Expo Router params |

### 훅 단일 책임 원칙

```ts
// 금지: 페이지 전체 상태 하나의 훅
function useSetupPageState() { /* 목적지 + 시간 + 옵션 모두 */ }

// 허용: 도메인별 분리
function useDestination() { ... }
function useArrivalTime() { ... }
```

---

## 5. API 패턴

### 인스턴스

단일 axios 인스턴스 (`src/api/axios.ts`). ODsay 직접 호출 금지 (백엔드 프록시).

```ts
// 헤더: X-Device-Id 자동 주입
// 에러: 인터셉터에서 전역 처리
// baseURL: Spring Boot 백엔드
```

### 함수 반환 타입 통일

서버 상태 훅: Query 객체 또는 `{ data, isLoading, error }` 형태로 통일.
검증 함수: `{ ok: true } | { ok: false; reason: string }` Discriminated Union.

### 숨은 부수 효과 금지

```ts
// 금지: fetch 함수 내부에 analytics 숨김
async function fetchRoute(p) {
  const r = await api.route.search(p);
  analytics.track('route_searched'); // 이름에서 예측 불가
  return r;
}

// 허용: 호출처에서 명시적으로
const route = await fetchRoute(params);
analytics.track('route_searched');
```

---

## 6. Import 순서

```ts
// 1. React/React Native
import React, { useState } from 'react';
import { View, Text } from 'react-native';

// 2. 외부 라이브러리
import { useQuery } from '@tanstack/react-query';

// 3. 내부 — 컴포넌트
import BottomSheetModal from '@/components/common/BottomSheetModal';

// 4. 내부 — 훅/스토어/API
import { useTripList } from '@/hooks/trip/useTripList';

// 5. 내부 — 타입/상수/유틸
import type { Trip } from '@/types/trip.types';
```

Path alias: `@/` → `src/`

---

## 7. 금지 패턴

```
❌ 하드코딩 색상값: style={{ color: '#2563eb' }}, className="bg-[#2563eb]"
❌ any 타입 사용
❌ console.log (logger 유틸 사용)
❌ 중첩 삼항 연산자
❌ 매직 넘버 직접 사용 (300, 10, 0.9 등)
❌ @gorhom/bottom-sheet 직접 사용 (BottomSheetModal 래퍼 사용)
❌ @mj-studio/react-native-naver-map 직접 사용 (MapView 래퍼 사용)
❌ ODsay API 직접 호출
❌ Props Drilling 3단계 이상
```
