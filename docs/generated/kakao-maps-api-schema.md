# 카카오 지도 API 스키마 — `@react-native-kakao/map@2.2.7`

> **용도**: 하네스 엔지니어링 레퍼런스. `when2go-ui` / `when2go-logic` / `when2go-qa` 에이전트가
> 카카오 지도 코드를 작성·검증할 때 1차 참조하는 단일 진실 원천.
> **출처**: 로컬 `node_modules/@react-native-kakao/{map,core}@2.2.7` 소스 + 공식 문서(rnkakao.dev, `v2.2.7` 태그) + 네이티브 `RNCKakaoMapView.mm`.
> **생성일**: 2026-05-22 / **대상 환경**: RN 0.81.5 · Expo SDK 54 · New Architecture(Fabric/Bridgeless) · Bare Workflow(CNG).
> 자동 생성 문서가 아님. 패키지·RN 버전이 바뀌면 수동 갱신.

---

## 0. TL;DR — 에이전트가 먼저 알아야 할 6가지

1. **패키지 동결**: `@react-native-kakao/map`은 v2.2.7 이후 monorepo에서 **제거**됨(CHANGELOG: `remove map package`). **2.2.7이 마지막 버전이며 영구히 업데이트 없음.** "최신 버전으로 올려라" 류 제안 금지.
2. **API 표면이 극도로 작다**: 컴포넌트 `KakaoMapView` 1개 + 함수 `initializeKakaoMapSDK` 1개가 전부. **마커·라벨·POI 커스텀·도형(폴리라인/폴리곤/원)·인포윈도우·이벤트 콜백·ref 명령어가 전혀 없다.**
3. **마커/오버레이는 JS로 직접 구현**: 지도 위 표식은 RN `View`를 `position: absolute`로 올려서 만든다(현재 `MapPreview.tsx` 패턴).
4. **RN 0.81 호환 패치 필수**: `patches/@react-native-kakao+map+2.2.7.patch` 없으면 (a) `"only supports fabric"` 런타임 에러, (b) 지도 흰 화면. → §8.
5. **iOS 시뮬레이터에서 지도 타일이 안 그려진다**: 시뮬레이터 GPU가 카카오 타일 텍스처를 디코드 못 함(`unsupported image format`). 정상. **실기기로 검증.** → §9.
6. **`initialCamera`는 iOS v2.2.7에서 동작하지 않는다(no-op)**: 코드젠 스펙엔 선언돼 있으나 네이티브가 소비하지 않음. → §6.

---

## 1. 패키지 구성

| 패키지 | 설치 버전 | 역할 |
|---|---|---|
| `@react-native-kakao/core` | 2.2.7 | SDK 공통 인프라 · Expo config plugin · `initializeKakaoSDK` |
| `@react-native-kakao/map` | 2.2.7 (최종) | `KakaoMapView` 컴포넌트 · `initializeKakaoMapSDK` |

- `map`은 `core`에 **peer dependency**. `core`는 항상 함께 설치돼야 함.
- 네이티브 기반: iOS `KakaoMapsSDK`, Android Kakao Maps SDK.
- **New Architecture(Fabric) 전용**. Old Architecture / Expo Go 미지원.
- 모듈 등록 이름: 코어 TurboModule `RNCKakaoCore`, 맵 TurboModule `RNCKakaoMap`, Fabric 컴포넌트 `RNCKakaoMapView`.

---

## 2. 네이티브 설정 (Expo config plugin)

`ios/`·`android/`가 gitignore된 CNG 프로젝트이므로, 네이티브 설정은 **`app.config.ts`의 config plugin이 prebuild 시 생성**한다. `ios/Info.plist`를 손으로 고치지 말 것 — prebuild가 덮어쓴다.

### 2.1 플러그인 등록

```ts
// app.config.ts
plugins: [
  ['@react-native-kakao/core', {
    nativeAppKey: process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY || 'placeholder',
    ios: { handleKakaoOpenUrl: false },
    android: { /* ... */ },
  }],
]
```

### 2.2 플러그인 옵션 (`@react-native-kakao/core`)

