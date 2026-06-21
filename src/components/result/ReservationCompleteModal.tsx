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
// 모달 BottomSheetModal의 px-5 패딩(20px)을 상쇄해 지도가 좌우 전체 너비를 채우도록.
const MODAL_MAP_HORIZONTAL_BLEED = -20;
const MODAL_MAP_MARGIN_BOTTOM = 20;
const MODAL_MAP_BORDER_RADIUS = 12;
// 바운딩 박스 줌 계산: 경로 전체가 지도에 들어오도록 카메라를 자동 조정.
const BBOX_PADDING = 0.3;       // 경로 주변 30% 여백
const TILE_PX = 256;            // 웹 메르카토르 타일 기본 크기
const MAP_WIDTH_PX = 390;       // 전형적인 폰 스크린 너비 (px, 가로 full-bleed)
const ZOOM_MIN = 0;
const ZOOM_MAX = 7;
const ZOOM_FALLBACK = 13;
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

  // 경로 전체가 들어오도록 바운딩 박스 기반으로 카메라 중심·줌 계산
  const mapCamera = useMemo(() => {
    const coords = allCoords;
    if (!coords || coords.length === 0) {
      return { latitude: DEFAULT_LAT, longitude: DEFAULT_LNG, zoom: ZOOM_FALLBACK };
    }
    const lats = coords.map((c) => c.latitude);
    const lngs = coords.map((c) => c.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latSpan = (maxLat - minLat) * (1 + BBOX_PADDING);
    const lngSpan = (maxLng - minLng) * (1 + BBOX_PADDING);
    // 타일(256px) 기준으로 경도·위도 스팬이 뷰에 들어오는 줌 레벨 계산
    const zoomH = Math.log2((MAP_WIDTH_PX / TILE_PX) * (360 / Math.max(lngSpan, 0.0001)));
    const zoomV = Math.log2((MODAL_MAP_HEIGHT / TILE_PX) * (360 / Math.max(latSpan, 0.0001)));
    const zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Math.floor(Math.min(zoomH, zoomV))));
    return { latitude: (minLat + maxLat) / 2, longitude: (minLng + maxLng) / 2, zoom };
  }, [allCoords]);

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
              pointerEvents="none"
              style={{
                height: MODAL_MAP_HEIGHT,
                marginHorizontal: MODAL_MAP_HORIZONTAL_BLEED,
                marginBottom: MODAL_MAP_MARGIN_BOTTOM,
                borderRadius: MODAL_MAP_BORDER_RADIUS,
                overflow: 'hidden',
              }}
            >
              <NaverMapView
                style={{ flex: 1 }}
                initialCamera={mapCamera}
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
