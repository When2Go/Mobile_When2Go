# 컴포넌트 목록

> `/gc` 커맨드가 `src/components/` 스캔 후 갱신. 마지막 갱신: 2026-05-15.
> 본 파일은 자동 생성을 의도하지만 현재는 수동 갱신 중. 컴포넌트 추가/삭제/이동 시 같은 PR에 같이 반영.

---

## 공용 컴포넌트 (`src/components/common/`)

| 컴포넌트 | 경로 | 설명 |
|---|---|---|
| AdSlot | `common/AdSlot.tsx` | 광고 placeholder. 실제 광고 SDK 연동은 앱 심사 통과 후 별도 이슈 |
| BottomSheetModal | `common/BottomSheetModal.tsx` | `@gorhom/bottom-sheet` 래퍼. 모든 시트는 이 래퍼만 사용 |
| BufferSheetBody | `common/BufferSheetBody.tsx` | 안전 버퍼(분) 슬라이더 시트 본문. 마이페이지·Setup 양쪽에서 재사용 |
| MobileLayout | `common/MobileLayout.tsx` | 하단 탭 + SafeArea 포함 모바일 셸 |

## Home (`src/components/home/`)

| 컴포넌트 | 경로 | 설명 |
|---|---|---|
| FavoriteRoutes | `home/FavoriteRoutes.tsx` | 즐겨찾기 경로 카드 그리드 |
| MapPreview | `home/MapPreview.tsx` | 홈 상단 지도 미리보기 |
| RecentDestinations | `home/RecentDestinations.tsx` | 최근 목적지 리스트 |
| SearchEntryBar | `home/SearchEntryBar.tsx` | 홈 상단 검색 진입 바 (`/search` 라우트 이동) |

## Search (`src/components/search/`)

| 컴포넌트 | 경로 | 설명 |
|---|---|---|
| RecentSearchList | `search/RecentSearchList.tsx` | 최근 검색어 리스트 (mock, 개별/전체 삭제) |
| SearchInput | `search/SearchInput.tsx` | 검색 입력창 (자동 포커스, 클리어 버튼) |
| SearchResultList | `search/SearchResultList.tsx` | 검색 결과 mock 필터 리스트 |
| VoiceButton | `search/VoiceButton.tsx` | 음성 입력 트리거 버튼 |
| VoiceModal | `search/VoiceModal.tsx` | 음성 인식 listening / processing 모달 |

## Routes (`src/components/routes/`)

| 컴포넌트 | 경로 | 설명 |
|---|---|---|
| EmptyState | `routes/EmptyState.tsx` | 경로 없을 때 빈 상태 + 추가 CTA |
| RouteEditModal | `routes/RouteEditModal.tsx` | 경로 추가/수정 BottomSheet (이름·출발·목적·빈도) |
| RouteListItem | `routes/RouteListItem.tsx` | 경로 카드 + 좌측 스와이프 삭제 |

## Result (`src/components/result/`)

| 컴포넌트 | 경로 | 설명 |
|---|---|---|
| DepartureTimeHeader | `result/DepartureTimeHeader.tsx` | 결과 화면 상단 출발 시간 헤더 |
| ReservationCompleteModal | `result/ReservationCompleteModal.tsx` | 예약 완료 BottomSheet |
| RouteCard | `result/RouteCard.tsx` | 다중 경로 결과 카드 |

## Repeat (`src/components/repeat/`)

| 컴포넌트 | 경로 | 설명 |
|---|---|---|
| EmptyState | `repeat/EmptyState.tsx` | 반복 예약 없을 때 빈 상태 + 첫 예약 CTA |
| RepeatEditModal | `repeat/RepeatEditModal.tsx` | 반복 예약 추가/수정 BottomSheet (요일 멀티셀렉트 + 시간 wheel + 경로 옵션) |
| RepeatReservationCard | `repeat/RepeatReservationCard.tsx` | 반복 예약 카드 + 활성/비활성 토글 + 좌측 스와이프 삭제 |

## Schedule (`src/components/schedule/`)

