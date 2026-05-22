# Kakao Maps SDK 연동 가이드

> When2Go에서 사용하는 Kakao Maps 설정·사용법 레퍼런스.
> Kakao Local REST API(검색·좌표 변환) 섹션은 #15(목적지 검색) 작업 시 추가 예정.

---

## 1. Kakao Developers 등록 절차

1. [developers.kakao.com](https://developers.kakao.com) → **내 애플리케이션 → 애플리케이션 추가하기**
2. **비즈앱 전환** (카카오맵 활성화 전제조건):
   - 앱 > 일반 > 비즈니스 정보 → **[개인 개발자 비즈 앱 전환]** 클릭
   - 사업자등록번호 없이 개인 명의로 전환 가능
   - 비즈니스 정보 심사 → 카카오맵 심사 순으로 진행
3. **카카오맵 활성화**: 앱 설정 → 카카오맵 → 사용 설정 **ON**
4. **플랫폼 등록**: 앱 설정 → 플랫폼

| 플랫폼 | 등록 항목 |
|---|---|
| iOS | 번들 ID: `kr.co.when2go.app` |
| Android | 패키지명: `kr.co.when2go.app` + 키 해시 |

---

## 2. 앱 키 종류

| 키 | 용도 | When2Go 사용 |
|---|---|---|
| **네이티브 앱 키** | 지도 SDK 초기화 (`initializeKakaoMapSDK`) | ✅ `EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY` |
| REST API 키 | Kakao Local REST API (검색·좌표 변환) | 추후 #15에서 추가 |
| JavaScript 키 | Web JS SDK | ❌ 미사용 |
| Admin 키 | 서버 관리 API | ❌ 미사용 |

---

## 3. Expo 설정

### 3-1. `.env`

```
EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY=여기에_네이티브_앱_키
```

### 3-2. `app.config.ts` — Config Plugin

```ts
// app.config.ts
import { type ConfigContext, type ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  plugins: [
    ...(config.plugins ?? []),
    [
      '@react-native-kakao/core',
      {
        nativeAppKey: process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY ?? '',
        ios: { handleKakaoOpenUrl: false },
        android: {
          authCodeHandlerActivity: false,
          forwardKakaoLinkIntentFilterToMainActivity: false,
          followChannelHandlerActivity: false,
        },
      },
    ],
  ],
});
```

Config plugin이 하는 일:
- **iOS**: `Info.plist`에 `CFBundleURLSchemes: ['kakao{appKey}']` + `LSApplicationQueriesSchemes` 추가
- **Android**: `AndroidManifest.xml`에 필요한 activity/intent-filter 추가

> 네이티브 설정 변경이므로 변경 후 **`expo run:ios` / `expo run:android` 재빌드 필요**.

### 3-3. Jest `transformIgnorePatterns`

`package.json`의 `jest.transformIgnorePatterns`에 아래를 포함:

```
@react-native-kakao/.*|@mj-studio/.*
```

---

## 4. Android 키 해시 발급

개발용 debug keystore 기준:

```bash
# macOS / Linux
keytool -exportcert -alias androiddebugkey \
  -keystore ~/.android/debug.keystore \
  | openssl sha1 -binary \
  | openssl base64
```

기본 비밀번호: `android`

> Kakao 콘솔 → 앱 설정 → 플랫폼 → Android → 키 해시에 붙여넣기.

---

## 5. SDK 사용법

### 5-1. 초기화

앱 루트 레이아웃 (`app/_layout.tsx`)에서 한 번만 호출:

```ts
import { KakaoMap } from '@react-native-kakao/map';

useEffect(() => {
  void KakaoMap.initializeKakaoMapSDK(process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY ?? '');
}, []);
```

### 5-2. `KakaoMapView` Props

```ts
interface KakaoMapProps extends ViewProps {
  camera?: Camera;           // controlled — 변경 시 지도 이동
  initialCamera?: Camera;    // uncontrolled — 최초 위치만 지정
  baseMapType?: 'map' | 'skyview';
  language?: 'ko' | 'en';
  isShowCompass?: boolean;
  isShowScaleBar?: boolean;
  poiEnabled?: boolean;
  poiScale?: 'small' | 'regular' | 'large' | 'xlarge';
  cameraMinLevel?: number;
  cameraMaxLevel?: number;
}

interface Camera {
  lat: number;
  lng: number;
  zoomLevel?: number;  // 1(최대 확대) ~ 14(광역). 3~4 = 동네 수준
  tilt?: number;
  rotation?: number;
}
```

> **내장 마커 없음** — 지도 위에 React Native View를 absolute 오버레이해서 마커 구현.

### 5-3. 현재 위치 + 마커 패턴

```tsx
// camera를 사용자 좌표로 설정 → 지도 중앙 = 사용자 위치
// 마커(View)를 absolute + items-center justify-center로 오버레이 → 항상 화면 중앙 = 지도 중앙
<View style={{ flex: 1 }}>
  <KakaoMapView
    style={{ flex: 1 }}
    camera={{ lat, lng, zoomLevel: 3 }}
    language="ko"
  />
  <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
    {/* 위치 마커 */}
  </View>
</View>
```

---

## 6. 무료 쿼터 요약

| 항목 | 무료 한도 |
|---|---|
| 전체 월 호출 | 300만 건 |
| 지도 일 호출 | 30만 건 |
| 좌표 변환 (coord2address) | 일 10만 건 |

초과 시 종량 과금. MVP 트래픽 기준 실질 무료 구간 내 운용 가능.

---

## 7. 추후 마이그레이션 포인트 (#15 이후)

- Kakao Local REST API 프론트 직연동 → Spring Boot 프록시로 이관 시:
  - `src/api/kakao/search.ts` → `src/api/search/index.ts`로 이동
  - REST API 키는 서버 환경 변수로 이동 (클라이언트 노출 제거)
  - `Authorization: KakaoAK {REST_API_KEY}` 헤더는 서버에서만 사용
