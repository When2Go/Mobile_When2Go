import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  NaverMapMarkerOverlay,
  NaverMapPathOverlay,
  NaverMapPolylineOverlay,
  NaverMapView,
} from '@mj-studio/react-native-naver-map';
import { MapPin } from 'lucide-react-native';

import { PALETTE } from '@/constants/colors';
import { useCurrentLocation } from '@/hooks/location/useCurrentLocation';
import { useRouteDraftStore } from '@/stores/routeDraftStore';
import { useActiveTripStore } from '@/stores/activeTripStore';
import { decodePolyline, findBoardingIndex } from '@/utils/route/decodePolyline';

const INITIAL_ZOOM = 15;
const FALLBACK_NOTE = '위치 권한이 없어 서울 시청을 기준으로 표시합니다.';
const LOCATION_DOT_SIZE = 16;
// 대중교통 구간 — 흰색 화살표 패턴이 들어간 두꺼운 파란 경로선
const TRANSIT_PATH_WIDTH = 12;
const TRANSIT_PATH_COLOR = PALETTE.blue600;
const TRANSIT_OUTLINE_WIDTH = 1;
const TRANSIT_OUTLINE_COLOR = PALETTE.white;
const TRANSIT_PATTERN_INTERVAL = 50; // dp 단위, 화살표 반복 간격
const TRANSIT_ARROW_IMAGE = require('@/assets/images/map/arrow_white.png');
// 현재 위치 → 탑승 지점 점선
const CONNECTOR_WIDTH = 3;
const CONNECTOR_COLOR = PALETTE.zinc400;
const CONNECTOR_PATTERN = [6, 6]; // 6dp 선 + 6dp 간격
const START_MARKER_SIZE = 20;
const DESTINATION_ICON_SIZE = 32;
// 목적지 핀 — 중앙 흰색 원
const DESTINATION_DOT_SIZE = 8;
const DESTINATION_DOT_RADIUS = 4;
const DESTINATION_DOT_TOP = 5;
// 출발 오버레이 버튼
const DEPART_LABEL = '출발하기';
const CANCEL_LABEL = '취소';

