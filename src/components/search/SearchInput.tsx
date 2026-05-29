import { useEffect, useRef } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Search, X } from 'lucide-react-native';

import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';

const PLACEHOLDER_TEXT = '장소, 버스, 지하철 검색';
const AUTOFOCUS_DELAY_MS = 100;

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onSubmit: () => void;
}

export default function SearchInput({ value, onChangeText, onClear, onSubmit }: Props) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), AUTOFOCUS_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const inputBg = 'bg-zinc-100';
  const textColor = PALETTE.zinc900;
  const clearBg = 'bg-zinc-300';

  return (
    <View className={`flex-1 flex-row items-center gap-2 rounded-xl px-3 py-2.5 ${inputBg}`}>
      <Search size={ICON_SIZE.header} color={PALETTE.zinc400} />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        placeholder={PLACEHOLDER_TEXT}
        placeholderTextColor={PALETTE.zinc400}
        returnKeyType="search"
        className="flex-1 text-[15px]"
        style={{ color: textColor }}
      />
      {value.length > 0 && (
        <Pressable
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel="검색어 지우기"
          hitSlop={8}
        >
          <View className={`rounded-full p-0.5 ${clearBg}`}>
            <X size={ICON_SIZE.card} color={PALETTE.white} />
          </View>
        </Pressable>
      )}
    </View>
  );
}
