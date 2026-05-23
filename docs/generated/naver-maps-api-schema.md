# Naver Maps API Schema (When2Go 프로젝트 사용 범위)

> 자동 생성/유지 대상 문서. 코드 변경 시 함께 갱신.
> 최초 생성: 2026-05-23 (이슈 #57 — 카카오 지도 → 네이버 지도 전환)

본 문서는 When2Go가 사용하는 **`@mj-studio/react-native-naver-map`**(네이버 클라우드 플랫폼 Mobile Dynamic Map SDK 래퍼)의 사용 범위를 정리한다. 모든 지도 관련 신규 작업은 이 문서를 1차 자료로 참조한다.

## 0. 비용 정책 (필수)

본 프로젝트는 **Mobile Dynamic Map(SDK 호출) 한정 사용**. 그 외 NCP Maps 부가 API는 과금 위험으로 전부 금지한다.

| 항목 | 사용 | 비고 |
|---|---|---|
| Mobile Dynamic Map (앱 내 지도/마커/오버레이 렌더) | ✅ 무제한 무료 | 본 문서 범위 |
| Geocoding (주소 → 좌표) | ❌ 금지 | 과금. 필요 시 별도 이슈에서 정책 재검토 |
| Reverse Geocoding (좌표 → 주소) | ❌ 금지 | 동상 |
| Static Map | ❌ 금지 | 동상 |
| Directions / 길찾기 | ❌ 금지 | 동상. 대중교통 경로는 ODsay가 담당 |

**검색은 카카오 Local API 유지** (일 100K 무료, 지도 SDK와 독립). `docs/references/kakao-local-api.md` 참조.

## 1. 패키지

- 이름: `@mj-studio/react-native-naver-map`
- 버전: `^2.8.0` (Android/iOS SDK 3.23.0 — 네이버 신 Maps 단독 상품)
- New Architecture / Fabric 정식 지원
- Expo Config Plugin 정식 제공
- 리포: https://github.com/mym0404/react-native-naver-map
- 문서: https://rnnavermap.mjstudio.net

## 2. 환경변수

`.env` (gitignore):

```
EXPO_PUBLIC_NAVER_MAP_NCP_KEY_ID=<NCP 콘솔에서 발급한 Client ID(=NCP Key ID)>
```

- 발급 경로: NCP 콘솔 → AI·NAVER API → Maps → Application 등록
- iOS Bundle ID `kr.co.when2go.app` / Android Package Name `kr.co.when2go.app` 을 Application에 등록해야 SDK 인증 통과
- 키는 본 SDK 호출 한정. Geocoding 등 부가 API에 사용 금지

## 3. Expo Config Plugin (`app.config.ts`)

```ts
[
  '@mj-studio/react-native-naver-map',
  {
    client_id: process.env.EXPO_PUBLIC_NAVER_MAP_NCP_KEY_ID,
    android: {
      ACCESS_FINE_LOCATION: true,
      ACCESS_COARSE_LOCATION: true,
      ACCESS_BACKGROUND_LOCATION: false,
    },
    ios: {
      NSLocationWhenInUseUsageDescription:
        '현재 위치를 지도에 표시하고 출발 시간을 계산하는 데 사용합니다.',
    },
  },
],
```

플러그인이 자동으로 처리:

- iOS Info.plist에 `NMFNcpKeyId` (신 Maps), `NMFClientId` (legacy AI Naver API), 위치 사용 문구 주입
- Android AndroidManifest에 `com.naver.maps.map.NCP_KEY_ID`, `com.naver.maps.map.CLIENT_ID` 메타데이터 + 위치 권한 주입

## 4. 사용 컴포넌트 (현재 프로젝트 채택분)

### 4.1 `NaverMapView`

지도 본체. 자식으로 마커/오버레이를 렌더.

When2Go에서 채택한 주요 props:

```ts
<NaverMapView
  style={{ flex: 1 }}
  initialCamera={{ latitude, longitude, zoom }}
  isShowLocationButton={false}
  isShowZoomControls={false}
  isShowCompass={false}
  isShowScaleBar={false}
  isShowIndoorLevelPicker={false}
/>
```

| Prop | 타입 | When2Go 기본 | 비고 |
|---|---|---|---|
| `style` | ViewStyle | `{ flex: 1 }` | 일반 RN 컨테이너 스타일 |
| `initialCamera` | `Camera` | `{ latitude, longitude, zoom: 15 }` | 마운트 후 1회 적용. 이후 카메라 이동은 ref API |
| `isShowLocationButton` | boolean | `false` | 미리보기는 비활성 |
| `isShowZoomControls` | boolean | `false` | 동상 |
| `isShowCompass` | boolean | `false` | 동상 |
| `isShowScaleBar` | boolean | `false` | 동상 |
| `isShowIndoorLevelPicker` | boolean | `false` | 동상 |
| `mapType` | `MapType` | (생략 → Basic) | 위성/하이브리드 등 필요 시 명시 |
| `layerGroups` | `{ BUILDING, TRAFFIC, TRANSIT, BICYCLE, ... }` | 기본 BUILDING만 | 대중교통 경로 표시 시 TRANSIT 활성 검토 |
| `onCameraChanged` | `(event) => void` | (미사용) | 카메라 이동/idle 이벤트 |

`Camera` 타입:

```ts
type Camera = {
  latitude: number;
  longitude: number;
  zoom?: number;     // 0~21
  tilt?: number;     // 0~63
  bearing?: number;  // 0~360
};
```

### 4.2 `NaverMapMarkerOverlay`

좌표 마커. 자식 형태로 `NaverMapView` 안에 둔다.

When2Go에서 채택한 주요 props:

```ts
<NaverMapMarkerOverlay
  latitude={lat}
  longitude={lng}
  anchor={{ x: 0.5, y: 1 }}
/>
```

| Prop | 타입 | When2Go 기본 | 비고 |
|---|---|---|---|
| `latitude` | number | 필수 | |
| `longitude` | number | 필수 | |
| `anchor` | `{ x, y }` | `{ x: 0.5, y: 1 }` | 마커 아이콘 기준점 (하단 중앙) |
| `image` | `MapImageProp` | (생략 → 기본 핀) | 커스텀 마커 필요 시 |
| `caption` / `subCaption` | `CaptionType` / `SubCaptionType` | (미사용) | 마커 라벨 |
| `onTap` | `() => void` | (미사용) | 마커 탭 콜백 |

### 4.3 미사용 컴포넌트 (필요 시 도입)

같은 패키지에서 제공되며, 본 프로젝트 향후 작업(F-M05 경로 결과 화면 등)에서 도입 가능:

- `NaverMapPolylineOverlay` — 경로 폴리라인
- `NaverMapPathOverlay` / `NaverMapMultiPathOverlay` — 길찾기 경로 (스타일링 다양)
- `NaverMapArrowheadPathOverlay` — 방향 화살표 경로
- `NaverMapPolygonOverlay` — 영역 표시
- `NaverMapCircleOverlay` — 반경 표시 (정류장 주변 등)
- `NaverMapGroundOverlay` — 지도 위 이미지 깔기
- `clusters` (NaverMapView prop) — 정류장 다수 마커 클러스터링

## 5. 좌표 / 위치 훅

### 5.1 `useCurrentLocation`

위치: `src/hooks/location/useCurrentLocation.ts`

```ts
type LocationState = {
  lat: number;
  lng: number;
  isGranted: boolean;
  isLoading: boolean;
  error: Error | null;
};

const { lat, lng, isGranted, isLoading, error } = useCurrentLocation();
```

동작:

- 마운트 시 `expo-location.requestForegroundPermissionsAsync()` 권한 요청
- 허용: `watchPositionAsync` 구독 (`Balanced` 정확도, 10s/10m 갱신) → 좌표 변할 때마다 갱신
- 거부: 서울 시청 기본 좌표(`37.5666791, 126.9782914`) 폴백, `isGranted=false`
- 구독 실패: `error` 상태 + 기본 좌표 유지
- 언마운트: 구독 자동 해제

테스트: `src/hooks/location/__tests__/useCurrentLocation.test.ts` (TDD 4축 + 라이프사이클 7개)

## 6. 사용 예시 (`src/components/home/MapPreview.tsx`)

홈 화면 지도 미리보기. 현재 위치 마커만 표시.

```tsx
import {
  NaverMapMarkerOverlay,
  NaverMapView,
} from '@mj-studio/react-native-naver-map';

import { useCurrentLocation } from '@/hooks/location/useCurrentLocation';

const INITIAL_ZOOM = 15;

export default function MapPreview() {
  const { lat, lng, isGranted, isLoading } = useCurrentLocation();

  if (isLoading) {
    return <View className="..." accessibilityLabel="지도 미리보기 로딩 중" />;
  }

  return (
    <View className="flex-1" accessibilityLabel="지도 미리보기">
      <NaverMapView
        style={{ flex: 1 }}
        initialCamera={{ latitude: lat, longitude: lng, zoom: INITIAL_ZOOM }}
        isShowLocationButton={false}
        isShowZoomControls={false}
        isShowCompass={false}
        isShowScaleBar={false}
      >
        <NaverMapMarkerOverlay latitude={lat} longitude={lng} anchor={{ x: 0.5, y: 1 }} />
      </NaverMapView>
      {!isGranted && (/* 폴백 안내 캡션 */)}
    </View>
  );
}
```

## 7. 빌드 / 검증 체크리스트

- `.env` 또는 EAS secret에 `EXPO_PUBLIC_NAVER_MAP_NCP_KEY_ID` 등록 확인
- `npx expo prebuild --clean` 시 plugin이 Info.plist / AndroidManifest에 키 주입했는지 확인
- 실기기 검증 (시뮬레이터/에뮬레이터로는 인증 누락 진단이 어려움):
  - iOS: EAS development build → 실기기 설치 → 지도 + 마커 렌더 확인
  - Android: 동일
- logcat / 시뮬레이터 콘솔에 SDK 인증 에러(`Authentication failed`, `Invalid Client ID` 등) 없음 확인
- 위치 권한 다이얼로그 한 번만 뜨고 정상 동작, 거부 시 서울 시청 폴백 + 안내 캡션

## 8. 알려진 함정

| 증상 | 원인 | 해결 |
|---|---|---|
| 첫 빌드 후 지도 흰 화면 | NCP Application에 Bundle ID/Package Name 미등록 | NCP 콘솔에서 등록 후 1~2분 대기 |
| `Authentication failed` 로그 | `EXPO_PUBLIC_NAVER_MAP_NCP_KEY_ID` 미주입 (EAS secret 누락) | `eas secret:list` 확인 후 `eas secret:create` |
| 권한 다이얼로그 안 뜸 | iOS Info.plist `NSLocationWhenInUseUsageDescription` 누락 | plugin config의 `ios` 블록 확인 |
| Android 위치 권한 안 뜸 | manifest 권한 누락 | plugin config의 `android.ACCESS_FINE_LOCATION: true` 확인 |
| `NaverMapView`가 뜨지만 마커가 안 보임 | 자식이 아니거나 좌표 NaN | 마커는 NaverMapView 자식으로, 좌표는 finite number |

## 9. 부가 API 도입 시 절차

본 문서 §0에서 금지된 API(Geocoding 등)를 도입해야 하는 경우:

1. 별도 이슈 생성 (`type=design` 또는 `type=feature`)
2. NCP 콘솔에서 해당 API 요금제·무료 한도 확인 후 본 문서 §0 표 갱신
3. 본 문서 §1~§5에 신규 API 사용 가이드 추가
4. exec-plan에 비용 모니터링 절차 명시
