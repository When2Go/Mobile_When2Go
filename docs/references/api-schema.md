# API 스키마

> Spring Boot 백엔드 API. **OpenAPI(Swagger) 명세 기준 동기화 (2026-06-17).**
> 출처: `https://when2go.qzz.io/v3/api-docs` (`openapi 3.1.0`, `info.version: v0`).
> 향후 `src/api/` 구현 후에는 `/gc` 커맨드가 코드와 본 문서를 자동 동기화한다.

---

## 공통

- **Base URL**: `/api`
- **인증 헤더**: `X-Device-Id: {deviceId}` — axios 인터셉터가 모든 요청에 자동 주입
  - **예외(헤더 불필요)**: `POST /api/users`, `POST /api/routes/search` 는 디바이스 헤더 없이 호출
- **응답 봉투** (성공/실패 공통 — 모든 엔드포인트):
  ```json
  { "success": boolean, "code": string, "message": string, "data": T | null }
  ```
  > ⚠️ 이전 명세(v2)에서는 `code` 필드가 `POST /api/routes/search`에만 있었으나, 현재 백엔드는 **모든 응답 봉투에 `code`가 포함**된다.
- **에러 처리**: axios 인터셉터에서 전역 처리. 4xx/5xx 또는 `success: false` 발생 시 사용자 토스트 + 로깅
- **성공 상태코드**: 생성(POST) 포함 성공은 **`200`** (이전 명세의 `201`은 더 이상 사용하지 않음)
- **시간 포맷**: 절대 시각은 ISO 8601 (`2026-05-05T14:30:00`)

---

## 엔드포인트 요약

| Method | Path | 도메인 | 설명 | 헤더 |
|--------|------|--------|------|------|
| POST   | `/api/users`                        | user        | 디바이스 기반 사용자 등록/조회 | — |
| GET    | `/api/users/status`                 | user        | 회원 등록 여부 확인 (`exists`) | X-Device-Id |
| PATCH  | `/api/users/me/fcm-token`           | user        | FCM 토큰 갱신 | X-Device-Id |
| POST   | `/api/trips`                        | trip        | 여정(Trip) 생성 | X-Device-Id |
| GET    | `/api/trips`                        | trip        | 여정 목록 (status/date 필터) | X-Device-Id |
| GET    | `/api/trips/{tripId}`               | trip        | 여정 상세 | X-Device-Id |
| DELETE | `/api/trips/{tripId}`               | trip        | 여정 삭제(취소) | X-Device-Id |
| POST   | `/api/reservations`                 | reservation | 예약 생성 (반복) | X-Device-Id |
| DELETE | `/api/reservations/{reservationId}` | reservation | 예약 삭제 | X-Device-Id |
| POST   | `/api/routes/search`                | route       | 대중교통 경로 검색 (Google Routes 프록시) | — |

> `GET /api/test/*` 4종(test-controller)은 백엔드 테스트용이라 프론트 연동 대상이 아니다.

### ⚠️ 이전 명세(v2)에 있었으나 현재 백엔드(Swagger)에 없는 엔드포인트

프론트에서 기대했으나 현재 백엔드에 **미구현/제거**된 항목. 연동 전 백엔드와 상태 확인 필요.

| Method | Path | 비고 |
|--------|------|------|
| POST   | `/api/parse/schedule`               | parse 도메인 전체 미존재 (자연어 일정 파싱) |
| GET    | `/api/users/me`                     | 대신 `GET /api/users/status` 제공 |
| PATCH  | `/api/users/me`                     | 버퍼 시간 등 설정 변경 미존재 |
| GET    | `/api/reservations`                 | 예약 목록 조회 미존재 |
| PUT    | `/api/reservations/{reservationId}` | 예약 수정 미존재 |

> 또한 FCM 토큰 갱신 메서드가 `PUT` → **`PATCH`** 로 변경됨.

---

## ENUM 카탈로그