export default function MapPreview() {
  const { lat, lng, isGranted, isLoading } = useCurrentLocation();
  const selectedPolyline = useRouteDraftStore((s) => s.selectedPolyline);
  const selectedBoardingCoord = useRouteDraftStore((s) => s.selectedBoardingCoord);

  const activeTripPolyline = useActiveTripStore((s) => s.activeTripPolyline);
  const activeTripBoardingCoord = useActiveTripStore((s) => s.activeTripBoardingCoord);
  const isActiveTrip = useActiveTripStore((s) => s.isActiveTrip);
  const hasDeparted = useActiveTripStore((s) => s.hasDeparted);
  const clearActiveTrip = useActiveTripStore((s) => s.clearActiveTrip);
  const confirmDeparture = useActiveTripStore((s) => s.confirmDeparture);

  // 출발 모드일 때는 activeTripStore, 경로 선택 중일 때는 routeDraftStore 읽기
  const polyline = isActiveTrip ? activeTripPolyline : selectedPolyline;
  const boardingCoordSource = isActiveTrip ? activeTripBoardingCoord : selectedBoardingCoord;

  const allCoords = useMemo(
    () => (polyline ? decodePolyline(polyline) : null),
    [polyline],
  );

  // 탑승 지점 이후 좌표만 실선으로 표시 (도보 구간 제외)
  const transitCoords = useMemo(() => {
    if (!allCoords || allCoords.length < 2) return allCoords;
    if (!boardingCoordSource) return allCoords;
    const idx = findBoardingIndex(allCoords, boardingCoordSource);
    return allCoords.slice(idx);
  }, [allCoords, boardingCoordSource]);

  // 점선 연결: 현재 위치 → 탑승 지점 (boardingCoord 없으면 비표시)
  const connectorCoords = useMemo(() => {
    if (!boardingCoordSource) return null;
    return [{ latitude: lat, longitude: lng }, boardingCoordSource];
  }, [lat, lng, boardingCoordSource]);

  const boardingMarker = boardingCoordSource;
  const destinationCoord = allCoords && allCoords.length > 0 ? allCoords[allCoords.length - 1] : null;

  const baseBg = 'bg-zinc-200';
  const captionText = 'text-zinc-500';
  const captionBg = 'bg-white/80';

  const showOverlay = isActiveTrip && !hasDeparted;

  if (isLoading) {
    return (
      <View
        className={`flex-1 items-center justify-center ${baseBg}`}
        accessibilityLabel="지도 미리보기 로딩 중"
      />
    );
  }

  return (
    <View className="flex-1" accessibilityLabel="지도 미리보기">
      <NaverMapView
        style={{ flex: 1 }}
        initialCamera={{ latitude: lat, longitude: lng, zoom: INITIAL_ZOOM }}
        isShowLocationButton={false}
        isShowZoomControls={false}
        isShowCompass={false}
        isShowScaleBar={false}
        isShowIndoorLevelPicker={false}
      >
        {/* 현재 위치 점 */}
        {isGranted && (
          <NaverMapMarkerOverlay
            latitude={lat}
            longitude={lng}
            anchor={{ x: 0.5, y: 0.5 }}
            width={LOCATION_DOT_SIZE}
            height={LOCATION_DOT_SIZE}
          >
            <View
              collapsable={false}
              className="h-4 w-4 rounded-full border-2 border-white bg-blue-500"
              accessibilityLabel="현재 위치"
            />
          </NaverMapMarkerOverlay>
        )}

        {/* 현재 위치 → 탑승 지점 점선 (도보 구간) */}
        {connectorCoords && (
          <NaverMapPolylineOverlay
            coords={connectorCoords}
            width={CONNECTOR_WIDTH}
            color={CONNECTOR_COLOR}
            pattern={CONNECTOR_PATTERN}
          />
        )}

        {/* 대중교통 경로 (탑승 지점부터, 일정 간격 흰색 화살표 패턴) */}
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

        {/* 탑승 지점 마커 (흰 동그라미) */}
        {boardingMarker && (
          <NaverMapMarkerOverlay
            latitude={boardingMarker.latitude}
            longitude={boardingMarker.longitude}
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

        {/* 목적지 마커 — 빨간 핀 + 중앙 흰색 원 */}
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
              <MapPin size={DESTINATION_ICON_SIZE} color={PALETTE.red500} fill={PALETTE.red500} />
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

      {!isGranted && !showOverlay && (
        <View className="absolute bottom-2 left-4 right-4 items-center">
          <View className={`rounded-full px-3 py-1.5 ${captionBg}`}>
            <Text className={`text-[11px] font-medium ${captionText}`}>
              {FALLBACK_NOTE}
            </Text>
          </View>
        </View>
      )}

      {/* 출발 모드 오버레이 — [출발하기] / [취소] */}
      {showOverlay && (
        <View className="absolute bottom-5 left-4 right-4 flex-row gap-3">
          <Pressable
            onPress={clearActiveTrip}
            accessibilityRole="button"
            accessibilityLabel={CANCEL_LABEL}
            className="flex-1 items-center justify-center rounded-2xl border border-zinc-300 bg-white py-3.5 active:opacity-70"
          >
            <Text className="text-sm font-bold text-zinc-700">{CANCEL_LABEL}</Text>
          </Pressable>
          <Pressable
            onPress={confirmDeparture}
            accessibilityRole="button"
            accessibilityLabel={DEPART_LABEL}
            className="flex-[2] items-center justify-center rounded-2xl bg-blue-600 py-3.5 active:opacity-80"
          >
            <Text className="text-sm font-bold text-white">{DEPART_LABEL}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
