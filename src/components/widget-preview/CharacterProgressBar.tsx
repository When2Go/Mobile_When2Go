import { useEffect, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { PALETTE } from '@/constants/colors';
import { RUNNER_EMOJI } from './widgetMockData';

const ANIM_DURATION_MS = 900;
/** 🏃 이모지 박스 폭. 진행 지점에 중앙 정렬하기 위해 절반만큼 당긴다. */
const RUNNER_BOX = 18;
const FILL_COLORS = [PALETTE.blue500, PALETTE.blue400] as const;

interface CharacterProgressBarProps {
  /** 진행도 0~1. */
  progress: number;
  /** 트랙 높이 NativeWind 클래스 (기본 h-1.5). */
  trackHeightClass?: string;
  /** 🏃 캐릭터의 트랙 대비 수직 오프셋 클래스 (기본 -top-5). */
  runnerOffsetClass?: string;
}

/**
 * F-W03: 진행도(0~1)에 따라 🏃 캐릭터가 바 위를 이동하는 프로그레스 바.
 * 위젯 미리보기(다크 배경) 안에서만 쓰이므로 다크 톤 고정이다.
 * 마운트 시 0 → progress 로 한 번 애니메이션해 mock 동작을 보여준다.
 */
export default function CharacterProgressBar({
  progress,
  trackHeightClass = 'h-1.5',
  runnerOffsetClass = '-top-5',
}: CharacterProgressBarProps) {
  const [trackWidth, setTrackWidth] = useState(0);
  const anim = useSharedValue(0);

  useEffect(() => {
    anim.value = withTiming(progress, { duration: ANIM_DURATION_MS });
  }, [progress, anim]);

  const fillStyle = useAnimatedStyle(() => ({ width: anim.value * trackWidth }));
  const runnerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: anim.value * trackWidth - RUNNER_BOX / 2 }],
  }));

  const handleLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  };

  return (
    <View
      onLayout={handleLayout}
      className={`relative w-full ${trackHeightClass} rounded-full bg-white/15`}
    >
      <Animated.View
        style={fillStyle}
        className="absolute left-0 top-0 h-full overflow-hidden rounded-full"
      >
        <LinearGradient
          colors={FILL_COLORS}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: trackWidth, height: '100%' }}
        />
      </Animated.View>
      <Animated.Text
        style={runnerStyle}
        className={`absolute ${runnerOffsetClass} left-0 text-base leading-none`}
      >
        {RUNNER_EMOJI}
      </Animated.Text>
    </View>
  );
}