| 옵션 | 타입 | 설명 |
|---|---|---|
| `nativeAppKey` | `string` **필수** | 카카오 네이티브 앱 키. 없으면 plugin이 throw. |
| `ios` | `object` | **이 키가 있어야 iOS 설정이 주입됨.** 없으면 `withIos` 미실행. 빈 `{}`도 가능. |
| `ios.handleKakaoOpenUrl` | `boolean` | `true`면 AppDelegate에 카카오 로그인 딥링크 핸들러 삽입. 지도만 쓰면 `false`. |
| `ios.naviApplicationQuerySchemes` | `boolean` | `true`면 `kakaonavi-sdk` 스킴 추가(카카오내비용). |
| `android` | `object` | 이 키가 있어야 Android 설정 주입. |

### 2.3 `withIos`가 prebuild 시 Info.plist에 자동 주입하는 것

- `CFBundleURLTypes` ← `{ CFBundleURLSchemes: ["kakao{nativeAppKey}"], CFBundleURLName: "Kakao" }`
- `LSApplicationQueriesSchemes` ← `kakaokompassauth`, `kakaolink`, `kakaoplus`

> ⚠️ **하네스 주의**: 위는 plugin config에 `ios` 키가 있을 때만 주입된다. 위치 권한 문자열
> (`NSLocationWhenInUseUsageDescription` 등)은 plugin이 안 넣으므로 **`app.json`의
> `ios.infoPlist`에 직접** 선언해야 한다.

### 2.4 Android Maven 저장소

Android 빌드 시 `expo-build-properties`로 카카오 Maven 추가 필요:
```json
["expo-build-properties", { "android": { "extraMavenRepos": ["https://devrepo.kakao.com/nexus/content/groups/public/"] } }]
```

### 2.5 카카오 개발자 콘솔 등록 (필수)

`developers.kakao.com` → 앱 → 플랫폼 탭에서 **iOS Bundle ID / Android 패키지명**을 등록해야 인증 성공.
- 이 프로젝트 iOS Bundle ID: `kr.co.when2go.app`
- 미등록 시 네이티브 `authenticationFailed` → 3초마다 무한 재시도(§9).

---

## 3. SDK 초기화

지도용 함수와 공통 함수가 **별개**다. 혼동 금지.

| 함수 | 패키지 | 시그니처 | 용도 |
|---|---|---|---|
| `initializeKakaoMapSDK` | `@react-native-kakao/map` (`KakaoMap` 객체) | `(appKey: string) => Promise<void>` | **지도 렌더링용. 지도 쓰면 필수.** |
| `initializeKakaoSDK` | `@react-native-kakao/core` | `(appKey: string, options?: { web?: {...} }) => Promise<void>` | 로그인·공유 등 공통 SDK용. 지도엔 불필요. |

```ts
// app/_layout.tsx — 앱 부팅 시 1회, 어떤 카카오 API보다 먼저
import { KakaoMap } from '@react-native-kakao/map';

KakaoMap.initializeKakaoMapSDK(process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY!)
  .catch(e => console.error('[KakaoMap] SDK 초기화 실패:', e));
```

- 반드시 `<KakaoMapView>` 마운트 **전**에 호출. 현재 프로젝트는 `RootLayout`의 `useEffect`에서 호출.
- 앱 키는 `.env`의 `EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY`. 커밋 금지.

---

## 4. `KakaoMapView` 컴포넌트

```ts
import { KakaoMapView } from '@react-native-kakao/map';
// default export 도 KakaoMapView 동일
import type { KakaoMapProps, KakaoMapRef, Camera } from '@react-native-kakao/map';
```

### 4.1 Props 전체 목록

`KakaoMapProps extends ViewProps` — RN `View`의 모든 prop(`style`, `pointerEvents`, `accessibilityLabel` 등) 사용 가능.

