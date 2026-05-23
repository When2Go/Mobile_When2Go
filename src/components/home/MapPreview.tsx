import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { KakaoMapView } from '@react-native-kakao/map';
import { LocateFixed } from 'lucide-react-native';

import { useCurrentLocation } from '@/hooks/location/useCurrentLocation';
import { useTheme } from '@/contexts/ThemeContext';

// 카카오 SDK 줌: 높을수록 확대. 동/구 수준(약 1km 범위)이 홈 미리보기에 적당.
const DEFAULT_ZOOM_LEVEL = 15;
const CAMERA_ANIMATION_MS = 400;
const MARKER_PULSE_SIZE = 56;
const MARKER_DOT_SIZE = 28;
const MARKER_INNER_DOT = 10;
const RECENTER_BUTTON_SIZE = 44;
const RECENTER_ICON_SIZE = 22;
// lucide 아이콘은 color prop이 색상 문자열을 요구 — NativeWind 토큰과 톤을 맞춰 상수로 분리.
const RECENTER_ICON_LIGHT = '#0f172a'; // zinc-900
const RECENTER_ICON_DARK = '#ffffff';

export default function MapPreview() {
  const { isDark } = useTheme();
  const { lat, lng, isGranted, isLoading } = useCurrentLocation();
  // 우상단 "내 위치" 버튼 클릭마다 카메라가 현재 좌표로 복귀하도록 강제 갱신용 카운터.
  // useMemo deps에 포함시켜, 좌표가 같아도 새 객체 → KakaoMapView가 moveCamera 호출.
  const [recenterTick, setRecenterTick] = useState(0);

  // 좌표 또는 recenter 트리거 변경 시 새 객체.
  // 매 렌더마다 새 객체를 넘기면 사용자가 패닝할 때마다 카메라가 되돌아온다(#39 회귀).
  //
  // RNCKakaoMapView.mm은 `p.camera != n.camera`로 네이티브 struct 값 비교를 한다.
  // JS 참조만 바꾸면 값이 같아 moveCamera가 스킵된다. rotation에 무해한 미세 토글
  // (1e-6도, 사용자 시각상 0)을 넣어 struct 자체를 다르게 만들어 강제 갱신한다.
  const camera = useMemo(
    () => ({
      lat,
      lng,
      zoomLevel: DEFAULT_ZOOM_LEVEL,
      rotation: (recenterTick % 2) * 1e-6,
    }),
    [lat, lng, recenterTick],
  );

  const loadingBg = isDark ? 'bg-zinc-800' : 'bg-zinc-200';
  const markerDot = isDark ? 'bg-blue-500' : 'bg-blue-600';
  const markerPulse = isDark ? 'bg-blue-500/20' : 'bg-blue-600/20';
  const markerBorder = isDark ? 'border-zinc-900' : 'border-white';
  const markerInner = isDark ? 'bg-zinc-900' : 'bg-white';
  const recenterBg = isDark ? 'bg-zinc-800/90' : 'bg-white/90';
  const recenterIconColor = isDark ? RECENTER_ICON_DARK : RECENTER_ICON_LIGHT;

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
        camera={camera}
        cameraAnimationDuration={CAMERA_ANIMATION_MS}
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
              className={`absolute rounded-full ${markerPulse}`}
              style={{ width: MARKER_PULSE_SIZE, height: MARKER_PULSE_SIZE }}
            />
            <View
              className={`items-center justify-center rounded-full border-2 ${markerBorder} ${markerDot}`}
              style={{ width: MARKER_DOT_SIZE, height: MARKER_DOT_SIZE }}
            >
              <View
                className={`rounded-full ${markerInner}`}
                style={{ width: MARKER_INNER_DOT, height: MARKER_INNER_DOT }}
              />
            </View>
          </View>
        </View>
      )}
      {isGranted && (
        <Pressable
          onPress={() => setRecenterTick(t => t + 1)}
          accessibilityLabel="내 위치로 돌아가기"
          accessibilityRole="button"
          className={`absolute right-4 top-24 items-center justify-center rounded-full shadow-md ${recenterBg} active:opacity-70`}
          style={{ width: RECENTER_BUTTON_SIZE, height: RECENTER_BUTTON_SIZE }}
        >
          <LocateFixed size={RECENTER_ICON_SIZE} color={recenterIconColor} />
        </Pressable>
      )}
    </View>
  );
}
