import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';

import { PALETTE } from '@/constants/colors';
import { ICON_SIZE } from '@/constants/icons';
import {
  ARRIVAL_TIME_PARAM,
  BUFFER_MIN_PARAM,
  CONFIRM_REDIRECT_DELAY_MS,
  SCREEN_TITLE,
  SELECT_ROUTE_HEADING,
  type RouteDisplayItem,
} from '@/constants/result';
import { ORIGIN_CURRENT_LOCATION } from '@/constants/trip';
import { useSettingsStore } from '@/stores/settingsStore';
import { useRouteDraftStore } from '@/stores/routeDraftStore';
import { useRouteSearch } from '@/hooks/route/useRouteSearch';
import { useCreateTrip } from '@/hooks/trip/useCreateTrip';
import type { RouteSearchRequest } from '@/api/route/types';
import type { TripCreateRequest } from '@/api/trip/types';
import AdSlot from '@/components/common/AdSlot';
import DepartureTimeHeader from '@/components/result/DepartureTimeHeader';
import RouteCard from '@/components/result/RouteCard';
import ReservationCompleteModal from '@/components/result/ReservationCompleteModal';

const SCHEDULE_PATH = '/schedule';
const ERROR_MESSAGE = '경로를 불러오지 못했습니다. 다시 시도해 주세요.';
const EMPTY_MESSAGE = '조건에 맞는 경로가 없습니다.';
const ARRIVAL_TARGET_SUFFIX = '도착을 위한';
const SAVE_ERROR_TITLE = '예약 실패';
const SAVE_ERROR_MESSAGE = '일정을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요.';

function RouteListContent({
  isLoading,
  error,
  routes,
  onSelect,
}: {
  isLoading: boolean;
  error: unknown;
  routes: RouteDisplayItem[];
  onSelect: (route: RouteDisplayItem) => void;
}) {
  if (isLoading) {
    return (
      <View className="items-center py-12">
        <ActivityIndicator size="large" color={PALETTE.blue600} />
      </View>
    );
  }
  if (error) {
    return (
      <View className="items-center py-12">
        <Text className="text-sm text-zinc-500">{ERROR_MESSAGE}</Text>
      </View>
    );
  }
  if (routes.length === 0) {
    return (
      <View className="items-center py-12">
        <Text className="text-sm text-zinc-500">{EMPTY_MESSAGE}</Text>
      </View>
    );
  }
  return (
    <>
      {routes.map((route) => (
        <RouteCard key={route.id} route={route} onPress={() => onSelect(route)} />
      ))}
    </>
  );
}

export default function ResultScreen() {
  const router = useRouter();
  const globalBufferMin = useSettingsStore((s) => s.bufferMinutes);
  const rawParams = useLocalSearchParams<{
    bufferMin?: string;
    arrivalTime?: string;
  }>();

  const bufferMinParam = rawParams[BUFFER_MIN_PARAM];
  const safetyBufferMin = bufferMinParam !== undefined ? Number(bufferMinParam) : globalBufferMin;
  const arrivalTime = rawParams[ARRIVAL_TIME_PARAM] ?? '';

  const fromCoords = useRouteDraftStore((s) => s.fromCoords);
  const toCoords = useRouteDraftStore((s) => s.toCoords);
  const toName = useRouteDraftStore((s) => s.toName);
  const { create, isCreating } = useCreateTrip();

  const routeReq = useMemo<RouteSearchRequest | null>(
    () =>
      fromCoords && toCoords && arrivalTime
        ? {
            originLat: fromCoords.lat,
            originLng: fromCoords.lng,
            destLat: toCoords.lat,
            destLng: toCoords.lng,
            arrivalTime,
          }
        : null,
    [fromCoords, toCoords, arrivalTime],
  );

  const { routes, isLoading, error } = useRouteSearch(routeReq, safetyBufferMin);

  const [selectedRoute, setSelectedRoute] = useState<RouteDisplayItem | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    };
  }, []);

  const pageBg = 'bg-zinc-50';
  const cardBg = 'bg-white';
  const dividerBorder = 'border-zinc-100';
  const headingText = 'text-zinc-900';
  const backBg = 'bg-zinc-100';
  const backIconColor = PALETTE.zinc500;

  const handleSelectRoute = (route: RouteDisplayItem) => {
    setSelectedRoute(route);
    setConfirmed(false);
  };

  const handleCloseModal = () => {
    if (confirmed) return;
    setSelectedRoute(null);
  };

  const handleConfirm = async () => {
    if (confirmed || isCreating) return;
    if (!selectedRoute || !fromCoords || !toCoords || !arrivalTime) return;

    const payload: TripCreateRequest = {
      originName: ORIGIN_CURRENT_LOCATION,
      originLat: fromCoords.lat,
      originLng: fromCoords.lng,
      destName: toName ?? selectedRoute.steps[selectedRoute.steps.length - 1] ?? ORIGIN_CURRENT_LOCATION,
      destLat: toCoords.lat,
      destLng: toCoords.lng,
      // 백엔드는 "yyyy-MM-dd HH:mm"(공백 구분, T·초·오프셋 없음)만 파싱한다.
      // setup의 toDateTimeString이 이미 이 형식이므로 변환 없이 그대로 전달.
      arrivalTime,
      bufferMinutes: safetyBufferMin,
      durationSeconds: selectedRoute.durationSeconds,
    };

    const failure = await create(payload);
    if (failure) {
      Alert.alert(SAVE_ERROR_TITLE, failure.message ?? SAVE_ERROR_MESSAGE);
      return;
    }

    setConfirmed(true);
    redirectTimerRef.current = setTimeout(() => {
      setSelectedRoute(null);
      setConfirmed(false);
      router.push(SCHEDULE_PATH);
    }, CONFIRM_REDIRECT_DELAY_MS);
  };

  const arrivalTargetPrefix = arrivalTime
    ? `${arrivalTime} ${ARRIVAL_TARGET_SUFFIX}`
    : ARRIVAL_TARGET_SUFFIX;

  return (
    <SafeAreaView className={`flex-1 ${pageBg}`} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View
        className={`flex-row items-center gap-3 border-b px-5 py-4 ${cardBg} ${dividerBorder}`}
      >
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

      {/* Scrollable content */}
      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-8"
        showsVerticalScrollIndicator={false}
      >
        <DepartureTimeHeader
          targetPrefix={arrivalTargetPrefix}
          heading={SELECT_ROUTE_HEADING}
          safetyBufferMin={safetyBufferMin}
        />

        <View className="gap-3 px-5">
          <RouteListContent
            isLoading={isLoading}
            error={error}
            routes={routes}
            onSelect={handleSelectRoute}
          />
        </View>
      </ScrollView>

      {/* Bottom Ad Slot */}
      <View className={`border-t p-4 ${cardBg} ${dividerBorder}`}>
        <AdSlot type="banner" />
      </View>

      {selectedRoute ? (
        <ReservationCompleteModal
          isOpen={selectedRoute !== null}
          route={selectedRoute}
          confirmed={confirmed}
          isCreating={isCreating}
          onClose={handleCloseModal}
          onConfirm={handleConfirm}
        />
      ) : null}
    </SafeAreaView>
  );
}