| Prop | 타입 | 기본값 | 설명 / iOS 네이티브 동작 |
|---|---|---|---|
| `style` | `ViewProps['style']` | — | 컨테이너 스타일. 지도는 보통 `{ flex: 1 }`. |
| `baseMapType` | `'map' \| 'skyview'` | `'map'` | 일반 지도 / 위성(스카이뷰). `changeViewInfoWithAppName`. |
| `overlays` | `('hill_shading' \| 'roadview_line' \| 'bicycle_road' \| 'hybrid')[]` | `undefined` | 지도 오버레이 레이어. 배열에 포함된 것만 `showOverlay`, 나머지 `hideOverlay`. |
| `camera` | `Camera` | `nullCamera` | 카메라 위치. **prop이 바뀔 때마다** `moveCamera` 호출(§6). |
| `initialCamera` | `Camera` | `undefined` | ⚠️ **iOS v2.2.7에서 no-op**(§6). 네이티브 미소비. |
| `cameraMinLevel` | `number` | `-123123123`(null) | 최소 줌 레벨. 유효 숫자일 때만 `setCameraMinLevel`. |
| `cameraMaxLevel` | `number` | `-123123123`(null) | 최대 줌 레벨. 유효 숫자일 때만 `setCameraMaxLevel`. |
| `cameraAnimationDuration` | `number` | `0` | `camera` 이동 애니메이션 ms. `0`이면 즉시 이동(애니메이션 없음). |
| `buildingScale` | `number` | `0.5` | 3D 건물 높이 배율. **범위 0..1, 벗어나면 `kAssert`로 throw.** `setBuildingScale`. |
| `poiEnabled` | `boolean` | `true` | 카카오 기본 POI(상호명 등) 표시 여부. `setPoiEnabled`. |
| `poiClickable` | `boolean` | `true` | 기본 POI 클릭 가능 여부. `setPoiClickable`. |
| `poiScale` | `'small' \| 'regular' \| 'large' \| 'xlarge'` | `'regular'` | 기본 POI 텍스트 크기. `setPoiScale`. |
| `language` | `'ko' \| 'en'` | `undefined` | 지도 라벨 언어. `setLanguage`(`en` 외 전부 `ko` 취급). |
| `isShowScaleBar` | `boolean` | `true` | 축척 막대 표시. `showScaleBar`/`hideScaleBar`. |
| `isShowCompass` | `boolean` | `true` | 나침반 표시. `showCompass`/`hideCompass`. |

> 모든 prop 변경은 **지도가 준비된 후(`addViewSucceeded`)에만** 반영된다. 준비 전 변경은 무시되며,
> 지도 준비 직후 `_shouldForceUpdatePropsForInitialRender` 플래그로 전 prop이 1회 강제 적용된다.

### 4.2 `Camera` 타입

```ts
interface Camera {
  lat: number;        // 위도 (필수)
  lng: number;        // 경도 (필수)
  tilt?: number;      // 기울기(도)
  rotation?: number;  // 회전각(도)
  zoomLevel?: number; // 줌 레벨 — 높을수록 확대. iOS addView 기본 17(거리 수준)
}
```
- 생략된 선택 필드는 내부적으로 `nullCamera`(`-123123123`)로 채워지며 네이티브가 "미지정"으로 해석해 현재 값을 유지.
- `KakaoMapView` 내부에서 `camera` prop은 `useMemo`로 안정화됨(`{ ...nullCamera, ...cameraProp }`).

### 4.3 Ref

```ts
interface KakaoMapRef {}  // 빈 객체 — 노출된 메서드 없음
```
`useImperativeHandle(ref, () => ({}))`. `ref`를 받아도 **호출할 수 있는 명령형 메서드가 하나도 없다.** 카메라 이동·줌 등은 전부 `camera` prop을 통한 선언형으로만 가능.

### 4.4 이벤트 / 네이티브 명령어

- **이벤트 콜백 없음**: `onMapReady`, `onCameraMove`, `onMapClick`, `onMarkerPress` 등 **전부 미존재.** 지도 준비·이동·탭을 JS에서 감지할 수 없다.
- **네이티브 명령어 없음**: `Commands` 의 `supportedCommands: []`.

---

## 5. ❌ 이 패키지에 "없는" 기능 (명시)

에이전트가 아래를 prop·메서드로 착각해 작성하지 않도록 명시한다. **전부 존재하지 않는다:**

- 커스텀 마커 / 라벨(`LabelLayer`, `Poi`, `markerList`, `<Marker>`)
- 인포윈도우 / 말풍선
- 도형: 폴리라인 / 폴리곤 / 원 / 경로 오버레이
- 이벤트: `onMapReady` / `onCameraMove` / `onCameraIdle` / `onMapClick` / `onPoiClick`
- ref 명령형 API: `moveCamera()`, `animateCamera()`, `setZoom()`, `fitBounds()`
- 현재 위치 추적(`myLocationEnabled`), 클러스터링, 로드뷰

→ **대안**:
- **표식**: RN `View`를 `<KakaoMapView>` 위에 `absolute`로 오버레이(§7 패턴).
- **경로 그리기**: v2.2.7로는 불가. 별도 네이티브 모듈 / 커스텀 fork / 다른 라이브러리(`@jiggag/react-native-kakao-maps` 등) 검토가 필요하며 **반드시 이슈로 분리**.
- 경로 표시가 필요한 PRD 기능을 만나면, v2.2.7의 한계임을 PR/이슈에 명시할 것.