| 컴포넌트 | 경로 | 설명 |
|---|---|---|
| CalendarHeader | `schedule/CalendarHeader.tsx` | 월 헤더 + grid-7 미니 캘린더 (오늘/선택/dot 강조) |
| EmptyState | `schedule/EmptyState.tsx` | 일정 없을 때 빈 상태 카드 |
| MonthPickerSheet | `schedule/MonthPickerSheet.tsx` | 월 선택 BottomSheet |
| ReservationCard | `schedule/ReservationCard.tsx` | 예약 카드(스와이프 삭제 포함) |
| ScheduleDetailSheet | `schedule/ScheduleDetailSheet.tsx` | 예약 상세 BottomSheet |
| ScheduleHeaderActions | `schedule/ScheduleHeaderActions.tsx` | 신규 일정·필터 액션 행 |

## Setup (`src/components/setup/`)

| 컴포넌트 | 경로 | 설명 |
|---|---|---|
| ArrivalChipHeader | `setup/ArrivalChipHeader.tsx` | "도착" + 날짜/시간 토글 칩 |
| ArrivalTimePicker | `setup/ArrivalTimePicker.tsx` | 칩 헤더 + (캘린더 \| 휠) 분기 + 안전 버퍼 박스 오케스트레이터 |
| DateCalendarPicker | `setup/DateCalendarPicker.tsx` | 월 그리드 캘린더 (`minDate`로 과거 날짜 비활성) |
| DepartButton | `setup/DepartButton.tsx` | 출발 시간 계산 CTA |
| DestinationHeader | `setup/DestinationHeader.tsx` | 목적지 표시 + 변경 버튼 |
| RouteOptionList | `setup/RouteOptionList.tsx` | 지하철+버스 / 지하철만 / 버스만 단일 선택 카드 |
| TimeWheelPicker | `setup/TimeWheelPicker.tsx` | 오전·오후 / 시 / 분 3열 휠 (mock 탭 동작, 실제 휠 제스처는 #34) |

## MyPage (`src/components/mypage/`)

| 컴포넌트 | 경로 | 설명 |
|---|---|---|
| DarkModeRow | `mypage/DarkModeRow.tsx` | 다크모드 토글 행 |
| NotificationSettingsRow | `mypage/NotificationSettingsRow.tsx` | 알림 설정(시스템 설정 앱 진입) |
| ProfileHeader | `mypage/ProfileHeader.tsx` | 프로필 헤더(닉네임·게스트 표시) |
| RepeatReservationLink | `mypage/RepeatReservationLink.tsx` | 반복 예약 진입 링크 |
| SafetyBufferRow | `mypage/SafetyBufferRow.tsx` | 안전 버퍼(분) 현재값 + 시트 트리거 |
| TermsLink | `mypage/TermsLink.tsx` | 약관 링크 |
| VersionRow | `mypage/VersionRow.tsx` | 앱 버전 표시 |

---

## 화면 (`app/`)

| 라우트 | 파일 | 상태 |
|---|---|---|
| `/` | `app/index.tsx` | 홈 |
| `/_layout` | `app/_layout.tsx` | 루트 layout (Theme/Stack/BottomSheetProvider) |
| `/search` | `app/search.tsx` | 검색 (mock) |
| `/setup` | `app/setup.tsx` | 도착 시간 + 경로 옵션 (mock, PR #33) |
| `/schedule` | `app/schedule.tsx` | 일정 |
| `/routes` | `app/routes.tsx` | 자주 쓰는 경로 관리 (mock, PR #37) |
| `/result` | `app/result.tsx` | 출발 시간 결과 + 다중 경로 (mock, PR #38) |
| `/repeat` | `app/repeat.tsx` | 반복 예약 관리 (mock, PR #42) |
| `/mypage` | `app/mypage.tsx` | 마이페이지 |

---

## 컨벤션 메모

- 모든 시각 컴포넌트는 `useTheme().isDark`로 다크모드 분기 필수.
- 시맨틱 토큰만 사용. 하드코딩 hex 금지. RN style API가 필요한 케이스(`shadowColor`, `TextInput style.color`)는 `PALETTE` 토큰 경유.
- 도메인 폴더 분리: `common/`만 공용. 그 외는 화면 도메인(`home/`, `search/`, `setup/` 등)에 속함. 두 화면 이상에서 쓰이면 `common/`으로 승격.
