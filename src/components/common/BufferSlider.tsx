import { Text, View } from 'react-native';
import Slider from '@react-native-community/slider';

import { PALETTE } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { BUFFER_MAX_MINUTES, BUFFER_MIN_MINUTES } from '@/stores/settingsStore';

const SLIDER_STEP = 5;
const TICK_MARK_MINUTES = [0, 10, 20, 30];
const HELPER_TEMPLATE = (m: number) => `실제 출발 예정 시간에서 ${m}분 먼저 알려드려요`;

interface BufferSliderProps {
  value: number;
  onChange: (next: number) => void;
}

export default function BufferSlider({ value, onChange }: BufferSliderProps) {
  const { isDark } = useTheme();

  const valueText = isDark ? 'text-blue-400' : 'text-blue-600';
  const unitText = isDark ? 'text-zinc-300' : 'text-zinc-700';
  const helperText = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const tickText = isDark ? 'text-zinc-500' : 'text-zinc-400';
  const trackMinColor = isDark ? PALETTE.blue500 : PALETTE.blue600;
  const trackMaxColor = isDark ? PALETTE.zinc700 : PALETTE.zinc200;
  const thumbColor = isDark ? PALETTE.blue500 : PALETTE.blue600;

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
