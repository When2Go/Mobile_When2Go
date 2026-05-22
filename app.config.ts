import { type ConfigContext, type ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig =>
  ({
    ...config,
    plugins: [
      ...(config.plugins ?? []),
      [
        '@react-native-kakao/core',
        {
          nativeAppKey: process.env.EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY ?? '',
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
    ],
  }) as ExpoConfig;