| ENUM | 값 | 사용처 |
|------|-----|-------|
| `Platform`           | `IOS`, `ANDROID` | 사용자 등록 |
| `TripStatus`         | `PENDING`, `SCHEDULED`, `COMPLETED` | Trip 상태 |
| `RouteOption`        | `DRIVE`, `WALK`, `BICYCLE`, `TRANSIT` | 예약 생성 (`routeOption`) |
| `RepeatDay`          | `MONDAY` ~ `SUNDAY` (대문자) | 예약 반복 요일 |
| `NotificationMode`   | `SOUND`, `VIBRATE`, `SOUND_AND_VIBRATE` | 사용자 응답 |

> ⚠️ **이전 명세 대비 변경점**
> - `TripStatus`: `IN_PROGRESS`, `CANCELLED` 가 **제거**됨 (3개로 축소).
> - 예약 `routeOption`: 이전 명세의 `OPTIMAL/MIN_TRANSFER/MIN_COST`(또는 `DEFAULT/BUS_ONLY/SUBWAY_ONLY`)에서 Google 이동수단 enum **`DRIVE/WALK/BICYCLE/TRANSIT`** 으로 전면 교체.
> - Trip 생성의 `RouteType` enum은 현재 백엔드 요청 스키마에 **존재하지 않음** (`TripCreateRequest`에서 제거, 아래 참조).
> - 경로 응답의 `travelMode`(Step)와 `vehicle.type`(TransitDetails)은 enum이 아닌 **자유 문자열**(`WALK`/`TRANSIT`, `BUS`/`SUBWAY` 등 Google 값)이다.

---

## 1. user — 사용자 · FCM

### POST `/api/users` — 신규 등록 / 기존 반환  *(헤더 불필요)*

**Request** (`UserRegisterRequest`)

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `deviceId` | string | X | UUID |
| `platform` | `Platform` | X | `IOS` / `ANDROID` |
| `fcmToken` | string | **X** | 푸시 토큰 — **현재 required** (이전 명세는 옵션) |

**Response** (`data: UserResponse`)

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `userId` | number (int64) | X |  |
| `deviceId` | string | X |  |
| `platform` | `Platform` | X |  |
| `bufferMinutes` | number (int32) | X | 안전 버퍼 분 |
| `notificationMode` | `NotificationMode` | X |  |
| `widgetEnabled` | boolean | X |  |
| `createdAt` | string (ISO 8601) | X |  |

**Status**: `200` (신규 등록 · 동일 디바이스 재요청 — upsert 멱등) / `400` 필드 오류(`deviceId` 누락·36자 아님 / `fcmToken` 누락)

### GET `/api/users/status` — 등록 여부 확인

**Request**: 헤더 `X-Device-Id: {deviceId}` (axios 인터셉터가 자동 주입)

**Response** (`data`)

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `exists` | boolean | X | 해당 deviceId 회원 등록 여부 |

**Status**: `200` / `400` (`X-Device-Id` 누락 또는 36자 아님)

> 앱 시작 시 호출. `exists=false`이면 `POST /api/users`로 등록 흐름 진입.

### PATCH `/api/users/me/fcm-token`

**Request** (`FcmTokenUpdateRequest`): `{ "fcmToken": string }` (헤더 `X-Device-Id` 필수, `fcmToken` 512자 이하)

**Response** (`data`)

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `userId` | number | X |  |
| `deviceId` | string | X |  |
| `fcmToken` | string | X | 갱신된 토큰 |

**Status**: `200` (동일 토큰 재전송도 `200` — 멱등) / `400` (토큰 누락 · 512자 초과 · `X-Device-Id` 누락/형식 오류) / `404` (미등록 디바이스 — `POST /api/users` 선행 필요)

---

## 2. trip — 여정 (일회성, 즉시형)

### POST `/api/trips` — 여정 생성

**Request** (`TripCreateRequest`)

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `originName` | string | X | 출발지명 |
| `originLat` / `originLng` | number (double) | X | 출발지 좌표 |
| `destName` | string | X | 목적지명 |
| `destLat` / `destLng` | number (double) | X | 목적지 좌표 |
| `arrivalTime` | string `yyyy-MM-dd HH:mm` | X | 도착 목표 시각. **⚠️ 공백 구분 · T/초/오프셋 불가** — `T`나 초(`:00`)가 붙으면 `GLOBAL_004 잘못된 JSON 형식`(400)으로 거부됨 (2026-06-17 probe 확인). |
| `bufferMinutes` | number (int32) | X | 안전 버퍼 분 |
| `durationSeconds` | number (int32) | X | 예상 소요 시간(초) — **신규 필수 필드** |

