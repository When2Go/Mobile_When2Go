import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import BufferSlider from '@/components/common/BufferSlider';

interface BufferSheetBodyProps {
  value: number;
  onSave: (next: number) => void;
  onCancel: () => void;
}

export default function BufferSheetBody({ value, onSave, onCancel }: BufferSheetBodyProps) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const cancelBg = 'bg-zinc-100';
  const cancelText = 'text-zinc-600';

  return (
    <View className="gap-6 pb-2">
      <BufferSlider value={local} onChange={setLocal} />

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
