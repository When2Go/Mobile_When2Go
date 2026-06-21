import { useMemo } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import {
  NaverMapMarkerOverlay,
  NaverMapPathOverlay,
  NaverMapPolylineOverlay,
  NaverMapView,
} from '@mj-studio/react-native-naver-map';
import { Check, MapPin } from 'lucide-react-native';

import BottomSheetModal from '@/components/common/BottomSheetModal';
import { PALETTE } from '@/constants/colors';
import { ICON_SIZE } from '@/constants/icons';
import {
  BADGE_LABEL,
  CONFIRM_LABEL,
  CONFIRMED_LABEL,
  DEPART_SUFFIX,
  NOTIFICATION_NOTICE,
  RESERVATION_TITLE,
  type RouteDisplayItem,
  type RouteBadgeId,
} from '@/constants/result';
import { decodePolyline, findBoardingIndex } from '@/utils/route/decodePolyline';

const SHEET_SNAP_POINTS = ['78%'];
const MODAL_MAP_HEIGHT = 180;
const MODAL_MAP_ZOOM = 13;
// 모달 BottomSheetModal의 px-5 패딩(20px)을 상쇄해 지도가 좌우 전체 너비를 채우도록.
const MODAL_MAP_HORIZONTAL_BLEED = -20;
// 지도 내 경로 스타일 (MapPreview와 동일)
const TRANSIT_PATH_WIDTH = 12;
const TRANSIT_PATH_COLOR = PALETTE.blue600;
const TRANSIT_OUTLINE_WIDTH = 1;
const TRANSIT_OUTLINE_COLOR = PALETTE.white;
const TRANSIT_PATTERN_INTERVAL = 50;
const TRANSIT_ARROW_IMAGE = require('@/assets/images/map/arrow_white.png');
const CONNECTOR_WIDTH = 3;
const CONNECTOR_COLOR = PALETTE.zinc400;
const CONNECTOR_PATTERN = [6, 6];
const START_MARKER_SIZE = 20;
const DESTINATION_ICON_SIZE = 32;
const DESTINATION_DOT_SIZE = 8;
const DESTINATION_DOT_RADIUS = 4;
const DESTINATION_DOT_TOP = 5;
// 서울 시청 기본 좌표 (polyline 없을 때 폴백)
const DEFAULT_LAT = 37.5666791;
const DEFAULT_LNG = 126.9782914;

const BADGE_BG_CLASS: Record<RouteBadgeId, string> = {
  optimal: 'bg-blue-600',
  min_transfer: 'bg-emerald-600',
};

const STEPS_JOINER = ' → ';

