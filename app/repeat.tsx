import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowLeft, Plus } from 'lucide-react-native';
import EmptyState from '@/components/repeat/EmptyState';
import RepeatEditModal from '@/components/repeat/RepeatEditModal';
import RepeatReservationCard from '@/components/repeat/RepeatReservationCard';
import { PALETTE } from '@/constants/colors';
import { ICON_SIZE } from '@/constants/icons';
import { ADD_CTA_LABEL, EMPTY_REPEAT_FORM, SCREEN_TITLE } from '@/constants/repeat';
import { DEFAULT_ROUTE_OPTION } from '@/constants/setup';
import { createReservation, deleteReservation, getReservations, updateReservation } from '@/api/reservation';
import { useReservationStore } from '@/stores/reservationStore';
import { useReservationToggleStore } from '@/stores/reservationToggleStore';
import { useRouteDraftStore } from '@/stores/routeDraftStore';
import {
  daysToRepeatDays,
  parseArrivalTimeString,
  repeatDaysToNumbers,
  routeOptionToApiOption,
  routeOptionToApiPutOption,
  toArrivalTimeString,
} from '@/utils/reservationTransform';
import type { RepeatFormData, RepeatItem } from '@/types/repeat.types';

const LIST_PADDING_CLASS = 'gap-3 p-5';
const INITIAL_NEXT_ID = 1;
const HIT_SLOP_BACK = 8;

function hasAllCoords(
  form: Pick<RepeatFormData, 'originLat' | 'originLng' | 'destLat' | 'destLng'>,
): boolean {
  return (
    form.originLat !== undefined &&
    form.originLng !== undefined &&
    form.destLat !== undefined &&
    form.destLng !== undefined
  );
}

