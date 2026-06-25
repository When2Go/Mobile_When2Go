# iOS Live Activity / Dynamic Island (F-W01, F-W03~F-W06)

출발 타이밍을 iOS 잠금화면·Dynamic Island 에 띄우는 ActivityKit Live Activity 구현 메모.
인앱 미리보기(#13)가 아닌 **실제 OS 레벨 위젯**이다.

## 구성

| 영역 | 위치 | 역할 |
| --- | --- | --- |
| 위젯 익스텐션 | `targets/widget/` | SwiftUI 뷰(잠금화면 카드·Dynamic Island). `@bacons/apple-targets` 가 prebuild 때 타겟으로 묶음 |
| 공유 데이터 모델 | `targets/widget/Attributes.swift` ↔ `modules/when2go-live-activity/ios/When2GoActivityAttributes.swift` | 두 파일은 **구조 100% 동일**해야 함(ActivityKit 매칭 조건) |
| 네이티브 브리지 | `modules/when2go-live-activity/` | RN → ActivityKit start/update/end + push 토큰. 로컬 Expo 모듈 |
| JS 래퍼 | `src/modules/liveActivity.ts` | `@/` 별칭 배럴 |
| 계산 로직 | `src/utils/liveActivity/contentState.ts` | FCM data 파싱·남은 시간·진행도·종료 판단(순수, 테스트 있음) |
| 라이프사이클 훅 | `src/hooks/widget/useLiveActivity.ts` | 토큰 등록 + 포그라운드 시작 + 로컬 틱 갱신/종료 |

## 라이프사이클

1. **시작** — 백엔드가 "출발 10분 전" 시점에 APNs `push-to-start` 푸시를 보내면 앱이 꺼져 있어도
   OS 가 Activity 를 띄운다. 앱이 포그라운드면 동일 내용의 FCM data 메시지(`type: DEPARTURE_LIVE_ACTIVITY`)로
   `useLiveActivity` 가 로컬 시작(폴백)한다.
2. **갱신** — 앱이 떠 있는 동안에는 `useLiveActivity` 가 15초마다 남은 분·진행도를 다시 계산해 `update`.
   앱이 꺼져 있으면 백엔드 APNs 푸시가 갱신한다.
3. **종료** — 첫 대중교통 탑승 시각(`boardingEpoch`)에 도달하면 종료한다. 로컬 틱이 `end` 를 호출하고,
   네이티브에서 `staleDate` 를 탑승 시각으로 잡아 두어 앱이 꺼져 있어도 카드가 흐려진다.
   위젯 끄기(F-W06)는 `LiveActivity.end(false)` 로 즉시 제거한다.

## FCM data 메시지 계약 (백엔드 협의 대상)

값은 모두 문자열(FCM data 규약). 필수 필드 누락·숫자 파싱 실패 시 시작하지 않는다.

```
type:               "DEPARTURE_LIVE_ACTIVITY"
destination:        "강남역"
transitName:        "수인분당선"
transitStation:     "인하대역 승강장"
boardingStationName:"인하대역"
arrivalTimeText:    "오후 2:05"
transitMinutes:     "4"
transitTimeText:    "오후 1:27"
progress:           "0.42"      # 0~1, 범위 밖이면 클램프
llmMessage:         "지금 나가면 딱 맞아요! 🚶‍♂️"
llmSub:             "도보 12분 → 인하대역"
boardingEpoch:      "1719300420"  # 탑승 시각 unix epoch(초)
departEpoch:        "1719299820"  # (선택) 출발 기준 시각. 없으면 boardingEpoch - transitMinutes*60
```

## 백엔드 의존(이번 PR 범위 밖)

- ActivityKit 푸시는 **FCM 이 아니라 APNs 직접 전송**이 필요하다(`apns-push-type: liveactivity`).
- 프론트는 토큰만 보낸다: push-to-start 토큰 / Activity 별 업데이트 토큰을
  `PATCH /api/users/me/live-activity-token` 로 전송(`src/api/notification`). **엔드포인트는 협의 후 확정.**
- 실제 푸시 전송 서버·토큰 저장은 백엔드 레포에서 구현한다.

## 빌드 (실기기, 사용자 실행)

`ios/` 는 gitignore 대상이라 위젯 타겟은 prebuild 로 생성된다. JS 변경과 달리 **네이티브 재빌드 필요**.

```bash
# Apple Team ID 를 .env 에 넣어 익스텐션 서명이 메인 앱과 묶이게 한다.
echo "EXPO_APPLE_TEAM_ID=XXXXXXXXXX" >> .env

# EAS development 빌드(권장) — 실기기 설치
eas build --profile development --platform ios

# 또는 로컬 prebuild + 실기기 실행
npx expo prebuild -p ios --clean
npx expo run:ios --device
```

App Group `group.kr.co.when2go.app` 은 메인 앱·위젯 타겟 양쪽 entitlement 에 동일하게 들어간다
(Apple Developer 포털에 App Group 등록 + 프로비저닝 프로파일 갱신 필요).

## 확인 항목

- 잠금화면 하단에 Live Activity 카드(LLM 메시지·🏃 프로그레스·대중교통 배지) 표시
- Dynamic Island compact(번개+남은 분) → 탭 → expanded 전환
- 시간이 흐르며 남은 분·진행도 갱신, 탑승 시각에 카드 종료
- 설정에서 Live Activity 끄면 `areActivitiesEnabled()` false → 시작 안 함
