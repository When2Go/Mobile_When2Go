import { Pressable, Switch, Text, View } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { ChevronRight, MapPin, Star } from 'lucide-react-native';

import BottomSheetModal from '@/components/common/BottomSheetModal';
import { useTheme } from '@/contexts/ThemeContext';
import { PALETTE } from '@/constants/colors';
import type { RouteFormData } from '@/types/routes.types';

const SNAP_POINTS = ['85%'];
const FORM_ICON_SIZE = 18;
const FIELD_PLACEHOLDER_FROM = '출발지를 검색하세요';
const FIELD_PLACEHOLDER_TO = '목적지를 검색하세요';
const FIELD_PLACEHOLDER_NAME = '예: 출근, 헬스장, 학교';
const FIELD_PLACEHOLDER_FREQ = '예: 주 5회 이용';

interface RouteEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  isEditMode: boolean;
  form: RouteFormData;
  onFormChange: (updates: Partial<RouteFormData>) => void;
  onSelectLocation: (field: 'from' | 'to') => void;
}

export default function RouteEditModal({
  isOpen,
  onClose,
  onSave,
  isEditMode,
  form,
  onFormChange,
  onSelectLocation,
}: RouteEditModalProps) {
  const { isDark } = useTheme();

  const isValid =
    form.name.trim().length > 0 &&
    form.from.trim().length > 0 &&
    form.to.trim().length > 0;

  const title = isEditMode ? '경로 수정' : '새 경로 추가';

  const inputBg = isDark
    ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
    : 'bg-white border-zinc-200 text-zinc-900';
  const placeholderColor = isDark ? PALETTE.zinc500 : PALETTE.zinc400;
  const labelText = isDark ? 'text-zinc-200' : 'text-zinc-800';
  const rowBg = isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200';
  const rowLabel = isDark ? 'text-zinc-200' : 'text-zinc-800';
  const chevronColor = isDark ? PALETTE.zinc500 : PALETTE.zinc400;

  const starInactiveColor = isDark ? PALETTE.zinc400 : PALETTE.zinc500;
  const starColor = form.isFavorite ? PALETTE.amber500 : starInactiveColor;
  const starFill = form.isFavorite ? PALETTE.amber500 : 'transparent';

  const locationValueText = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const locationPlaceholderText = isDark ? 'text-zinc-500' : 'text-zinc-400';
  const locationFieldText = (value: string) => (value ? locationValueText : locationPlaceholderText);

  return (
    <BottomSheetModal isOpen={isOpen} onClose={onClose} title={title} snapPoints={SNAP_POINTS}>
      <View className="gap-5">
        {/* 경로 이름 */}
        <View>
          <Text className={`mb-2 text-sm font-semibold ${labelText}`}>경로 이름</Text>
          <BottomSheetTextInput
            value={form.name}
            onChangeText={(v) => onFormChange({ name: v })}
            placeholder={FIELD_PLACEHOLDER_NAME}
            placeholderTextColor={placeholderColor}
            className={`rounded-xl border px-4 py-3 text-base ${inputBg}`}
          />
        </View>

        {/* 출발지 */}
        <View>
          <Text className={`mb-2 text-sm font-semibold ${labelText}`}>출발지</Text>
          <Pressable
            onPress={() => onSelectLocation('from')}
            accessibilityRole="button"
            accessibilityLabel="출발지 검색"
            className={`flex-row items-center gap-3 rounded-xl border px-4 py-3 active:opacity-70 ${rowBg}`}
          >
            <MapPin size={FORM_ICON_SIZE} color={isDark ? PALETTE.blue400 : PALETTE.blue600} />
            <Text className={`flex-1 text-base ${locationFieldText(form.from)}`} numberOfLines={1}>
              {form.from || FIELD_PLACEHOLDER_FROM}
            </Text>
            <ChevronRight size={FORM_ICON_SIZE} color={chevronColor} />
          </Pressable>
        </View>

        {/* 목적지 */}
        <View>
          <Text className={`mb-2 text-sm font-semibold ${labelText}`}>목적지</Text>
          <Pressable
            onPress={() => onSelectLocation('to')}
            accessibilityRole="button"
            accessibilityLabel="목적지 검색"
            className={`flex-row items-center gap-3 rounded-xl border px-4 py-3 active:opacity-70 ${rowBg}`}
          >
            <MapPin size={FORM_ICON_SIZE} color={isDark ? PALETTE.emerald100 : PALETTE.emerald700} />
            <Text className={`flex-1 text-base ${locationFieldText(form.to)}`} numberOfLines={1}>
              {form.to || FIELD_PLACEHOLDER_TO}
            </Text>
            <ChevronRight size={FORM_ICON_SIZE} color={chevronColor} />
          </Pressable>
        </View>

        {/* 이용 빈도 */}
        <View>
          <Text className={`mb-2 text-sm font-semibold ${labelText}`}>이용 빈도</Text>
          <BottomSheetTextInput
            value={form.frequency}
            onChangeText={(v) => onFormChange({ frequency: v })}
            placeholder={FIELD_PLACEHOLDER_FREQ}
            placeholderTextColor={placeholderColor}
            className={`rounded-xl border px-4 py-3 text-base ${inputBg}`}
          />
        </View>

        {/* 즐겨찾기 */}
        <View className={`flex-row items-center justify-between rounded-xl border px-4 py-4 ${rowBg}`}>
          <View className="flex-row items-center gap-3">
            <Star size={FORM_ICON_SIZE} color={starColor} fill={starFill} />
            <Text className={`text-sm font-medium ${rowLabel}`}>즐겨찾기에 추가</Text>
          </View>
          <Switch
            value={form.isFavorite}
            onValueChange={(v) => onFormChange({ isFavorite: v })}
            trackColor={{ false: isDark ? PALETTE.zinc700 : PALETTE.zinc200, true: PALETTE.blue600 }}
            thumbColor={PALETTE.white}
          />
        </View>

        {/* 저장 버튼 */}
        <Pressable
          onPress={() => { if (isValid) onSave(); }}
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
