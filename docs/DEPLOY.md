# 배포 / 빌드 가이드

> EAS Build 기반. iOS는 TestFlight, Android는 Google Play Internal Testing으로 베타 배포.

---

## 사전 준비 (1회)

### 본인(개발자)
| 항목 | 비용 | 링크 |
|------|------|------|
| Apple Developer Program | $99/년 | https://developer.apple.com/programs |
| Google Play Developer | $25 1회 | https://play.google.com/console/signup |
| Expo 계정 | 무료 | https://expo.dev/signup |

### 팀원
- 본인 비용 0
- iPhone UDID 등록만 하면 개발 빌드 실행 가능
- TestFlight/Play 베타는 초대만 받으면 됨

---

## Bundle ID

`kr.co.when2go.app` (iOS `bundleIdentifier` + Android `package` 동일).
한 번 정해진 후 스토어 제출 후엔 변경 어려움.

---

## EAS 프로젝트 초기화 (1회)

```bash
npm install -g eas-cli
eas login
eas build:configure
```

`eas build:configure` 실행 시 EAS가 프로젝트 ID를 자동으로 `app.json`에 주입(`extra.eas.projectId`). `eas.json`은 이미 레포에 있음 — 덮어쓰지 말 것(빌드 프로필이 우리 정책에 맞춰져 있음).

---

## 1. 개발 빌드 (팀원 iPhone에서 실 디바이스 테스트)

### 1-1. 팀원 iPhone UDID 등록 (1회만)

```bash
eas device:create
```

→ EAS가 짧은 URL 출력 → **팀원에게 전달** → 팀원이 iPhone Safari에서 열고 프로필 설치 → UDID 자동 등록.

> Apple ID는 사용 안 함. 디바이스 식별자만 등록.

### 1-2. 개발 빌드 생성

```bash
eas build --profile development --platform ios
```

빌드 완료 후 EAS가 다운로드 링크 제공. 팀원에게 공유 → 팀원이 iPhone에서 설치 후 신뢰 설정(설정 → 일반 → VPN 및 기기 관리).

### 1-3. Metro 연결

```bash
npx expo start --dev-client
```

팀원은 설치된 dev 빌드를 열고, QR 코드 스캔 또는 같은 Wi-Fi에서 자동 연결.

> 코드 변경이 즉시 반영됨. 단 네이티브 모듈 추가 시(plugins 변경) 빌드 다시 필요.

---

## 2. TestFlight 베타 배포

### 2-1. App Store Connect 앱 생성 (1회)
1. https://appstoreconnect.apple.com → 마이 앱 → `+`
2. 플랫폼: iOS, Bundle ID: `kr.co.when2go.app` 선택
3. SKU 입력(임의 문자열, 예: `WHEN2GO_001`)
4. 생성 후 'App Information' 페이지 URL의 숫자(예: `1234567890`)가 **ASC App ID** — `eas.json`의 `submit.production.ios.ascAppId`에 채워 넣을 값

### 2-2. 빌드 + 업로드

```bash
eas build --profile production --platform ios
eas submit -p ios --latest
```

첫 업로드 시 Apple이 인증서·프로비저닝 프로파일 자동 관리(EAS가 처리). 업로드 후 **수출 규정 컴플라이언스** 체크 필요(App Store Connect에서 1회 답변).

### 2-3. 팀원을 Internal Tester로 등록

**경로**: App Store Connect → 본인 앱 → **TestFlight** 탭 → **내부 테스트** 그룹 → 테스터 추가
- 이메일: `cocacolra741@naver.com`
- 단, 해당 이메일이 Apple ID로 등록되어 있어야 함. 안 되어 있으면 https://appleid.apple.com 에서 먼저 가입

→ 팀원 메일 수신 → TestFlight 앱(앱스토어에서 무료 다운로드) 설치 → 코드 수락 → 빌드 다운로드.

---

## 3. Google Play Internal Testing

### 3-1. Play Console 앱 생성 (1회)
- https://play.google.com/console → 앱 만들기 → 패키지 이름: `kr.co.when2go.app`
- 앱 카테고리·기본 정보 입력

### 3-2. 빌드 + 업로드

```bash
eas build --profile production --platform android
eas submit -p android --latest
```

첫 업로드는 internal track으로 직접 안 가는 경우가 있음 — Submit 시 EAS 안내에 따라 production 제출 → 검토 후 internal 트랙으로 promote.

### 3-3. 팀원을 내부 테스터로 등록

**경로**: Play Console → 앱 → 테스트 → 내부 테스트 → 테스터 → 이메일 목록(또는 Google 그룹) 추가
- 등록 이메일: 팀원의 **Google 계정 이메일**(Gmail 또는 Google 가입 이메일)
- ⚠️ `cocacolra741@naver.com`는 Apple ID. Google Play엔 별도 Google 계정 필요 — 팀원과 확인

---

## 빌드 프로필 정리 (`eas.json`)

| 프로필 | 명령 | 용도 | distribution |
|--------|------|------|--------------|
| `development` | `eas build -p ios -e development` | dev-client + Metro | internal (UDID) |
| `development-simulator` | `eas build -p ios -e development-simulator` | iOS 시뮬레이터 | internal |
| `preview` | `eas build -p ios -e preview` | 사내 release 테스트 | internal |
| `production` | `eas build -p ios -e production` | 스토어 제출 | store |

---

## 자주 쓰는 명령

```bash
# 빌드 상태 확인
eas build:list

# 등록된 디바이스 목록
eas device:list

# 디바이스 추가 등록 (팀원 추가 시 재실행)
eas device:create

# 자격 증명 관리 (인증서·프로파일)
eas credentials

# OTA 업데이트(JS 코드만 변경 시 빌드 없이 즉시 배포)
eas update --branch production --message "출발 시간 계산 버그 수정"
```

---

## 트러블슈팅

| 증상 | 원인/해결 |
|------|----------|
| 빌드 시 "Apple ID 2단계 인증 코드 요구" | 본인 Apple ID 인증 — 휴대폰 6자리 코드 입력 |
| 팀원이 dev 빌드 설치 후 "신뢰할 수 없는 개발자" | 설정 → 일반 → VPN 및 기기 관리 → 프로필 신뢰 |
| `eas submit -p ios` 401 에러 | `appleId`/App Store Connect API Key 재인증 필요 |
| Play 첫 업로드 거부(앱 정보 미작성) | Play Console에서 개인정보 처리방침 URL, 콘텐츠 등급, 데이터 보안 등 미리 채우기 |

---

## 참고

- EAS Build 공식: https://docs.expo.dev/build/introduction/
- EAS Submit 공식: https://docs.expo.dev/submit/introduction/
- TestFlight 가이드: https://developer.apple.com/testflight/
- Play Internal Testing: https://support.google.com/googleplay/android-developer/answer/9845334
