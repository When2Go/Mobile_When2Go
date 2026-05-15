import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';

import { PALETTE } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import { BUFFER_MAX_MINUTES, BUFFER_MIN_MINUTES } from '@/stores/settingsStore';

const SLIDER_STEP = 5;
const TICK_MARK_MINUTES = [0, 10, 20, 30];
const HELPER_TEMPLATE = (m: number) => `실제 출발 예정 시간에서 ${m}분 먼저 알려드려요`;

interface BufferSheetBodyProps {
  value: number;
  onSave: (next: number) => void;
  onCancel: () => void;
}

export default function BufferSheetBody({ value, onSave, onCancel }: BufferSheetBodyProps) {
  const { isDark } = useTheme();
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const valueText = isDark ? 'text-blue-400' : 'text-blue-600';
  const unitText = isDark ? 'text-zinc-300' : 'text-zinc-700';
  const helperText = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const tickText = isDark ? 'text-zinc-500' : 'text-zinc-400';
  const cancelBg = isDark ? 'bg-zinc-800' : 'bg-zinc-100';
  const cancelText = isDark ? 'text-zinc-300' : 'text-zinc-600';
  const trackMinColor = isDark ? PALETTE.blue500 : PALETTE.blue600;
  const trackMaxColor = isDark ? PALETTE.zinc700 : PALETTE.zinc200;
  const thumbColor = isDark ? PALETTE.blue500 : PALETTE.blue600;

  return (
    <View className="gap-6 pb-2">
      <View className="items-center">
        <View className="flex-row items-end">
          <Text className={`text-5xl font-black ${valueText}`}>{local}</Text>
          <Text className={`ml-2 text-2xl font-bold ${unitText}`}>분</Text>
        </View>
        <Text className={`mt-2 text-sm ${helperText}`}>{HELPER_TEMPLATE(local)}</Text>
      </View>

      <View className="px-1">
        <Slider
          accessibilityLabel="안전 버퍼 시간 슬라이더"
          minimumValue={BUFFER_MIN_MINUTES}
          maximumValue={BUFFER_MAX_MINUTES}
          step={SLIDER_STEP}
          value={local}
          onValueChange={setLocal}
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

      <View className="flex-row gap-3">
        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="취소"
          className={`flex-1 items-center justify-center rounded-xl py-3 active:opacity-70 ${cancelBg}`}
        >
          <Text className={`text-sm font-semibold ${cancelText}`}>취소</Text>
        </Pressable>
        <Pressable
          onPress={() => onSave(local)}
          accessibilityRole="button"
          accessibilityLabel="저장"
          className="flex-1 items-center justify-center rounded-xl bg-blue-600 py-3 active:opacity-70"
        >
          <Text className="text-sm font-bold text-white">저장</Text>
        </Pressable>
      </View>
    </View>
  );
}