> ⚠️ 이전 명세의 `routeType`(`RouteType`)은 현재 요청 스키마에 **없다**. 대신 `durationSeconds`가 추가됨.

**Response**: `data: ApiResponse` 봉투 (생성된 여정 식별자 반환). 상세 구조는 Swagger상 제네릭 봉투로만 노출됨.
**Status**: `200` / `400` 필드 누락 / `404`

### GET `/api/trips` — 목록

**Query Parameters**

| key | 타입 | Required | 설명 |
|-----|------|----------|------|
| `status` | `TripStatus` | **O** | 상태 필터 |
| `date` | string (date) | **O** | 날짜 필터 (예: `2026-10-27`) |

> ⚠️ Swagger 기준 `status`·`date` **둘 다 필수 쿼리 파라미터**다.

**Response** (`data: Array<TripListResponse>`)

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `tripId` | number (int64) | X |  |
| `originName` / `destName` | string | X |  |
| `arrivalTime` | string (ISO 8601) | X |  |
| `finalDepartureTime` | string (ISO 8601) | O | 확정 출발 시각 |
| `status` | `TripStatus` | X |  |

**Status**: `200` / `400`

### GET `/api/trips/{tripId}` — 상세

**Response** (`data: TripDetailResponse`)

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `tripId` | number (int64) | X |  |
| `originName` / `destName` | string | X |  |
| `originLat` / `originLng` / `destLat` / `destLng` | number (double) | X | 좌표 |
| `arrivalTime` | string (ISO 8601) | X |  |
| `bufferMinutes` | number (int32) | X |  |
| `finalDepartureTime` | string (ISO 8601) | O |  |
| `status` | `TripStatus` | X |  |
| `updatedAt` | string (ISO 8601) | X |  |

> ⚠️ 이전 명세에 있던 `routeType`, `routes[].steps`(경로 단계)는 현재 상세 응답에 **없다**. 경로 단계 정보는 `POST /api/routes/search` 응답에서만 제공된다.

**Status**: `200` / `404` (없음 또는 타인 소유)

### DELETE `/api/trips/{tripId}`

**Response**: `data: null`
**Status**: `200` / `404`

---

## 3. reservation — 예약 (반복)

> ⚠️ 현재 백엔드는 **생성·삭제만** 제공한다. 목록 조회(`GET`)·수정(`PUT`)은 미구현.

### POST `/api/reservations`

**Request** (`ReservationCreateRequest`)

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `nickname` | string | O |  |
| `originName` | string | X |  |
| `originLat` / `originLng` | number (double) | X |  |
| `destName` | string | X |  |
| `destLat` / `destLng` | number (double) | X |  |
| `routeOption` | `RouteOption` | X | `DRIVE` / `WALK` / `BICYCLE` / `TRANSIT` |
| `arrivalTime` | string | X | 시각 문자열 (포맷 제약은 스펙에 명시 없음) |
| `repeatDays` | `RepeatDay[]` | X | 반복 요일 배열 (최소 1개, 중복 불가) |

**Response**: `data: ApiResponse` 봉투
**Status**: `200` / `400` / `404`

### DELETE `/api/reservations/{reservationId}`

**Response**: `data: null`
**Status**: `200` / `400` / `403` (타인 소유) / `404`

---

## 4. route — 경로 탐색

### POST `/api/routes/search`  *(헤더 불필요)*

> Google Maps Routes API 기반. 응답은 Google Routes 원형(`GoogleRouteSearchResponse`)을 봉투에 그대로 감싼 형태.

**Request** (`RouteSearchRequest`)

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `originLat` / `originLng` | number (double) | X | 출발지 좌표 |
| `destLat` / `destLng` | number (double) | X | 목적지 좌표 |
| `arrivalTime` | string (date-time) | X | 도착 목표 시각 (예: `2026-05-22 13:30`) |

**Response** (`data: GoogleRouteSearchResponse`)

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `routes` | `Route[]` | X | 경로 후보 목록 |
| `geocodingResults` | object | O | Google 지오코딩 결과 |