export default function RepeatScreen() {
  const router = useRouter();
  const nextIdRef = useRef(INITIAL_NEXT_ID);
  const locationSelectingRef = useRef(false);
  const [repeats, setRepeats] = useState<RepeatItem[]>([]);
  const [editTarget, setEditTarget] = useState<RepeatItem | undefined>(undefined);
  const [isEditOpen, setEditOpen] = useState(false);
  const [draftForm, setDraftForm] = useState<RepeatFormData>(EMPTY_REPEAT_FORM);

  const setItems = useReservationStore((state) => state.setItems);

  useEffect(() => {
    setItems(repeats);
  }, [repeats, setItems]);

  const pageBg = 'bg-zinc-50';
  const headerBg = 'bg-white border-zinc-100';
  const headingText = 'text-zinc-900';
  const backBg = 'bg-zinc-100';
  const backIconColor = PALETTE.zinc500;
  const addBtnBg = 'bg-blue-50';
  const addBtnText = 'text-blue-600';

  useEffect(() => {
    async function init() {
      try {
        const serverItems = await getReservations();
        const { disabledIds } = useReservationToggleStore.getState();
        let id = INITIAL_NEXT_ID;
        const items: RepeatItem[] = serverItems.map((s) => ({
          id: id++,
          reservationId: s.id,
          name: s.nickname ?? '',
          origin: s.originName,
          destination: s.destName,
          days: repeatDaysToNumbers(s.repeatDays),
          ...parseArrivalTimeString(s.arrivalTime),
          routeOption: DEFAULT_ROUTE_OPTION,
          enabled: !disabledIds.includes(s.id),
        }));
        nextIdRef.current = id;
        setRepeats(items);
      } catch {
        setRepeats([]);
      }
    }

    init();
  }, []);

  const handleAdd = () => {
    setEditTarget(undefined);
    setDraftForm(EMPTY_REPEAT_FORM);
    setEditOpen(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEdit = (item: RepeatItem) => {
    setEditTarget(item);
    setDraftForm({
      name: item.name,
      origin: item.origin,
      destination: item.destination,
      originLat: item.originLat,
      originLng: item.originLng,
      destLat: item.destLat,
      destLng: item.destLng,
      days: [...item.days],
      arrivalPeriod: item.arrivalPeriod,
      arrivalHour: item.arrivalHour,
      arrivalMinute: item.arrivalMinute,
      routeOption: item.routeOption,
      safetyBufferMin: item.safetyBufferMin,
    });
    setEditOpen(true);
  };

  const handleToggle = (id: number) => {
    setRepeats((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const newEnabled = !r.enabled;
        if (r.reservationId !== undefined) {
          const { disable, enable } = useReservationToggleStore.getState();
          if (newEnabled) {
            enable(r.reservationId);
          } else {
            disable(r.reservationId);
          }
        }
        return { ...r, enabled: newEnabled };
      }),
    );
  };

  const handleDelete = (id: number) => {
    const target = repeats.find((r) => r.id === id);
    if (target?.reservationId) {
      deleteReservation(target.reservationId).catch(() => {
        // 서버 삭제 실패 시 로컬에서만 제거 (재시도는 사용자 재진입 시)
      });
      useReservationToggleStore.getState().remove(target.reservationId);
    }
    setRepeats((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSave = async () => {
    if (editTarget) {
      if (editTarget.reservationId !== undefined && hasAllCoords(draftForm)) {
        try {
          await updateReservation(editTarget.reservationId, {
            nickname: draftForm.name || undefined,
            originName: draftForm.origin,
            originLat: draftForm.originLat!,
            originLng: draftForm.originLng!,
            destName: draftForm.destination,
            destLat: draftForm.destLat!,
            destLng: draftForm.destLng!,
            routeOption: routeOptionToApiPutOption(draftForm.routeOption),
            arrivalTime: toArrivalTimeString(
              draftForm.arrivalPeriod,
              draftForm.arrivalHour,
              draftForm.arrivalMinute,
            ),
            repeatDays: daysToRepeatDays(draftForm.days),
          });
        } catch {
          // PUT 실패 시 로컬 상태만 갱신
        }
      }

      setRepeats((prev) => prev.map((r) => (r.id === editTarget.id ? { ...r, ...draftForm } : r)));
      setEditOpen(false);
      return;
    }

    const newItem: RepeatItem = {
      ...draftForm,
      id: nextIdRef.current++,
      enabled: true,
    };

    if (hasAllCoords(draftForm)) {
      try {
        const res = await createReservation({
          nickname: draftForm.name || undefined,
          originName: draftForm.origin,
          originLat: draftForm.originLat!,
          originLng: draftForm.originLng!,
          destName: draftForm.destination,
          destLat: draftForm.destLat!,
          destLng: draftForm.destLng!,
          routeOption: routeOptionToApiOption(draftForm.routeOption),
          arrivalTime: toArrivalTimeString(
            draftForm.arrivalPeriod,
            draftForm.arrivalHour,
            draftForm.arrivalMinute,
          ),
          repeatDays: daysToRepeatDays(draftForm.days),
        });
        newItem.reservationId = res.reservationId;
      } catch {
        // POST 실패 시 로컬에만 저장
      }
    }

    setRepeats((prev) => [...prev, newItem]);
    setEditOpen(false);
  };

  const handleDeleteFromModal = () => {
    if (!editTarget) return;
    handleDelete(editTarget.id);
    setEditOpen(false);
  };

  useFocusEffect(
    useCallback(() => {
      if (!locationSelectingRef.current) return;
      locationSelectingRef.current = false;

      const { consumePendingLocation, fromCoords, toCoords } = useRouteDraftStore.getState();
      const pending = consumePendingLocation();

      if (pending) {
        if (pending.field === 'from') {
          setDraftForm((prev) => ({
            ...prev,
            origin: pending.location,
            originLat: fromCoords?.lat,
            originLng: fromCoords?.lng,
          }));
        } else {
          setDraftForm((prev) => ({
            ...prev,
            destination: pending.location,
            destLat: toCoords?.lat,
            destLng: toCoords?.lng,
          }));
        }
      }
      // 선택했든 취소했든 모달을 다시 열어준다
      setEditOpen(true);
    }, []),
  );

  const handleSelectLocation = (field: 'origin' | 'destination') => {
    locationSelectingRef.current = true;
    setEditOpen(false);
    router.push({
      pathname: '/search',
      params: { mode: 'select-location', field: field === 'origin' ? 'from' : 'to' },
    });
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
            hitSlop={HIT_SLOP_BACK}
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
          <Plus size={ICON_SIZE.card} color={PALETTE.blue600} />
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
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </ScrollView>
      )}

      {isEditOpen ? (
        <RepeatEditModal
          key={editTarget?.id ?? 'new'}
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
