import { useMemo } from 'react';
import { Text, View } from 'react-native';
import {
  NaverMapMarkerOverlay,
  NaverMapPolylineOverlay,
  NaverMapView,
} from '@mj-studio/react-native-naver-map';
import { MapPin } from 'lucide-react-native';

import { PALETTE } from '@/constants/colors';
import { useCurrentLocation } from '@/hooks/location/useCurrentLocation';
import { useRouteDraftStore } from '@/stores/routeDraftStore';
import { decodePolyline } from '@/utils/route/decodePolyline';

const INITIAL_ZOOM = 15;
const FALLBACK_NOTE = '위치 권한이 없어 서울 시청을 기준으로 표시합니다.';
const LOCATION_DOT_SIZE = 16;
const POLYLINE_WIDTH = 5;
const POLYLINE_COLOR = PALETTE.blue600;
// 현재 위치 → 경로 시작점 연결선 (점선)
const CONNECTOR_WIDTH = 3;
const CONNECTOR_COLOR = PALETTE.zinc400;
const CONNECTOR_PATTERN = [6, 6]; // 6dp 선 + 6dp 간격
const START_MARKER_SIZE = 20;
const DESTINATION_ICON_SIZE = 32;

export default function MapPreview() {
  const { lat, lng, isGranted, isLoading } = useCurrentLocation();
  const selectedPolyline = useRouteDraftStore((s) => s.selectedPolyline);
  const polylineCoords = useMemo(
    () => (selectedPolyline ? decodePolyline(selectedPolyline) : null),
    [selectedPolyline],
  );

  const polylineStart = polylineCoords && polylineCoords.length > 0 ? polylineCoords[0] : null;
  const polylineEnd =
    polylineCoords && polylineCoords.length > 0
      ? polylineCoords[polylineCoords.length - 1]
      : null;

  const baseBg = 'bg-zinc-200';
  const captionText = 'text-zinc-500';
  const captionBg = 'bg-white/80';

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

        {/* 선택 경로 폴리라인 (실선) */}
        {polylineCoords && polylineCoords.length > 1 && (
          <NaverMapPolylineOverlay
            coords={polylineCoords}
            width={POLYLINE_WIDTH}
            color={POLYLINE_COLOR}
          />
        )}

        {/* 현재 위치 → 경로 시작점 점선 */}
        {polylineStart && (
          <NaverMapPolylineOverlay
            coords={[{ latitude: lat, longitude: lng }, polylineStart]}
            width={CONNECTOR_WIDTH}
            color={CONNECTOR_COLOR}
            pattern={CONNECTOR_PATTERN}
          />
        )}

        {/* 경로 시작 마커 (흰 동그라미) */}
        {polylineStart && (
          <NaverMapMarkerOverlay
            latitude={polylineStart.latitude}
            longitude={polylineStart.longitude}
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

        {/* 목적지 마커 (핀) */}
        {polylineEnd && (
          <NaverMapMarkerOverlay
            latitude={polylineEnd.latitude}
            longitude={polylineEnd.longitude}
            anchor={{ x: 0.5, y: 1 }}
            width={DESTINATION_ICON_SIZE}
            height={DESTINATION_ICON_SIZE}
          >
            <View collapsable={false}>
              <MapPin size={DESTINATION_ICON_SIZE} color={PALETTE.red500} />
            </View>
          </NaverMapMarkerOverlay>
        )}
      </NaverMapView>

      {!isGranted && (
        <View className="absolute bottom-2 left-4 right-4 items-center">
          <View className={`rounded-full px-3 py-1.5 ${captionBg}`}>
            <Text className={`text-[11px] font-medium ${captionText}`}>
              {FALLBACK_NOTE}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