**`Route`**

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `legs` | `Leg[]` | X | 경로 구간 목록 |
| `distanceMeters` | number (int32) | X | 전체 이동 거리(m) |
| `duration` | string | X | 전체 소요 시간 (`"Xs"`) |
| `staticDuration` | string | X | 교통 미반영 소요 시간 |
| `polyline.encodedPolyline` | string | O | 전체 폴리라인 |
| `viewport` | `{low, high: LatLng}` | O | 표시 영역 |
| `travelAdvisory.transitFare` | `TransitFare` | O | 요금 정보 |
| `localizedValues` | `LocalizedValues` | O | 표시용 거리/시간 텍스트 |
| `routeLabels` | string[] | O | `["DEFAULT_ROUTE"]` 등 |

**`Leg`**

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `distanceMeters` | number (int32) | X |  |
| `duration` / `staticDuration` | string | X |  |
| `polyline.encodedPolyline` | string | O |  |
| `startLocation.latLng` / `endLocation.latLng` | `{latitude, longitude}` | X | 구간 출발/도착 좌표 |
| `steps` | `Step[]` | X | 세부 이동 단계 |
| `localizedValues` | `LocalizedValues` | O |  |
| `stepsOverview.multiModalSegments` | `MultiModalSegment[]` | O | 이동수단 구간 요약 |

**`Step`**

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `travelMode` | string | X | `WALK` / `TRANSIT` 등 |
| `distanceMeters` | number (int32) | X |  |
| `staticDuration` | string | X | `"Xs"` |
| `polyline.encodedPolyline` | string | O |  |
| `startLocation` / `endLocation` | `Location` | O |  |
| `navigationInstruction.instructions` | string | O | 이동 안내 문구 |
| `localizedValues` | `LocalizedValues` | O |  |
| `transitDetails` | `TransitDetails` | O | `TRANSIT`일 때만 |

**`TransitDetails`**

| key | 타입 | Nullable | 설명 |
|-----|------|----------|------|
| `stopDetails.departureStop.name` | string | O | 승차 정류장/역 |
| `stopDetails.arrivalStop.name` | string | O | 하차 정류장/역 |
| `stopDetails.departureTime` | string | O | 승차 시각 |
| `stopDetails.arrivalTime` | string | O | 하차 시각 |
| `localizedValues.departureTime.time.text` | string | O | 표시용 승차 시각 |
| `localizedValues.arrivalTime.time.text` | string | O | 표시용 하차 시각 |
| `headsign` | string | O | 행선지 |
| `headway` | string | O | 배차 간격 |
| `transitLine.name` / `transitLine.nameShort` | string | O | 노선명/약칭 |
| `transitLine.color` / `transitLine.textColor` | string | O | 노선 색상 |
| `transitLine.vehicle.type` | string | O | `BUS` / `SUBWAY` 등 |
| `transitLine.vehicle.name.text` | string | O | 차량 표시명 |
| `transitLine.agencies[].name` | string | O | 운수사 |
| `stopCount` | number (int32) | O | 정차 수 |

**Status**: `200` / `400` 요청값 검증 실패

---

## 폴더 구조 영향

`docs/folder-structure.md`의 `src/api/` 도메인 분할은 현재 백엔드(Swagger)에 맞춰 다음과 같이 정리한다 (별도 PR로 처리):

| 도메인 폴더 | 대응 엔드포인트 |
|------------|----------------|
| `user/`        | `POST /api/users`, `GET /api/users/status`, `PATCH /api/users/me/fcm-token` |
| `trip/`        | `POST·GET /api/trips`, `GET·DELETE /api/trips/{tripId}` |
| `reservation/` | `POST /api/reservations`, `DELETE /api/reservations/{reservationId}` |
| `route/`       | `POST /api/routes/search` |

> `parse/` 도메인은 백엔드 미구현이므로 폴더를 만들지 않는다. 예약 목록/수정, 사용자 설정 변경(`PATCH /api/users/me`)도 백엔드 구현 후 반영한다.

각 도메인 폴더 구조: `src/api/{domain}/{index.ts, types.ts}` 패턴 유지.
