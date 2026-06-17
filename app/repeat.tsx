import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { ArrowLeft, Plus } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import EmptyState from '@/components/repeat/EmptyState';
import RepeatEditModal from '@/components/repeat/RepeatEditModal';
import RepeatReservationCard from '@/components/repeat/RepeatReservationCard';
import { PALETTE } from '@/constants/colors';
import { ICON_SIZE } from '@/constants/icons';
import { ADD_CTA_LABEL, EMPTY_REPEAT_FORM, SCREEN_TITLE } from '@/constants/repeat';
import { DEFAULT_ROUTE_OPTION } from '@/constants/setup';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { createReservation, deleteReservation, getReservations, updateReservation } from '@/api/reservation';
import type { ReservationListItem } from '@/api/reservation/types';
import { useRouteDraftStore } from '@/stores/routeDraftStore';
import {
  daysToRepeatDays,
  parseArrivalTimeString,
  repeatDaysShortToNumbers,
  routeOptionToApiOption,
  routeOptionToApiPutOption,
  toArrivalTimeString,
} from '@/utils/reservationTransform';
import type { RepeatFormData, RepeatItem } from '@/types/repeat.types';

const LIST_PADDING_CLASS = 'gap-3 p-5';
const INITIAL_NEXT_ID = 1;
const HIT_SLOP_BACK = 8;

async function loadRepeats(): Promise<RepeatItem[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.REPEATS);
    return raw ? (JSON.parse(raw) as RepeatItem[]) : [];
  } catch {
    return [];
  }
}

async function persistRepeats(items: RepeatItem[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.REPEATS, JSON.stringify(items));
  } catch {
    // 스토리지 오류는 무시 — 다음 실행에 재시도
  }
}

/**
 * 서버 목록과 로컬 캐시를 병합한다.
 * - 서버 항목: name/origin/destination/days/arrivalTime은 서버 우선
 * - 로컬 전용 필드(enabled, safetyBufferMin, 좌표, routeOption)는 캐시에서 복원
 * - reservationId 없는 로컬 항목(POST 대기 중)은 뒤에 붙여 유지
 */
function mergeWithServerList(
  serverItems: ReservationListItem[],
  cached: RepeatItem[],
  startId: number,
): { items: RepeatItem[]; nextId: number } {
  let id = startId;

  const merged = serverItems.map((s) => {
    const local = cached.find((c) => c.reservationId === s.reservationId);
    if (local) {
      return {
        ...local,
        name: s.nickname ?? local.name,
        origin: s.originName,
        destination: s.destName,
        days: repeatDaysShortToNumbers(s.repeatDays),
        ...parseArrivalTimeString(s.arrivalTime),
      };
    }
    return {
      id: id++,
      reservationId: s.reservationId,
      name: s.nickname ?? '',
      origin: s.originName,
      destination: s.destName,
      days: repeatDaysShortToNumbers(s.repeatDays),
      ...parseArrivalTimeString(s.arrivalTime),
      routeOption: DEFAULT_ROUTE_OPTION,
      enabled: true,
    } satisfies RepeatItem;
  });

  const localOnly = cached.filter((c) => c.reservationId === undefined);

  return { items: [...merged, ...localOnly], nextId: id };
}

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

  const pageBg = 'bg-zinc-50';
  const headerBg = 'bg-white border-zinc-100';
  const headingText = 'text-zinc-900';
  const backBg = 'bg-zinc-100';
  const backIconColor = PALETTE.zinc500;
  const addBtnBg = 'bg-blue-50';
  const addBtnText = 'text-blue-600';

  useEffect(() => {
    async function init() {
      const cached = await loadRepeats();
      const startId =
        cached.length > 0 ? Math.max(...cached.map((r) => r.id)) + 1 : INITIAL_NEXT_ID;

      try {
        const serverItems = await getReservations();
        const { items, nextId } = mergeWithServerList(serverItems, cached, startId);
        nextIdRef.current = nextId;
        setRepeats(items);
        persistRepeats(items);
      } catch {
        // GET 실패 시 로컬 캐시로 폴백
        nextIdRef.current = startId;
        setRepeats(cached);
      }
    }

    init();
  }, []);

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
    setRepeats((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
      persistRepeats(next);
      return next;
    });
  };

  const handleDelete = (id: number) => {
    const target = repeats.find((r) => r.id === id);
    if (target?.reservationId) {
      deleteReservation(target.reservationId).catch(() => {
        // 서버 삭제 실패 시 로컬에서만 제거 (재시도는 사용자 재진입 시)
      });
    }
    setRepeats((prev) => {
      const next = prev.filter((r) => r.id !== id);
      persistRepeats(next);
      return next;
    });
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

      setRepeats((prev) => {
        const next = prev.map((r) => (r.id === editTarget.id ? { ...r, ...draftForm } : r));
        persistRepeats(next);
        return next;
      });
      setEditOpen(false);
      return;
    }

    const newItem: RepeatItem = {
      ...draftForm,
      id: nextIdRef.current++,
      enabled: true,
    };

    console.log('[repeat] coords:', {
      originLat: draftForm.originLat,
      originLng: draftForm.originLng,
      destLat: draftForm.destLat,
      destLng: draftForm.destLng,
      hasCoords: hasAllCoords(draftForm),
    });

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
      } catch (e) {
        console.log('[repeat] POST error:', e);
      }
    } else {
      console.log('[repeat] POST skipped — coords missing, saved locally only');
    }

    setRepeats((prev) => {
      const next = [...prev, newItem];
      persistRepeats(next);
      return next;
    });
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

      console.log('[repeat] returned from search, pending:', pending);

      if (pending) {
        if (pending.field === 'from') {
          setDraftForm((prev) => ({
            ...prev,
            origin: pending.location,
            originLat: fromCoords?.lat,
            originLng: fromCoords?.lng,
          }));
          console.log('[repeat] origin set:', pending.location, fromCoords);
        } else {
          setDraftForm((prev) => ({
            ...prev,
            destination: pending.location,
            destLat: toCoords?.lat,
            destLng: toCoords?.lng,
          }));
          console.log('[repeat] destination set:', pending.location, toCoords);
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
              onPress={handleEdit}
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
