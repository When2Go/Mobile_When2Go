# API 스키마

> `/gc` 커맨드가 `src/api/` 코드 분석 후 자동 업데이트.
> 초기 상태 — 프로젝트 스캐폴딩 후 첫 `/gc` 실행 시 채워짐.

---

## Backend API (Spring Boot)

| Method | Path | 설명 | 요청 타입 | 응답 타입 |
|--------|------|------|---------|---------|
| POST | /devices | 디바이스 등록 | `{ deviceId }` | `Device` |
| GET | /trips | Trip 목록 조회 | — | `Trip[]` |
| POST | /trips | Trip 생성 | `CreateTripRequest` | `Trip` |
| PATCH | /trips/{id}/depart | 출발 처리 | — | `Trip` |
| PATCH | /trips/{id}/arrive | 도착 처리 | — | `Trip` |
| DELETE | /trips/{id} | Trip 삭제 | — | — |
| GET | /trips/{id}/route | 경로 결과 조회 | — | `RouteResult` |
| GET | /settings | 설정 조회 | — | `UserSettings` |
| PATCH | /settings | 설정 업데이트 | `UpdateSettingsRequest` | `UserSettings` |
| POST | /notifications/token | FCM 토큰 등록 | `{ token }` | — |
