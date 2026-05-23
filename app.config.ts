import { type ConfigContext, type ExpoConfig } from 'expo/config';

// Kakao Maps Android SDK(`com.kakao.maps.open:android`)는 Kakao 자체 Maven에만
// 호스팅되어 있다. `@react-native-kakao/core`의 config plugin은 manifest 주입만
// 하고 maven repository는 추가하지 않으므로, Expo 표준 경로인 expo-build-properties로
// android.extraMavenRepos에 명시 추가해야 EAS Android 빌드의 dependency 해결이 성공한다.
const KAKAO_MAVEN_REPO = 'https://devrepo.kakao.com/nexus/content/groups/public/';

export default ({ config }: ConfigContext): ExpoConfig =>
  ({
    ...config,
    plugins: [
      ...(config.plugins ?? []),
      [
        '@react-native-kakao/core',
        {
          nativeAppKey: process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY || 'placeholder',
          ios: {
            handleKakaoOpenUrl: false,
          },
          android: {
            authCodeHandlerActivity: false,
            forwardKakaoLinkIntentFilterToMainActivity: false,
            followChannelHandlerActivity: false,
          },
        },
      ],
      [
        'expo-build-properties',
        {
          android: {
            extraMavenRepos: [KAKAO_MAVEN_REPO],
          },
        },
      ],
    ],
  }) as ExpoConfig;
