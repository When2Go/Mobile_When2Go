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

- baseURL: Spring Boot 백엔드
- 에러: 인터셉터에서 전역 처리
- 헤더: **모든 요청에 `X-Device-Id` 자동 주입 (필수)**

### 디바이스 UUID 헤더 — `X-Device-Id`

**규약**: 모든 백엔드 API 요청에 `X-Device-Id: {UUID}` 헤더를 포함한다. 서버는 이 값으로 로그인 없는 사용자를 식별·구분한다.

- **출처**: `useDeviceStore.getState().deviceId` (`src/stores/deviceStore.ts`). 앱 첫 실행 시 UUID v4가 1회 생성되어 AsyncStorage에 영구 저장된다.
- **부트스트랩**: `app/_layout.tsx`에서 `ensureDeviceId()`를 호출해 1회 발급을 보장한다.
- **주입 위치**: axios 인스턴스 요청 인터셉터에서 `getState().deviceId`를 읽어 헤더에 붙인다. 화면/훅에서 매번 수동으로 넣지 않는다.
- **null 처리**: `deviceId === null`인 상태에서 API를 호출하면 안 된다. 부트스트랩이 끝난 뒤 사용한다 (정상 흐름에선 앱 마운트 직후 set됨).
- **재발급 금지**: 사용자가 명시적으로 초기화하지 않는 한 같은 UUID를 유지. 앱을 삭제·재설치하면 자연스럽게 새 UUID가 발급된다.

```ts
// src/api/axios.ts (예시)
import axios from 'axios';
import { useDeviceStore } from '@/stores/deviceStore';

export const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const deviceId = useDeviceStore.getState().deviceId;
  if (deviceId) {
    config.headers['X-Device-Id'] = deviceId;
  }
  return config;
});
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

## 7. 광고 슬롯 정책

GoogleAds 등 광고 SDK 연동은 **앱 심사 통과 후**에만 가능. 그 전에는 모든 광고 영역을 빈 placeholder 컴포넌트로 처리.

### 단일 컴포넌트 — `src/components/common/AdSlot.tsx`

```tsx
type AdSlotType = 'banner' | 'splash' | 'interstitial';

interface AdSlotProps {
  type: AdSlotType;     // 광고 타입 (배너/스플래시/전면)
  height?: number;       // banner는 60~100, splash는 화면 하단 작게
  className?: string;
}

// 심사 전: 회색 placeholder + "광고 영역" 텍스트
// 심사 후: 환경변수(EXPO_PUBLIC_ADS_ENABLED)로 실 SDK로 교체
```

### 화면별 광고 슬롯 매핑

| PRD ID | 위치 | type | 비고 |
|--------|------|------|------|
| F-AD01 | Home/Result 하단 | `banner` | 60dp 배너 |
| F-AD04 | Onboarding 스플래시 하단 | `splash` | TMAP 스타일, 1~2초 노출 |
| (선택) | ActiveTrip 완료 시 | `interstitial` | 전면, 닫기 버튼 필수 |

### 정책

- 화면 작업 시 광고 영역을 **누락하지 말 것** — 심사 통과 후 즉시 활성화 가능하도록 슬롯·여백·레이아웃 미리 확보
- placeholder는 **시각적으로 광고처럼 보이지 않게** — 회색 박스 + 작은 텍스트만
- F-AD02(앱 첫 화면 전면 팝업)은 F-AD04 스플래시로 통합 — 별도 전면 팝업 화면 만들지 말 것
- 실 SDK 연동은 **GoogleAds 심사 통과 + 별도 이슈**로만 진행

---

## 8. 금지 패턴

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