---

## 6. 카메라 동작 상세 — `camera` vs `initialCamera`

`RNCKakaoMapView.mm` 분석 결과:

- **`camera`**: `updateProps`에서 `p.camera != n.camera`이면 `moveCamera`(또는 `cameraAnimationDuration>0`일 때 `animateCameraWithCameraUpdate`) 호출. → **prop이 바뀔 때마다 카메라가 재이동.** 객체 참조가 안정적이면(부모가 메모이즈) 실제 좌표가 바뀔 때만 이동.
- **`initialCamera`**: 코드젠 스펙(`RNCKakaoMapViewNativeComponent.ts`)과 JS Props엔 선언돼 있으나, **`RNCKakaoMapView.mm` 어디서도 읽지 않는다.** iOS v2.2.7에서 **완전한 no-op.**
- **초기 위치**: 지도 첫 위치는 `addViews()`에 **하드코딩된 `defaultPosition (37.402001, 127.108678)` = 판교**, `defaultLevel: 17`.

> ### ⚠️ 하네스 CRITICAL — 현재 프로젝트 영향
> `MapPreview.tsx`는 `initialCamera={{ lat, lng, zoomLevel: 3 }}`를 쓴다. **iOS에서 `initialCamera`가
> no-op이므로 지도는 사용자 위치가 아니라 판교(37.402, 127.108)를 보여준다.** 그 위에 중앙 고정으로
> 그려지는 파란 점 마커는 결과적으로 "판교"를 가리키게 된다.
>
> **권장 수정 방향** (v2.2.7 범위 내):
> - `initialCamera` 대신 `camera`를 사용하되, **위치가 확정된 뒤 안정적인 참조로 1회만** 넘긴다.
>   `camera` 객체 참조가 그 뒤로 안 바뀌면 `moveCamera`가 다시 안 불려 사용자 패닝이 보존된다
>   (이것이 commit `43a5234`가 `initialCamera`로 바꾼 본래 목적 — `camera`를 매 렌더 새 객체로
>   넘기면 지도가 계속 원위치로 스냅백됨).
> - 즉 핵심은 "`initialCamera` 사용"이 아니라 "`camera`를 **참조 안정적으로 1회** 전달"이다.
> - **실기기에서 지도가 사용자 위치에 센터링되는지 반드시 육안 확인.**

### 줌 레벨 스케일
iOS `KakaoMapsSDK`는 정수 줌 레벨을 쓰며 **값이 클수록 확대**. `addView` 기본 `17`(거리/건물 수준).
`MapPreview`의 `DEFAULT_ZOOM_LEVEL = 3`은 매우 축소된(광역) 값 — 동네 수준 미리보기엔 `15~17` 권장.
(단 `initialCamera` no-op 상태에선 이 값 자체가 적용되지 않음.)

---

## 7. 권장 사용 패턴 — 마커 오버레이

v2.2.7엔 마커가 없으므로 "현재 위치 점" 같은 표식은 RN View 오버레이로 구현한다.

```tsx
<View className="flex-1">
  <KakaoMapView
    style={{ flex: 1 }}
    camera={stableCamera}      // 위치 확정 후 메모이즈된 객체 1회 (§6)
    language="ko"
  />
  {/* 지도 중앙에 고정되는 표식 — 지도 터치를 막지 않도록 pointerEvents="none" */}
  <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
    {/* ...마커 View... */}
  </View>
</View>
```

규칙:
- 오버레이 컨테이너는 `pointerEvents="none"` — 지도 제스처를 가로채지 않게.
- 다크모드: 마커 색·테두리는 `isDark` 조건부 클래스 필수(프로젝트 컨벤션 2).
- 크기·치수는 상수로(컨벤션 3).
- 지도가 화면 중앙에 사용자 위치를 두는 한, "중앙 고정 오버레이"가 곧 "현재 위치 마커"가 된다.
  단 §6의 `initialCamera` no-op 문제로 센터링이 깨지면 이 전제도 깨진다.

---

## 8. RN 0.81 / New Architecture 호환 패치

`@react-native-kakao/map@2.2.7`은 RN 0.74 기준이라 RN 0.81 + Bridgeless에서 그대로는 동작하지 않는다.
`patches/@react-native-kakao+map+2.2.7.patch`가 `patch-package`(`postinstall` 훅)로 매 `npm install` 후 재적용된다.

