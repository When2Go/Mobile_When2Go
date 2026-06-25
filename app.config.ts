import type { ExpoConfig } from 'expo/config';

const NAVER_MAP_NCP_KEY_ID = process.env.EXPO_PUBLIC_NAVER_MAP_NCP_KEY_ID;

// AdMob App ID — 네이티브 빌드 타임에 Info.plist / AndroidManifest 에 박힌다.
// 실 값은 .env(gitignore)에 주입. 미설정 시 Google 공개 테스트 App ID 로 fallback 해
// 키 없이도 빌드가 깨지지 않게 한다. 실 광고 노출 활성화는 심사 통과 후 별도 PR.
const ADMOB_TEST_IOS_APP_ID = 'ca-app-pub-3940256099942544~1458002511';
const ADMOB_TEST_ANDROID_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
const ADMOB_IOS_APP_ID = process.env.EXPO_PUBLIC_ADMOB_IOS_APP_ID ?? ADMOB_TEST_IOS_APP_ID;
const ADMOB_ANDROID_APP_ID =
  process.env.EXPO_PUBLIC_ADMOB_ANDROID_APP_ID ?? ADMOB_TEST_ANDROID_APP_ID;

const config: ExpoConfig = {
  name: '지금 나가?',
  slug: 'when2go',
  owner: 'when2go',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'when2go',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  ios: {
    bundleIdentifier: 'kr.co.when2go.app',
    supportsTablet: false,
    googleServicesFile: './GoogleService-Info.plist',
    entitlements: {
      'aps-environment': 'development',
    },
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      UIBackgroundModes: ['remote-notification'],
      NSPushNotificationUsageDescription: '출발 알림을 받으려면 알림 권한이 필요합니다.',
    },
  },
  android: {
    package: 'kr.co.when2go.app',
    googleServicesFile: './google-services.json',
    adaptiveIcon: {
      backgroundColor: '#ffffff',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-dev-client',
    '@react-native-firebase/app',
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
    [
      '@mj-studio/react-native-naver-map',
      {
        client_id: NAVER_MAP_NCP_KEY_ID,
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
    [
      'expo-build-properties',
      {
        ios: {
          useFrameworks: 'static',
        },
        android: {
          extraMavenRepos: ['https://repository.map.naver.com/archive/maven'],
        },
      },
    ],
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: ADMOB_ANDROID_APP_ID,
        iosAppId: ADMOB_IOS_APP_ID,
        // iOS ATT(추적 투명성) 다이얼로그 문구. NSUserTrackingUsageDescription 으로 들어간다.
        userTrackingUsageDescription:
          '맞춤 광고를 제공하기 위해 기기의 광고 식별자를 사용합니다. 동의하지 않아도 광고는 표시됩니다.',
      },
    ],
    './plugins/withFirebaseFix',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: 'f7717f21-8d3c-4bdc-8f63-d02f52f78ad1',
    },
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  updates: {
    url: 'https://u.expo.dev/f7717f21-8d3c-4bdc-8f63-d02f52f78ad1',
  },
};

export default config;
