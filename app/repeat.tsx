import { useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus } from 'lucide-react-native';

import EmptyState from '@/components/repeat/EmptyState';
import RepeatEditModal from '@/components/repeat/RepeatEditModal';
import RepeatReservationCard from '@/components/repeat/RepeatReservationCard';
import { useTheme } from '@/contexts/ThemeContext';
import { PALETTE } from '@/constants/colors';
import { ICON_SIZE } from '@/constants/icons';
import { ADD_CTA_LABEL, EMPTY_REPEAT_FORM, MOCK_REPEATS, SCREEN_TITLE } from '@/constants/repeat';
import type { RepeatFormData, RepeatItem } from '@/types/repeat.types';

const LIST_PADDING_CLASS = 'gap-3 p-5';
const INITIAL_NEXT_ID = MOCK_REPEATS.length + 1;

export default function RepeatScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  const nextIdRef = useRef(INITIAL_NEXT_ID);
  const [repeats, setRepeats] = useState<RepeatItem[]>(MOCK_REPEATS);
  const [editTarget, setEditTarget] = useState<RepeatItem | undefined>(undefined);
  const [isEditOpen, setEditOpen] = useState(false);
  const [draftForm, setDraftForm] = useState<RepeatFormData>(EMPTY_REPEAT_FORM);

  const pageBg = isDark ? 'bg-zinc-950' : 'bg-zinc-50';
  const headerBg = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100';
  const headingText = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const backBg = isDark ? 'bg-zinc-700' : 'bg-zinc-100';
  const backIconColor = isDark ? PALETTE.zinc300 : PALETTE.zinc500;
  const addBtnBg = isDark ? 'bg-blue-900/50' : 'bg-blue-50';
  const addBtnText = isDark ? 'text-blue-400' : 'text-blue-600';

  const handleAdd = () => {
    setEditTarget(undefined);
    setDraftForm(EMPTY_REPEAT_FORM);
    setEditOpen(true);
  };

  const handleEdit = (item: RepeatItem) => {
    setEditTarget(item);
    setDraftForm({
      name: item.name,
      origin: item.origin,
      destination: item.destination,
      days: [...item.days],
      arrivalPeriod: item.arrivalPeriod,
      arrivalHour: item.arrivalHour,
      arrivalMinute: item.arrivalMinute,
      routeOption: item.routeOption,
    });
    setEditOpen(true);
  };

  const handleToggle = (id: number) => {
    setRepeats((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    );
  };

  const handleDelete = (id: number) => {
    setRepeats((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSave = () => {
    if (editTarget) {
      setRepeats((prev) =>
        prev.map((r) => (r.id === editTarget.id ? { ...r, ...draftForm } : r)),
      );
    } else {
      const newItem: RepeatItem = { ...draftForm, id: nextIdRef.current++, enabled: true };
      setRepeats((prev) => [...prev, newItem]);
    }
    setEditOpen(false);
  };

  const handleDeleteFromModal = () => {
    if (!editTarget) return;
    handleDelete(editTarget.id);
    setEditOpen(false);
  };

  // mock 단계 — 검색 화면 연동은 후속 이슈. 콜백만 받아두고 동작 X.
  const handleSelectLocation = (_field: 'origin' | 'destination') => {
    // intentional no-op: 후속 이슈에서 검색 화면과 연결.
  };

  return (
    <SafeAreaView className={`flex-1 ${pageBg}`} edges={['top', 'left', 'right']}>
      {/* 커스텀 헤더 — 마이페이지에서 진입하므로 ArrowLeft + 타이틀 + 추가 버튼 */}
      <View className={`flex-row items-center justify-between border-b px-5 py-4 ${headerBg}`}>
        <View className="flex-row items-center gap-3">
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="뒤로 가기"
            hitSlop={8}
            className={`h-9 w-9 items-center justify-center rounded-full active:opacity-70 ${backBg}`}
          >
            <ArrowLeft size={ICON_SIZE.header} color={backIconColor} />
          </Pressable>
          <Text className={`text-lg font-bold ${headingText}`}>{SCREEN_TITLE}</Text>
        </View>
        <Pressable
          onPress={handleAdd}
          accessibilityRole="button"
          accessibilityLabel="반복 예약 추가"
          className={`flex-row items-center gap-1.5 rounded-lg px-3 py-2 active:opacity-70 ${addBtnBg}`}
        >
          <Plus size={ICON_SIZE.card} color={isDark ? PALETTE.blue400 : PALETTE.blue600} />
          <Text className={`text-sm font-semibold ${addBtnText}`}>{ADD_CTA_LABEL}</Text>
        </Pressable>
      </View>

      {repeats.length === 0 ? (
        <View className="flex-1">
          <EmptyState onAddPress={handleAdd} />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName={LIST_PADDING_CLASS}
          showsVerticalScrollIndicator={false}
        >
          {repeats.map((item) => (
            <RepeatReservationCard
              key={item.id}
              item={item}
              onPress={handleEdit}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </ScrollView>
      )}

      {isEditOpen ? (
        <RepeatEditModal
          isOpen={isEditOpen}
          mode={editTarget ? 'edit' : 'add'}
          form={draftForm}
          onClose={() => setEditOpen(false)}
          onSave={handleSave}
          onDelete={editTarget ? handleDeleteFromModal : undefined}
          onFormChange={(updates) => setDraftForm((prev) => ({ ...prev, ...updates }))}
          onSelectLocation={handleSelectLocation}
        />
      ) : null}
    </SafeAreaView>
  );
}