| 패치 대상 | 원본 → 패치 | 해결하는 문제 |
|---|---|---|
| `src/index.ts`, `lib/commonjs/index.js`, `lib/module/index.js` | `global.__turboModuleProxy != null` → `... != null \|\| true` | Bridgeless 모드에선 `__turboModuleProxy`가 `null` → 패키지가 `"only supports fabric"` throw. `\|\| true`로 우회. |
| `package.json` | `codegenConfig`에 `ios.componentProvider: { "RNCKakaoMapView": "RNCKakaoMapView" }` 추가 | 이 키가 없으면 RN 코드젠(`parseiOSAnnotations`)이 라이브러리를 건너뜀 → Fabric 컴포넌트 `RNCKakaoMapView` 미등록 → **지도가 빈 흰 뷰로 렌더**. |

> RN 0.80+는 Fabric 서드파티 컴포넌트 등록에 `codegenConfig.ios.componentProvider`를 요구한다.
> 등록 확인: `pod install` 후 `ios/.../RCTThirdPartyComponentsProvider.mm`에
> `@"RNCKakaoMapView": NSClassFromString(@"RNCKakaoMapView")`가 있어야 정상.

`core` 패키지는 패치 불필요 — `core`의 `index.ts`는 `__turboModuleProxy`가 `null`이면
`NativeModules.RNCKakaoCore` 폴백을 타므로 Bridgeless에서도 동작한다.

---

## 9. 알려진 제약 · 함정 (QA 체크리스트)

| # | 증상 | 원인 | 대응 |
|---|---|---|---|
| 1 | iOS **시뮬레이터**에서 지도 타일이 안 뜨고 흰/베이지 화면, 로그 `[K3fCore] unsupported image format` | 시뮬레이터 GPU가 카카오 타일 텍스처 포맷 디코드 불가 | **버그 아님.** 실기기로 검증. |
| 2 | 지도가 **흰 빈 뷰** (실기기 포함) | `codegenConfig.ios.componentProvider` 누락 → 컴포넌트 미등록 | §8 패치 적용 + 재빌드. |
| 3 | `"@react-native-kakao/map only supports fabric"` throw | Bridgeless에서 `__turboModuleProxy == null` | §8 JS 패치. |
| 4 | 지도가 사용자 위치가 아닌 **판교**를 표시 | `initialCamera` iOS no-op | §6. `camera`로 전환. |
| 5 | 인증 실패가 3초마다 무한 반복(`authenticationFailed ... retry`) | Bundle ID/앱 키가 콘솔 미등록 또는 불일치 | §2.5 콘솔 등록 확인. |
| 6 | 콘솔에 `Native` 객체가 찍힘 | 패키지 `src/index.ts:33`의 `console.log(Native)` 디버그 잔재(`// todo remove`) | 무해. 무시. |
| 7 | Expo Go에서 지도 안 뜸 | 네이티브 모듈이라 Expo Go 미지원 | dev build / 실기기 빌드 사용. |
| 8 | 패키지 설치 후 지도 깨짐 | `patch-package`가 패치 재적용 안 됨 | `npx patch-package` 수동 실행, `postinstall` 훅 확인. |

---

## 10. 이 프로젝트의 실제 사용처

| 파일 | 용도 |
|---|---|
| `app/_layout.tsx` | `KakaoMap.initializeKakaoMapSDK(appKey)` 부팅 시 1회 호출 |
| `src/components/home/MapPreview.tsx` | 홈 화면 지도 미리보기 + 중앙 고정 위치 마커 오버레이 |
| `src/hooks/location/useCurrentLocation.ts` | 현재 좌표 제공(`lat`, `lng`, `isGranted`, `isLoading`) |
| `app.config.ts` | `@react-native-kakao/core` config plugin 등록 |
| `patches/@react-native-kakao+map+2.2.7.patch` | RN 0.81 호환 패치(§8) |

---

## 11. 참고 링크

- 라이브러리 문서: https://rnkakao.dev (map 패키지는 전용 문서 없음 — v2.2.7 시점에도 미문서화)
- 라이브러리 레포: https://github.com/mym0404/react-native-kakao (map 패키지는 `main`에서 제거됨, `v2.2.7` 태그에 잔존)
- 카카오 지도 iOS 공식 SDK: https://apis.map.kakao.com/ios_v2/
- 카카오 개발자 콘솔: https://developers.kakao.com/console/app
- npm: https://www.npmjs.com/package/@react-native-kakao/map
