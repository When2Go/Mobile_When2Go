import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { BottomSheetScrollView, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { ChevronDown, ChevronRight, Clock, MapPin, Navigation, Trash2 } from 'lucide-react-native';

import BottomSheetModal from '@/components/common/BottomSheetModal';
import TimeWheelPicker from '@/components/setup/TimeWheelPicker';
import { useTheme } from '@/contexts/ThemeContext';
import { PALETTE } from '@/constants/colors';
import { ICON_SIZE } from '@/constants/icons';
import { ROUTE_OPTIONS } from '@/constants/setup';
import {
  ADD_MODAL_TITLE,
  ARRIVAL_TAP_HINT,
  DAYS,
  DELETE_LABEL,
  EDIT_MODAL_TITLE,
  LABEL_ARRIVAL,
  LABEL_DAYS,
  LABEL_LOCATIONS,
  LABEL_NAME,
  LABEL_ROUTE,
  PLACEHOLDER_DESTINATION,
  PLACEHOLDER_NAME,
  PLACEHOLDER_ORIGIN,
  SAVE_LABEL,
} from '@/constants/repeat';
import type { RepeatFormData } from '@/types/repeat.types';

const SNAP_POINTS = ['85%'];
const FORM_ICON_SIZE = 18;

type Mode = 'add' | 'edit';

interface RepeatEditModalProps {
  isOpen: boolean;
  mode: Mode;
  form: RepeatFormData;
  onClose: () => void;
  onSave: () => void;
  onDelete?: () => void;
  onFormChange: (updates: Partial<RepeatFormData>) => void;
  onSelectLocation: (field: 'origin' | 'destination') => void;
}

function formatArrival(period: string, hour: number, minute: number): string {
  return `${period} ${hour}:${String(minute).padStart(2, '0')}`;
}

export default function RepeatEditModal({
  isOpen,
  mode,
  form,
  onClose,
  onSave,
  onDelete,
  onFormChange,
  onSelectLocation,
}: RepeatEditModalProps) {
  const { isDark } = useTheme();
  const [isTimeExpanded, setTimeExpanded] = useState(false);

  const title = mode === 'edit' ? EDIT_MODAL_TITLE : ADD_MODAL_TITLE;
  const isValid = form.name.trim().length > 0 && form.days.length > 0;

  // 색상 토큰
  const inputBg = isDark
    ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
    : 'bg-white border-zinc-200 text-zinc-900';
  const placeholderColor = isDark ? PALETTE.zinc500 : PALETTE.zinc400;
  const labelText = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const sub = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const fieldRowBg = isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-200';
  const dividerLine = isDark ? 'bg-zinc-700' : 'bg-zinc-300';
  const arrivalBoxBg = isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-zinc-200';
  const dayBtnActive = 'bg-blue-600 border-blue-600';
  const dayBtnInactive = isDark
    ? 'bg-zinc-800 border-zinc-700'
    : 'bg-white border-zinc-200';
  const routeActiveBg = isDark
    ? 'border-blue-500 bg-blue-900/30'
    : 'border-blue-600 bg-blue-50';
  const routeInactiveBg = isDark
    ? 'border-zinc-700 bg-zinc-800'
    : 'border-zinc-200 bg-white';

  const locationPlaceholderText = isDark ? 'text-zinc-500' : 'text-zinc-400';
  const locationValueText = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const locationFieldText = (value: string) =>
    value ? locationValueText : locationPlaceholderText;

  const handleToggleDay = (i: number) => {
    const next = form.days.includes(i)
      ? form.days.filter((x) => x !== i)
      : [...form.days, i];
    onFormChange({ days: next });
  };

  const handleSavePress = () => {
    if (isValid) onSave();
  };

  return (
    <BottomSheetModal isOpen={isOpen} onClose={onClose} title={title} snapPoints={SNAP_POINTS}>
      <BottomSheetScrollView showsVerticalScrollIndicator={false}>
        <View className="gap-5 pb-2">
          {/* 예약 이름 */}
          <View>
            <Text className={`mb-2 text-sm font-semibold ${labelText}`}>{LABEL_NAME}</Text>
            <BottomSheetTextInput
              value={form.name}
              onChangeText={(v) => onFormChange({ name: v })}
              placeholder={PLACEHOLDER_NAME}
              placeholderTextColor={placeholderColor}
              className={`rounded-xl border px-4 py-3 text-base ${inputBg}`}
            />
          </View>

          {/* 출발지 / 목적지 */}
          <View>
            <Text className={`mb-2 text-sm font-semibold ${labelText}`}>{LABEL_LOCATIONS}</Text>
            <View className="gap-1">
              <Pressable
                onPress={() => onSelectLocation('origin')}
                accessibilityRole="button"
                accessibilityLabel="출발지 검색"
                className={`flex-row items-center gap-3 rounded-xl border px-4 py-3 active:opacity-70 ${fieldRowBg}`}
              >
                <Navigation
                  size={FORM_ICON_SIZE}
                  color={isDark ? PALETTE.blue400 : PALETTE.blue500}
                />
                <Text
                  className={`flex-1 text-sm ${locationFieldText(form.origin)}`}
                  numberOfLines={1}
                >
                  {form.origin || PLACEHOLDER_ORIGIN}
                </Text>
                <ChevronRight size={FORM_ICON_SIZE} color={placeholderColor} />
              </Pressable>
              <View className="items-center justify-center py-0.5">
                <View className={`h-2 w-px ${dividerLine}`} />
              </View>
              <Pressable
                onPress={() => onSelectLocation('destination')}
                accessibilityRole="button"
                accessibilityLabel="목적지 검색"
                className={`flex-row items-center gap-3 rounded-xl border px-4 py-3 active:opacity-70 ${fieldRowBg}`}
              >
                <MapPin
                  size={FORM_ICON_SIZE}
                  color={isDark ? PALETTE.rose400 : PALETTE.red500}
                />
                <Text
                  className={`flex-1 text-sm ${locationFieldText(form.destination)}`}
                  numberOfLines={1}
                >
                  {form.destination || PLACEHOLDER_DESTINATION}
                </Text>
                <ChevronRight size={FORM_ICON_SIZE} color={placeholderColor} />
              </Pressable>
            </View>
          </View>

          {/* 반복 요일 */}
          <View>
            <Text className={`mb-3 text-sm font-semibold ${labelText}`}>{LABEL_DAYS}</Text>
            <View className="flex-row gap-2">
              {DAYS.map((d, i) => {
                const isSelected = form.days.includes(i);
                const btnBg = isSelected ? dayBtnActive : dayBtnInactive;
                const btnText = (() => {
                  if (isSelected) return 'text-white';
                  return isDark ? 'text-zinc-400' : 'text-zinc-500';
                })();
                return (
                  <Pressable
                    key={d}
                    onPress={() => handleToggleDay(i)}
                    accessibilityRole="button"
                    accessibilityLabel={`${d}요일 ${isSelected ? '해제' : '선택'}`}
                    className={`flex-1 items-center rounded-xl border py-2.5 active:opacity-70 ${btnBg}`}
                  >
                    <Text className={`text-sm font-bold ${btnText}`}>{d}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 도착 시간 (collapsible) */}
          <View>
            <Text className={`mb-2 text-sm font-semibold ${labelText}`}>{LABEL_ARRIVAL}</Text>
            <Pressable
              onPress={() => setTimeExpanded((p) => !p)}
              accessibilityRole="button"
              accessibilityLabel={`${LABEL_ARRIVAL} ${isTimeExpanded ? '접기' : '펼치기'}`}
              className={`flex-row items-center gap-3 rounded-xl border px-4 py-3 active:opacity-70 ${arrivalBoxBg}`}
            >
              <Clock size={ICON_SIZE.header} color={isDark ? PALETTE.zinc400 : PALETTE.zinc500} />
              <Text className={`text-base font-semibold ${labelText}`}>
                {formatArrival(form.arrivalPeriod, form.arrivalHour, form.arrivalMinute)}
              </Text>
              <View className="ml-auto flex-row items-center gap-1">
                <Text className={`text-xs ${sub}`}>{ARRIVAL_TAP_HINT}</Text>
                <ChevronDown size={ICON_SIZE.card} color={placeholderColor} />
              </View>
            </Pressable>
            {isTimeExpanded ? (
              <View className={`mt-2 rounded-xl border ${arrivalBoxBg}`}>
                <TimeWheelPicker
                  period={form.arrivalPeriod}
                  hour={form.arrivalHour}
                  minute={form.arrivalMinute}
                  onPeriodChange={(period) => onFormChange({ arrivalPeriod: period })}
                  onHourChange={(hour) => onFormChange({ arrivalHour: hour })}
                  onMinuteChange={(minute) => onFormChange({ arrivalMinute: minute })}
                />
              </View>
            ) : null}
          </View>

          {/* 경로 옵션 — 항상 한 줄(3개 균등) */}
          <View>
            <Text className={`mb-3 text-sm font-semibold ${labelText}`}>{LABEL_ROUTE}</Text>
            <View className="flex-row gap-2">
              {ROUTE_OPTIONS.map((opt) => {
                const isActive = form.routeOption === opt.id;
                const btnBg = isActive ? routeActiveBg : routeInactiveBg;
                const btnText = (() => {
                  if (isActive) return isDark ? 'text-blue-300' : 'text-blue-700';
                  return isDark ? 'text-zinc-400' : 'text-zinc-600';
                })();
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => onFormChange({ routeOption: opt.id })}
                    accessibilityRole="button"
                    accessibilityLabel={`경로 옵션 ${opt.label}`}
                    className={`flex-1 items-center justify-center rounded-xl border px-2 py-3 active:opacity-70 ${btnBg}`}
                  >
                    <Text className={`text-sm font-medium ${btnText}`} numberOfLines={1}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </BottomSheetScrollView>

      {/* 액션 버튼 */}
      <View className="mt-4 flex-row gap-3">
        {mode === 'edit' && onDelete ? (
          <Pressable
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel="삭제"
            className={`flex-row items-center justify-center gap-2 rounded-2xl px-5 py-3.5 active:opacity-70 ${
              isDark ? 'bg-red-900/40' : 'bg-red-50'
            }`}
          >
            <Trash2 size={ICON_SIZE.card} color={isDark ? PALETTE.rose400 : PALETTE.rose600} />
            <Text className={`text-sm font-bold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              {DELETE_LABEL}
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={handleSavePress}
          accessibilityRole="button"
          disabled={!isValid}
          className={`flex-1 rounded-2xl py-3.5 ${isValid ? 'bg-blue-600 active:bg-blue-700' : 'bg-zinc-400'}`}
        >
          <Text className={`text-center text-sm font-bold ${isValid ? 'text-white' : 'text-zinc-200'}`}>
            {SAVE_LABEL}
          </Text>
        </Pressable>
      </View>
    </BottomSheetModal>
  );
}
