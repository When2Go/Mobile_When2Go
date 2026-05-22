import { View } from 'react-native';
import { KakaoMapView } from '@react-native-kakao/map';

import { useCurrentLocation } from '@/hooks/location/useCurrentLocation';
import { useTheme } from '@/contexts/ThemeContext';

const DEFAULT_ZOOM_LEVEL = 3;
const MARKER_PULSE_SIZE = 56;
const MARKER_DOT_SIZE = 28;
const MARKER_INNER_DOT = 10;

export default function MapPreview() {
  const { isDark } = useTheme();
  const { lat, lng, isGranted, isLoading } = useCurrentLocation();

  const loadingBg = isDark ? 'bg-zinc-800' : 'bg-zinc-200';

  if (isLoading) {
    return (
      <View
        className={`flex-1 ${loadingBg}`}
        accessibilityLabel="지도 로딩 중"
      />
    );
  }

  return (
    <View className="flex-1" accessibilityLabel="카카오 지도">
      <KakaoMapView
        style={{ flex: 1 }}
        camera={{ lat, lng, zoomLevel: DEFAULT_ZOOM_LEVEL }}
        language="ko"
      />
      {isGranted && (
        <View
          className="absolute inset-0 items-center justify-center"
          pointerEvents="none"
        >
          <View
            className="items-center justify-center"
            style={{ width: MARKER_PULSE_SIZE, height: MARKER_PULSE_SIZE }}
          >
            <View
              className="absolute rounded-full bg-blue-500/20"
              style={{ width: MARKER_PULSE_SIZE, height: MARKER_PULSE_SIZE }}
            />
            <View
              className="items-center justify-center rounded-full border-2 border-white bg-blue-500"
              style={{ width: MARKER_DOT_SIZE, height: MARKER_DOT_SIZE }}
            >
              <View
                className="rounded-full bg-white"
                style={{ width: MARKER_INNER_DOT, height: MARKER_INNER_DOT }}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
