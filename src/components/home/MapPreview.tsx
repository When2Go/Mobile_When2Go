import { Text, View } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';

const MARKER_PULSE_SIZE = 56;
const MARKER_DOT_SIZE = 28;
const MARKER_INNER_DOT = 10;

/**
 * 네이버 지도 SDK 연동 전 임시 placeholder.
 * 실제 SDK 래퍼는 별도 이슈에서 `MapView`로 교체.
 */
export default function MapPreview() {
  const { isDark } = useTheme();

  const baseBg = isDark ? 'bg-zinc-800' : 'bg-zinc-200';
  const gridLine = isDark ? 'bg-zinc-700' : 'bg-zinc-300';
  const captionText = isDark ? 'text-zinc-500' : 'text-zinc-400';

  return (
    <View className={`flex-1 ${baseBg}`} accessibilityLabel="지도 미리보기">
      <View className="absolute inset-0">
        <View className={`absolute left-0 right-0 top-1/4 h-px ${gridLine}`} />
        <View className={`absolute left-0 right-0 top-2/4 h-px ${gridLine}`} />
        <View className={`absolute left-0 right-0 top-3/4 h-px ${gridLine}`} />
        <View className={`absolute top-0 bottom-0 left-1/4 w-px ${gridLine}`} />
        <View className={`absolute top-0 bottom-0 left-2/4 w-px ${gridLine}`} />
        <View className={`absolute top-0 bottom-0 left-3/4 w-px ${gridLine}`} />
      </View>

      <View
        className="absolute left-1/2 top-[38%] items-center justify-center"
        style={{
          width: MARKER_PULSE_SIZE,
          height: MARKER_PULSE_SIZE,
          marginLeft: -MARKER_PULSE_SIZE / 2,
          marginTop: -MARKER_PULSE_SIZE / 2,
        }}
      >
        <View
          className="absolute rounded-full bg-blue-500/20"
          style={{ width: MARKER_PULSE_SIZE, height: MARKER_PULSE_SIZE }}
        />
        <View
          className="items-center justify-center rounded-full border-2 border-white bg-blue-500"
          style={{ width: MARKER_DOT_SIZE, height: MARKER_DOT_SIZE }}
        >
          <View
            className="rounded-full bg-white"
            style={{ width: MARKER_INNER_DOT, height: MARKER_INNER_DOT }}
          />
        </View>
      </View>

      <View className="absolute bottom-4 left-0 right-0 items-center">
        <Text className={`text-[11px] font-medium ${captionText}`}>
          지도 미리보기 (SDK 연동 전)
        </Text>
      </View>
    </View>
  );
}
