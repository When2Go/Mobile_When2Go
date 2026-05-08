# "지금 나가?" 폴더 구조 (MVP)

> React Native + Expo / TypeScript / Expo Router / Zustand

---

## `app/` — Expo Router 라우트 파일

```
app/
├── _layout.tsx                 # 루트 레이아웃 (FCM, DeviceID 초기화)
├── index.tsx                   # 홈 화면 (네이버맵 + 검색창)
├── search.tsx                  # 목적지 검색
├── trip/
│   ├── _layout.tsx
│   ├── setup.tsx               # 도착 시간 + 경로 옵션 설정
│   └── result.tsx              # 출발 시간 계산 결과 + 텍스트 경로
├── schedule/
│   └── index.tsx               # 예약한 리스트 (일회성 + 반복)
└── settings/
    ├── index.tsx               # 설정 메인
    └── notification.tsx        # 알림 상세 설정
```

---

## `src/` — 공유 코드

```
src/
│
├── api/
│   ├── axios.ts                # Axios 인스턴스 (디바이스 ID 헤더 주입)
│   ├── device/
│   │   ├── index.ts            # 디바이스 등록 API
│   │   └── types.ts
│   ├── trip/
│   │   ├── index.ts            # Trip CRUD + 출발/도착 버튼
│   │   └── types.ts
│   ├── route/
│   │   ├── index.ts            # ODsay 경로 탐색 (백엔드 프록시)
│   │   └── types.ts
│   ├── notification/
│   │   ├── index.ts            # FCM 토큰 등록, 알림 설정
│   │   └── types.ts
│   └── settings/
│       ├── index.ts            # 안전 버퍼, 알림 옵션
│       └── types.ts
│
├── assets/
│   ├── fonts/
│   └── images/
│       ├── icons/
│       └── map/                # 지도 마커 이미지
│
├── components/
│   ├── common/
│   │   ├── Text.tsx            # RN Text 래퍼 (전역 강제 사용)
│   │   ├── PrimaryButton.tsx
│   │   ├── BottomSheetModal.tsx
│   │   └── AdBanner.tsx        # AdMob 배너 래퍼
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── BottomTabBar.tsx    # 홈 / 예약 / 설정 탭
│   ├── home/
│   │   ├── SearchBar.tsx       # 목적지 검색 입력창
│   │   └── RecentSearchList.tsx
│   ├── trip/
│   │   ├── setup/
│   │   │   ├── ArrivalTimePicker.tsx
│   │   │   └── RouteOptionSelector.tsx
│   │   ├── result/
│   │   │   ├── DepartureTimeCard.tsx   # "지금 나가세요!" 카드
│   │   │   ├── RouteStepList.tsx       # 텍스트 경로 안내 목록
│   │   │   └── TransitArrivalBadge.tsx # 대중교통 도착 예정 시간 뱃지
│   │   └── TripCard.tsx               # 예약 리스트 아이템
│   ├── settings/
│   │   ├── BufferTimeRow.tsx
│   │   └── NotificationRow.tsx
│   └── skeleton/
│       └── TripCardSkeleton.tsx
│
├── constants/
│   ├── colors.ts               # 디자인 시스템 색상 (유일 색상 소스)
│   ├── storageKeys.ts
│   └── routeOptions.ts         # 경로 옵션 상수 (최적/최소환승 등)
│
├── hooks/
│   ├── common/
│   │   ├── useDeviceId.ts      # 디바이스 고유 ID 초기화/조회
│   │   └── useFcmToken.ts
│   ├── trip/
│   │   ├── useTripList.ts
│   │   ├── useTripCreate.ts    # 일회성 + 반복 예약 생성
│   │   ├── useTripActions.ts   # 출발했어요 / 도착했어요
│   │   └── useDepartureCalc.ts # 출발 시간 계산 결과 조회
│   ├── route/
│   │   └── useRouteSearch.ts   # ODsay 경로 탐색 + 목적지 검색
│   └── settings/
│       ├── useNotificationSettings.ts
│       └── useBufferTime.ts
│
├── stores/
│   ├── index.ts
│   ├── deviceStore.ts          # 디바이스 ID + 초기화 상태
│   ├── tripStore.ts            # 진행 중 Trip 상태 (출발→도착)
│   └── settingsStore.ts        # 버퍼 시간, 알림 설정 로컬 캐시
│
├── types/
│   ├── api.types.ts            # 공용 API 응답 래퍼 타입
│   ├── trip.types.ts           # Trip, Schedule, RepeatType
│   └── route.types.ts          # ODsay 경로 응답, RouteStep
│
└── utils/
    ├── date.ts
    ├── format.ts               # 분 → "X분 후" 등 표시 포맷
    ├── departure.ts            # 출발 시간 계산 보조 로직
    └── notification.ts         # 알림 스케줄링 헬퍼
```