interface ReservationCompleteModalProps {
  isOpen: boolean;
  route: RouteDisplayItem | null;
  confirmed: boolean;
  /** 생성 API 호출 진행 중 — 버튼 비활성·스피너 표시. */
  isCreating?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ReservationCompleteModal({
  isOpen,
  route,
  confirmed,
  isCreating = false,
  onClose,
  onConfirm,
}: ReservationCompleteModalProps) {
  const summaryCard = 'bg-zinc-50 border-zinc-100';
  const subText = 'text-zinc-500';
  const departureText = 'text-blue-500';

  const confirmBg = confirmed ? 'bg-emerald-500' : 'bg-blue-600';

  // 지도 미리보기용 좌표 계산
  const allCoords = useMemo(
    () => (route?.encodedPolyline ? decodePolyline(route.encodedPolyline) : null),
    [route?.encodedPolyline],
  );

  const transitCoords = useMemo(() => {
    if (!allCoords || allCoords.length < 2) return allCoords;
    if (!route?.boardingCoord) return allCoords;
    const idx = findBoardingIndex(allCoords, route.boardingCoord);
    return allCoords.slice(idx);
  }, [allCoords, route?.boardingCoord]);

  // 지도 중심: 탑승 지점 또는 폴리라인 중간점
  const mapCenter = useMemo(() => {
    if (route?.boardingCoord) {
      return { latitude: route.boardingCoord.latitude, longitude: route.boardingCoord.longitude };
    }
    if (allCoords && allCoords.length > 0) {
      const mid = allCoords[Math.floor(allCoords.length / 2)];
      return { latitude: mid.latitude, longitude: mid.longitude };
    }
    return { latitude: DEFAULT_LAT, longitude: DEFAULT_LNG };
  }, [route?.boardingCoord, allCoords]);

  const destinationCoord = allCoords && allCoords.length > 0 ? allCoords[allCoords.length - 1] : null;

  const buttonContent = (() => {
    if (confirmed) {
      return (
        <>
          <Check size={ICON_SIZE.header} color={PALETTE.white} />
          <Text className="ml-2 text-base font-bold text-white">{CONFIRMED_LABEL}</Text>
        </>
      );
    }
    if (isCreating) {
      return <ActivityIndicator color={PALETTE.white} />;
    }
    return <Text className="text-base font-bold text-white">{CONFIRM_LABEL}</Text>;
  })();

  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={onClose}
      title={RESERVATION_TITLE}
      snapPoints={SHEET_SNAP_POINTS}
      scrollable
    >
      {route ? (
        <View>
          {/* 경로 지도 미리보기 */}
          {route.encodedPolyline ? (
            <View
              style={{
                height: MODAL_MAP_HEIGHT,
                marginHorizontal: MODAL_MAP_HORIZONTAL_BLEED,
                marginBottom: 20,
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <NaverMapView
                style={{ flex: 1 }}
                initialCamera={{ ...mapCenter, zoom: MODAL_MAP_ZOOM }}
                isShowLocationButton={false}
                isShowZoomControls={false}
                isShowCompass={false}
                isShowScaleBar={false}
                isShowIndoorLevelPicker={false}
              >
                {/* 도보 구간 점선 (탑승 지점까지) */}
                {route.boardingCoord && allCoords && allCoords.length > 0 && (
                  <NaverMapPolylineOverlay
                    coords={[allCoords[0], route.boardingCoord]}
                    width={CONNECTOR_WIDTH}
                    color={CONNECTOR_COLOR}
                    pattern={CONNECTOR_PATTERN}
                  />
                )}

                {/* 대중교통 경로 실선 */}
                {transitCoords && transitCoords.length > 1 && (
                  <NaverMapPathOverlay
                    coords={transitCoords}
                    width={TRANSIT_PATH_WIDTH}
                    color={TRANSIT_PATH_COLOR}
                    outlineWidth={TRANSIT_OUTLINE_WIDTH}
                    outlineColor={TRANSIT_OUTLINE_COLOR}
                    patternImage={TRANSIT_ARROW_IMAGE}
                    patternInterval={TRANSIT_PATTERN_INTERVAL}
                  />
                )}

                {/* 탑승 지점 마커 */}
                {route.boardingCoord && (
                  <NaverMapMarkerOverlay
                    latitude={route.boardingCoord.latitude}
                    longitude={route.boardingCoord.longitude}
                    anchor={{ x: 0.5, y: 0.5 }}
                    width={START_MARKER_SIZE}
                    height={START_MARKER_SIZE}
                  >
                    <View
                      collapsable={false}
                      className="rounded-full border-2 border-blue-600 bg-white"
                      style={{ width: START_MARKER_SIZE, height: START_MARKER_SIZE }}
                    />
                  </NaverMapMarkerOverlay>
                )}

                {/* 목적지 마커 */}
                {destinationCoord && (
                  <NaverMapMarkerOverlay
                    latitude={destinationCoord.latitude}
                    longitude={destinationCoord.longitude}
                    anchor={{ x: 0.5, y: 1 }}
                    width={DESTINATION_ICON_SIZE}
                    height={DESTINATION_ICON_SIZE}
                  >
                    <View
                      collapsable={false}
                      style={{ width: DESTINATION_ICON_SIZE, height: DESTINATION_ICON_SIZE }}
                    >
                      <MapPin
                        size={DESTINATION_ICON_SIZE}
                        color={PALETTE.red500}
                        fill={PALETTE.red500}
                      />
                      <View
                        style={{
                          position: 'absolute',
                          top: DESTINATION_DOT_TOP,
                          alignSelf: 'center',
                          width: DESTINATION_DOT_SIZE,
                          height: DESTINATION_DOT_SIZE,
                          borderRadius: DESTINATION_DOT_RADIUS,
                          backgroundColor: PALETTE.white,
                        }}
                      />
                    </View>
                  </NaverMapMarkerOverlay>
                )}
              </NaverMapView>
            </View>
          ) : null}

          {/* 선택 경로 요약 */}
          <View className={`mb-5 rounded-2xl border p-4 ${summaryCard}`}>
            <View className="mb-2 flex-row items-center">
              {route.badge ? (
                <View className={`rounded-full px-2 py-0.5 ${BADGE_BG_CLASS[route.badge]}`}>
                  <Text className="text-[11px] font-bold text-white">
                    {BADGE_LABEL[route.badge]}
                  </Text>
                </View>
              ) : null}
              <Text className={`${route.badge ? 'ml-2' : ''} text-xs ${subText}`}>{route.durationLabel}</Text>
            </View>
            <View className="flex-row items-baseline">
              <Text className={`text-2xl font-black ${departureText}`}>{route.departureTime}</Text>
              <Text className={`ml-2 text-sm font-semibold ${subText}`}>{DEPART_SUFFIX}</Text>
            </View>
            <Text className={`mt-1 text-sm ${subText}`}>{route.steps.join(STEPS_JOINER)}</Text>
          </View>

          <Text className={`mb-5 text-center text-sm ${subText}`}>{NOTIFICATION_NOTICE}</Text>

          <Pressable
            onPress={onConfirm}
            disabled={confirmed || isCreating}
            accessibilityRole="button"
            accessibilityLabel={confirmed ? CONFIRMED_LABEL : CONFIRM_LABEL}
            className={`flex-row items-center justify-center rounded-2xl py-4 active:opacity-80 ${confirmBg} ${isCreating && !confirmed ? 'opacity-70' : ''}`}
          >
            {buttonContent}
          </Pressable>
        </View>
      ) : null}
    </BottomSheetModal>
  );
}
