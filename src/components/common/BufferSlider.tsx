import { Text, View } from 'react-native';
import Slider from '@react-native-community/slider';

import { PALETTE } from '@/constants/colors';
import { BUFFER_MAX_MINUTES, BUFFER_MIN_MINUTES } from '@/stores/settingsStore';

const SLIDER_STEP = 5;
// settingsStore 의 BUFFER_MIN/MAX 범위에서 양끝 + 1/3·2/3 지점 4개. store 범위 변경 시 자동 추종.
const TICK_MARK_MINUTES = [
  BUFFER_MIN_MINUTES,
  Math.round(BUFFER_MAX_MINUTES / 3),
  Math.round((BUFFER_MAX_MINUTES * 2) / 3),
  BUFFER_MAX_MINUTES,
];
const HELPER_TEMPLATE = (m: number) => `실제 출발 예정 시간에서 ${m}분 먼저 알려드려요`;

interface BufferSliderProps {
  value: number;
  onChange: (next: number) => void;
}

export default function BufferSlider({ value, onChange }: BufferSliderProps) {
  const valueText = 'text-blue-600';
  const unitText = 'text-zinc-700';
  const helperText = 'text-zinc-500';
  const tickText = 'text-zinc-400';
  const trackMinColor = PALETTE.blue600;
  const trackMaxColor = PALETTE.zinc200;
  const thumbColor = PALETTE.blue600;

  return (
    <View className="gap-6">
      <View className="items-center">
        <View className="flex-row items-end">
          <Text className={`text-5xl font-black ${valueText}`}>{value}</Text>
          <Text className={`ml-2 text-2xl font-bold ${unitText}`}>분</Text>
        </View>
        <Text className={`mt-2 text-sm ${helperText}`}>{HELPER_TEMPLATE(value)}</Text>
      </View>

      <View className="px-1">
        <Slider
          accessibilityLabel="안전 버퍼 시간 슬라이더"
          minimumValue={BUFFER_MIN_MINUTES}
          maximumValue={BUFFER_MAX_MINUTES}
          step={SLIDER_STEP}
          value={value}
          onValueChange={onChange}
          minimumTrackTintColor={trackMinColor}
          maximumTrackTintColor={trackMaxColor}
          thumbTintColor={thumbColor}
        />
        <View className="mt-2 flex-row justify-between">
          {TICK_MARK_MINUTES.map((m) => (
            <Text key={m} className={`text-xs font-semibold ${tickText}`}>{`${m}분`}</Text>
          ))}
        </View>
      </View>
    </View>
  );
}
