import { useEffect, useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { MapPin, Star } from 'lucide-react-native';

import BottomSheetModal from '@/components/common/BottomSheetModal';
import { useTheme } from '@/contexts/ThemeContext';
import { PALETTE } from '@/constants/colors';
import type { RouteFormData, RouteItem } from '@/types/routes.types';

const SNAP_POINTS = ['85%'];
const FIELD_PLACEHOLDER_FROM = '출발지를 입력하세요';
const FIELD_PLACEHOLDER_TO = '목적지를 입력하세요';
const FIELD_PLACEHOLDER_NAME = '예: 출근, 헬스장, 학교';
const FIELD_PLACEHOLDER_FREQ = '예: 주 5회 이용';

interface RouteEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: RouteFormData) => void;
  initialRoute?: RouteItem;
}

const EMPTY_FORM: RouteFormData = {
  name: '',
  from: '',
  to: '',
  isFavorite: false,
  frequency: '',
};

export default function RouteEditModal({
  isOpen,
  onClose,
  onSave,
  initialRoute,
}: RouteEditModalProps) {
  const { isDark } = useTheme();
  const [form, setForm] = useState<RouteFormData>(EMPTY_FORM);

  useEffect(() => {
    if (isOpen) {
      setForm(initialRoute ? { ...initialRoute } : { ...EMPTY_FORM });
    }
  }, [isOpen, initialRoute]);

  const isValid = form.name.trim().length > 0 && form.from.trim().length > 0 && form.to.trim().length > 0;

  const title = initialRoute ? '경로 수정' : '새 경로 추가';

  const inputBg = isDark ? 'bg-zinc-800 border-zinc-700 text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900';
  const placeholderColor = isDark ? PALETTE.zinc500 : PALETTE.zinc400;
  const labelText = isDark ? 'text-zinc-200' : 'text-zinc-800';
  const rowBg = isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200';
  const rowLabel = isDark ? 'text-zinc-200' : 'text-zinc-800';
  const starInactiveColor = isDark ? PALETTE.zinc400 : PALETTE.zinc500;
  const starColor = form.isFavorite ? '#f59e0b' : starInactiveColor;
  const starFill = form.isFavorite ? '#f59e0b' : 'transparent';

  return (
    <BottomSheetModal isOpen={isOpen} onClose={onClose} title={title} snapPoints={SNAP_POINTS}>
      <View className="gap-5">
        {/* 경로 이름 */}
        <View>
          <Text className={`mb-2 text-sm font-semibold ${labelText}`}>경로 이름</Text>
          <BottomSheetTextInput
            value={form.name}
            onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
            placeholder={FIELD_PLACEHOLDER_NAME}
            placeholderTextColor={placeholderColor}
            className={`rounded-xl border px-4 py-3 text-base ${inputBg}`}
          />
        </View>

        {/* 출발지 */}
        <View>
          <Text className={`mb-2 text-sm font-semibold ${labelText}`}>출발지</Text>
          <View className={`flex-row items-center gap-3 rounded-xl border px-4 ${rowBg}`}>
            <MapPin size={18} color={isDark ? PALETTE.blue400 : PALETTE.blue600} />
            <BottomSheetTextInput
              value={form.from}
              onChangeText={(v) => setForm((f) => ({ ...f, from: v }))}
              placeholder={FIELD_PLACEHOLDER_FROM}
              placeholderTextColor={placeholderColor}
              className={`flex-1 py-3 text-base ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}
            />
          </View>
        </View>

        {/* 목적지 */}
        <View>
          <Text className={`mb-2 text-sm font-semibold ${labelText}`}>목적지</Text>
          <View className={`flex-row items-center gap-3 rounded-xl border px-4 ${rowBg}`}>
            <MapPin size={18} color={isDark ? PALETTE.emerald100 : PALETTE.emerald700} />
            <BottomSheetTextInput
              value={form.to}
              onChangeText={(v) => setForm((f) => ({ ...f, to: v }))}
              placeholder={FIELD_PLACEHOLDER_TO}
              placeholderTextColor={placeholderColor}
              className={`flex-1 py-3 text-base ${isDark ? 'text-zinc-100' : 'text-zinc-900'}`}
            />
          </View>
        </View>

        {/* 이용 빈도 */}
        <View>
          <Text className={`mb-2 text-sm font-semibold ${labelText}`}>이용 빈도</Text>
          <BottomSheetTextInput
            value={form.frequency}
            onChangeText={(v) => setForm((f) => ({ ...f, frequency: v }))}
            placeholder={FIELD_PLACEHOLDER_FREQ}
            placeholderTextColor={placeholderColor}
            className={`rounded-xl border px-4 py-3 text-base ${inputBg}`}
          />
        </View>

        {/* 즐겨찾기 */}
        <View className={`flex-row items-center justify-between rounded-xl border px-4 py-4 ${rowBg}`}>
          <View className="flex-row items-center gap-3">
            <Star
              size={18}
              color={starColor}
              fill={starFill}
            />
            <Text className={`text-sm font-medium ${rowLabel}`}>즐겨찾기에 추가</Text>
          </View>
          <Switch
            value={form.isFavorite}
            onValueChange={(v) => setForm((f) => ({ ...f, isFavorite: v }))}
            trackColor={{ false: isDark ? PALETTE.zinc700 : PALETTE.zinc200, true: PALETTE.blue600 }}
            thumbColor={PALETTE.white}
          />
        </View>

        {/* 저장 버튼 */}
        <Pressable
          onPress={() => { if (isValid) { onSave(form); } }}
          accessibilityRole="button"
          disabled={!isValid}
          className={`w-full rounded-2xl py-4 ${isValid ? 'bg-blue-600 active:bg-blue-700' : 'bg-zinc-300'}`}
        >
          <Text className={`text-center font-bold ${isValid ? 'text-white' : 'text-zinc-500'}`}>
            경로 저장하기
          </Text>
        </Pressable>
      </View>
    </BottomSheetModal>
  );
}
