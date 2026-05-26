import { useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import {
  NaverMapMarkerOverlay,
  NaverMapView,
  type NaverMapViewRef,
} from '@mj-studio/react-native-naver-map';

import { useTheme } from '@/contexts/ThemeContext';
import { useCurrentLocation } from '@/hooks/location/useCurrentLocation';

const INITIAL_ZOOM = 15;
const FALLBACK_NOTE = '위치 권한이 없어 서울 시청을 기준으로 표시합니다.';

export default function MapPreview() {
  const { isDark } = useTheme();
  const { lat, lng, isGranted, isLoading } = useCurrentLocation();
  const mapRef = useRef<NaverMapViewRef>(null);

  const baseBg = isDark ? 'bg-zinc-800' : 'bg-zinc-200';
  const captionText = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const captionBg = isDark ? 'bg-zinc-900/70' : 'bg-white/80';

  useEffect(() => {
    if (isLoading) return;
    mapRef.current?.setLocationTrackingMode(isGranted ? 'Follow' : 'None');
  }, [isGranted, isLoading]);

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
        ref={mapRef}
        style={{ flex: 1 }}
        initialCamera={{ latitude: lat, longitude: lng, zoom: INITIAL_ZOOM }}
        isShowLocationButton={false}
        isShowZoomControls={false}
        isShowCompass={false}
        isShowScaleBar={false}
        isShowIndoorLevelPicker={false}
      >
        <NaverMapMarkerOverlay
          latitude={lat}
          longitude={lng}
          anchor={{ x: 0.5, y: 1 }}
        />
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
