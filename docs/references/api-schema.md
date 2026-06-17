# API 스키마

> Spring Boot 백엔드 API. `~/Desktop/api_spec_v2.md` 명세 기준 (2026-05-08 동기화).
> 향후 `src/api/` 구현 후에는 `/gc` 커맨드가 코드와 본 문서를 자동 동기화한다.

---

## 공통

- **Base URL**: `/api`
- **인증 헤더**: `X-Device-Id: {deviceId}` — axios 인터셉터가 모든 요청에 자동 주입
- **응답 봉투** (성공/실패 공통):
  ```json
  { "success": boolean, "data": T | null, "message": string | null }
  ```
- **에러 처리**: axios 인터셉터에서 전역 처리. 4xx/5xx 또는 `success: false` 발생 시 사용자 토스트 + 로깅
- **시간 포맷**: 절대 시각은 ISO 8601 (`2026-05-05T14:30:00`), 시각만은 `HH:mm`

---

## 엔드포인트 요약

| Method | Path | 도메인 | 설명 |
|--------|------|--------|------|
| POST   | `/api/parse/schedule`             | parse       | 자연어 일정 파싱 |
| POST   | `/api/trips`                      | trip        | 일정(Trip) 생성 |
| GET    | `/api/trips`                      | trip        | 일정 목록 (status/date 필터) |
| GET    | `/api/trips/{tripId}`             | trip        | 일정 상세 + 경로 단계 |
| DELETE | `/api/trips/{tripId}`             | trip        | 일정 삭제(취소) |
| POST   | `/api/users`                      | user        | 디바이스 기반 사용자 등록/조회 |
| GET    | `/api/users/me`                   | user        | 현재 사용자 조회 |
| PATCH  | `/api/users/me`                   | user        | 설정 변경 (버퍼 시간 등) |
| PUT    | `/api/users/me/fcm-token`         | user        | FCM 토큰 갱신 |
| POST   | `/api/reservations`               | reservation | 예약 생성 (1회/반복) |
| GET    | `/api/reservations`               | reservation | 예약 목록 |
| PUT    | `/api/reservations/{reservationId}` | reservation | 예약 수정 |
| DELETE | `/api/reservations/{reservationId}` | reservation | 예약 삭제 |
| GET    | `/api/routes/search`              | route       | 대중교통 경로 후보 (ODsay 프록시) |

---

## ENUM 카탈로그

| ENUM | 값 | 사용처 |
|------|-----|-------|
| `Platform`           | `IOS`, `ANDROID` | 사용자 등록 |
| `TripStatus`         | `PENDING`, `SCHEDULED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` | Trip 상태 |
| `RouteOption`        | `DEFAULT`, `BUS_ONLY`, `SUBWAY_ONLY` | 예약 · 경로 탐색 |
| `RouteType` (Trip)   | `OPTIMAL`, `MIN_TRANSFER`, `MIN_COST` | Trip 생성 시 (※ 명세 차이 — 백엔드와 통일 필요) |
| `StepType`           | `WALK`, `SUBWAY`, `BUS` | 경로 단계 |
| `RepeatDay`          | `MONDAY` ~ `SUNDAY` (대문자) | 예약 반복 요일 |
| `NotificationMode`   | `SOUND`, `VIBRATE`, `SOUND_AND_VIBRATE` | 알림 모드 |

