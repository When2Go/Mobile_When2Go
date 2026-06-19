import { Image, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AdSlot from '@/components/common/AdSlot';
import { useSplashRedirect } from '@/hooks/common/useSplashRedirect';

const SPLASH_LOGO = require('../../../assets/images/splash-icon.png');

interface SplashViewProps {
  /** 자동(시간 경과) 또는 사용자 탭으로 스플래시가 끝났을 때 호출. */
  onFinish: () => void;
}

/**
 * 앱 진입 시 1~2초 노출되는 브랜딩 스플래시(F-AD04).
 * 중앙에 앱 로고, 하단에 광고 placeholder(AdSlot). 일정 시간 후 자동 종료,
 * 사용자가 화면을 탭하면 즉시 종료한다. (TMAP/카카오T 스타일)
 */
export default function SplashView({ onFinish }: SplashViewProps) {
  const { skip } = useSplashRedirect(onFinish);

  return (
    <Pressable
      onPress={skip}
      accessibilityRole="button"
      accessibilityLabel="시작 화면 건너뛰기"
      className="flex-1 bg-white"
    >
      <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
        <View className="flex-1 items-center justify-center">
          <Image
            source={SPLASH_LOGO}
            resizeMode="contain"
            accessibilityLabel="지금 나가? 로고"
            className="h-40 w-40"
          />
        </View>
        <View className="px-5 pb-4">
          <AdSlot type="splash" />
        </View>
      </SafeAreaView>
    </Pressable>
  );
}