> ⚠️ Trip 생성 시 `routeType`(OPTIMAL/MIN_TRANSFER/**MIN_COST**)과 예약/경로의 `routeOption`(OPTIMAL/MIN_TRANSFER/**SUBWAY_FIRST/BUS_ONLY**)이 명세상 분리되어 있다. FE에서는 `src/constants/routeOptions.ts`에 별도 정의하고, 백엔드와 통일 합의 후 정리.

---

## 1. parse — 자연어 일정 파싱

### POST `/api/parse/schedule`

**Request**

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `text` | string | X | 사용자 자연어 입력 (예: "내일 2시 강남역 도착") |
| `currentDateTime` | string (ISO 8601) | X | 클라이언트 현재 시각 |

**Response**

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `destName` | string | X | 파싱된 목적지 |
| `arrivalTime` | string (ISO 8601) | X | 절대 시각으로 변환된 도착 시각 |
| `originName` | string | O | 파싱된 출발지 (없으면 null) |

**Status**: `200` 성공 / `400` 필수 누락 / `422` 인식 실패 → 앱에서 재입력 유도

---

## 2. user — 사용자 · 설정 · FCM

### POST `/api/users` — 신규 등록 / 기존 반환

**Request**

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `deviceId` | string | X | UUID |
| `platform` | `Platform` | X | `IOS` / `ANDROID` |
| `fcmToken` | string | O | 푸시 토큰 (옵션) |

**Response** (`User`):

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `userId` | number | X |  |
| `deviceId` | string | X |  |
| `platform` | `Platform` | X |  |
| `bufferMinutes` | number | X | 안전 버퍼 분 |
| `notificationMode` | `NotificationMode` | X |  |
| `widgetEnabled` | boolean | X |  |
| `createdAt` | string (ISO 8601) | X |  |

**Status**: `201` 신규 / `200` 기존 디바이스 / `400` 필드 오류

### GET `/api/users/me`

응답: `User` 동일. **Status**: `200` / `401` (X-Device-Id 없음 또는 미등록)

### PATCH `/api/users/me`

**Request**: `{ "bufferMinutes": number }`
**Response**: `{ "userId": number, "bufferMinutes": number }`
**Status**: `200` / `400` (음수) / `401`

### PUT `/api/users/me/fcm-token`

**Request**: `{ "fcmToken": string }`
**Response**: `data: null`, `message: "FCM 토큰이 갱신되었습니다."`
**Status**: `200` / `400` (토큰 누락) / `401`

---

## 3. trip — 일정 (일회성, 즉시형)

### POST `/api/trips` — 일정 생성

**Request**

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `originName` / `originLat` / `originLng` | string / number / number | X | 출발지 |
| `destName` / `destLat` / `destLng`       | string / number / number | X | 목적지 |
| `arrivalTime` | string (ISO 8601) | X | 도착 목표 절대 시각 |
| `routeType` | `RouteType` | X | `OPTIMAL` / `MIN_TRANSFER` / `MIN_COST` |
| `bufferMinutes` | number | X |  |

**Response** (`Trip`):

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `tripId` | number | X |  |
| `status` | `TripStatus` | X | 생성 직후 `PENDING` |
| `originName` / `destName` | string | X |  |
| `arrivalTime` | string (ISO 8601) | X |  |
| `bufferMinutes` | number | X | 생성 시점 스냅샷 |
| `createdAt` | string (ISO 8601) | X |  |

**Status**: `201` / `400` 필드 누락 또는 `arrivalTime` 23시 초과 / `401`

### GET `/api/trips` — 목록

**Query/Request**

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `status` | `TripStatus` | X | 상태 필터 |
| `date` | date | X | 날짜 필터 (예: `2026-10-27`) |

**Response**: `Array<TripListItem>`

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `tripId` | number | X |  |
| `originName` / `destName` | string | X |  |
| `arrivalTime` | string (ISO 8601) | X |  |
| `finalDepartureTime` | string (ISO 8601) | O | 확정 출발 시각 |
| `status` | `TripStatus` | X |  |

**Status**: `200` / `400` (status 값 오류) / `401`

### GET `/api/trips/{tripId}` — 상세 + 경로

**Response** (`TripDetail`): Trip 필드 전체 +

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `originLat` / `originLng` / `destLat` / `destLng` | number | X | 좌표 |
| `routeType` | `RouteType` | X |  |
| `finalDepartureTime` | string (ISO 8601) | O |  |
| `updatedAt` | datetime | X |  |
| `routes[].steps` | `RouteStep[]` | X | (공통 타입 참조) |

**Status**: `200` / `401` / `404` (없음 또는 타인 소유)

### DELETE `/api/trips/{tripId}`

**Response**: `data: null`, `message: "Trip이 삭제되었습니다."`
**Status**: `200` / `401` / `404`

> ⚠️ v1에 있던 `PATCH /trips/{id}/depart`, `/arrive`는 v2에서 **제거됨**. 출발/도착 처리는 별도 정의 전까지 클라이언트 상태로만 표현.

---

## 4. reservation — 예약 (1회 / 반복)

### POST `/api/reservations`

**Request**

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `nickname` | string | O |  |
| `originName` / `originLat` / `originLng` | string / number / number | X |  |
| `destName` / `destLat` / `destLng`       | string / number / number | X |  |
| `routeOption` | `RouteOption` | X | `OPTIMAL`, `MIN_TRANSFER`, `MIN_COST` |
| `arrivalTime` | string (`HH:mm`) | X | 시각만 |
| `repeatDays` | `RepeatDay[]` | X | 반복 요일 배열 |

**Response** (`Reservation`):

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `reservationId` | number | X |  |
| `nickname` | string | O |  |
| `originName` / `destName` | string | X |  |
| `arrivalTime` | string (`HH:mm`) | X |  |
| `reservationDate` | string | O | ONCE 유형일 때만 (예: `2026-05-10`) |
| `repeatDays` | `RepeatDay[]` | O | REPEAT 유형일 때만 |
| `createdAt` | string (ISO 8601) | X |  |

**Status**: `201` / `400` 필드 누락 또는 유형 불일치 또는 `arrivalTime` 23시 초과 / `401`

> ⚠️ 명세상 `reservationDate` vs `repeatDays` 둘 중 하나만 채워지는 형태인데, 응답 예시는 둘 다 비어 있음. 백엔드와 정렬 필요.

### GET `/api/reservations`

응답: `Array<Reservation>` (응답 키는 `reservationId`/`nickname`/`originName`/`destName`/`arrivalTime`/`reservationDate`/`repeatDays`)
**Status**: `200` / `401`

### PUT `/api/reservations/{reservationId}`

**Request/Response**: 생성과 동일 스키마
**Status**: `200` / `400` / `401` / `404`

### DELETE `/api/reservations/{reservationId}`

**Response**: `data: null`, `message: "예약이 삭제되었습니다."`
**Status**: `200` / `401` / `404`

---

## 5. route — 경로 탐색

### POST `/api/routes/search`

> Google Maps Routes API 기반으로 전환됨 (구 ODsay 제거). 2026-06-05 명세 확정.

**Request Body**

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `originLat` / `originLng` | number | X | 출발지 좌표 |
| `destLat` / `destLng` | number | X | 목적지 좌표 |
| `arrivalTime` | string (`HH:mm`) | X | 도착 목표 시각 |

**Response Envelope** (이 엔드포인트만 `code` 필드 포함):

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `success` | boolean | X |  |
| `code` | string | X | `"OK"` 등 응답 코드 |
| `message` | string | X |  |
| `data.routes` | `RouteCandidate[]` | X |  |

**`RouteCandidate`**

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `distanceMeters` | number | X | 전체 이동 거리 (m) |
| `duration` | string | X | 전체 소요 시간 (Google duration format, `"Xs"`) |
| `staticDuration` | string | X | 교통 상황 미반영 소요 시간 |
| `routeLabels` | string[] | O | `["DEFAULT_ROUTE"]` 등 |
| `localizedValues.distance.text` | string | O | 표시용 거리 (`"5.2 km"`) |
| `localizedValues.duration.text` | string | O | 표시용 소요 시간 (`"24분"`) |
| `legs` | `RouteLeg[]` | X | 경로 구간 목록 |

**`RouteLeg`**

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `polyline.encodedPolyline` | string | O | 지도 표시용 인코딩 폴리라인 |
| `startLocation.latLng` / `endLocation.latLng` | `{latitude, longitude}` | X | 구간 출발/도착 좌표 |
| `localizedValues.duration.text` | string | O | 구간 표시용 시간 |
| `steps` | `RouteStep[]` | X | 세부 이동 단계 |

**`RouteStep`**

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `travelMode` | string | X | `WALK` / `TRANSIT` |
| `distanceMeters` | number | X |  |
| `staticDuration` | string | X | `"Xs"` |
| `localizedValues.staticDuration.text` | string | O | 표시용 단계 시간 |
| `navigationInstruction.instructions` | string | O | 이동 안내 문구 |
| `transitDetails` | `TransitDetails` | O | `TRANSIT`일 때만 제공 |

**`TransitDetails`**

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `stopDetails.departureStop.name` | string | O | 승차 정류장/역 |
| `stopDetails.arrivalStop.name` | string | O | 하차 정류장/역 |
| `stopDetails.departureTime` | string (ISO-8601 UTC) | O | 승차 시각 |
| `stopDetails.arrivalTime` | string (ISO-8601 UTC) | O | 하차 시각 |
| `headsign` | string | O | 행선지 |
| `transitLine.nameShort` | string | O | 노선 번호/약칭 |
| `transitLine.vehicle.type` | string | O | `BUS` / `SUBWAY` 등 |
| `stopCount` | number | O | 정차 수 |

**Status**: `200` / `400` 요청값 검증 실패 / `500` 서버 내부 오류 / `502` Google Routes API 호출 실패

---

## 폴더 구조 영향

`docs/folder-structure.md`의 `src/api/` 도메인 분할은 명세 v2에 맞춰 다음과 같이 갱신 필요 (별도 PR로 처리):

| 기존 | v2 적용 후 |
|------|-----------|
| `device/` | `user/` (디바이스 기반 사용자로 통합) |
| `settings/` | `user/`로 흡수 (`PATCH /api/users/me`) |
| `notification/` | `user/`로 흡수 (`PUT /api/users/me/fcm-token`) |
| `trip/` | `trip/` 유지 (단 depart/arrive 제거) |
| `route/` | `route/` 유지 |
| — | `parse/` 추가 (`POST /api/parse/schedule`) |
| — | `reservation/` 추가 (4종 CRUD) |

각 도메인 폴더 구조: `src/api/{domain}/{index.ts, types.ts}` 패턴 유지.
