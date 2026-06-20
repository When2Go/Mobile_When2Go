import { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { Mic } from 'lucide-react-native';

import BottomSheetModal from '@/components/common/BottomSheetModal';
import { PALETTE } from '@/constants/colors';
import { useVoiceRecognition } from '@/hooks/voice/useVoiceRecognition';
import type { TripParseResponse } from '@/api/voice/types';

const MIC_ICON_SIZE = 28;
const WAVEFORM_HEIGHTS = [3, 6, 9, 5, 11, 7, 4, 10, 6, 8, 5, 9, 4, 7, 3] as const;
const WAVEFORM_BAR_WIDTH = 6;
const WAVEFORM_HEIGHT_MULTIPLIER = 3;
const PULSE_CIRCLE_SIZE = 80;
const PULSE_CIRCLE_RADIUS = PULSE_CIRCLE_SIZE / 2;
const VOICE_SNAP_POINTS = ['70%'];
const PULSE_DURATION_MS = 1000;
const PULSE2_DELAY_MS = 300;
const SPIN_DURATION_MS = 800;
/** 최대 녹음 시간. 초과 시 자동 종료. */
const MAX_RECORD_MS = 10_000;

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (result: TripParseResponse) => void;
}

export default function VoiceModal({ isOpen, onClose, onComplete }: VoiceModalProps) {
  const { stage, result, start, stop, cancel } = useVoiceRecognition();

  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  // 모달 열릴 때 녹음 시작, MAX_RECORD_MS 후 자동 종료
  useEffect(() => {
    if (!isOpen) return;
    start();
    const timer = setTimeout(() => stop(), MAX_RECORD_MS);
    return () => clearTimeout(timer);
  }, [isOpen, start, stop]);

  // 완료: result 세팅 후 onComplete 호출
  useEffect(() => {
    if (stage === 'done' && result) {
      onComplete(result);
    }
  }, [stage, result, onComplete]);

  // 에러: 모달 닫기
  useEffect(() => {
    if (stage === 'error') {
      onClose();
    }
  }, [stage, onClose]);

  // 모달 닫힐 때 녹음 정리
  useEffect(() => {
    if (!isOpen) {
      cancel();
    }
  }, [isOpen, cancel]);

  // 펄스 애니메이션 (listening 단계)
  useEffect(() => {
    if (!isOpen || stage !== 'recording') {
      pulse1.setValue(0);
      pulse2.setValue(0);
      return;
    }
    const anim = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulse1, { toValue: 1, duration: PULSE_DURATION_MS, useNativeDriver: true }),
          Animated.timing(pulse1, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.delay(PULSE2_DELAY_MS),
          Animated.timing(pulse2, { toValue: 1, duration: PULSE_DURATION_MS, useNativeDriver: true }),
          Animated.timing(pulse2, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [isOpen, stage, pulse1, pulse2]);

  // 스핀 애니메이션 (processing 단계)
  useEffect(() => {
    if (!isOpen || stage !== 'processing') {
      spinAnim.setValue(0);
      return;
    }
    const anim = Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: SPIN_DURATION_MS, useNativeDriver: true }),
    );
    anim.start();
    return () => anim.stop();
  }, [isOpen, stage, spinAnim]);

  const pulse1Scale = pulse1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });
  const pulse1Opacity = pulse1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 0.15, 0] });
  const pulse2Scale = pulse2.interpolate({ inputRange: [0, 1], outputRange: [1, 2] });
  const pulse2Opacity = pulse2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.2, 0.1, 0] });
  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const headingText = 'text-zinc-900';
  const sub = 'text-zinc-500';
  const cancelBtnBg = 'bg-zinc-100';
  const cancelBtnText = 'text-zinc-600';

  const handleCancel = async () => {
    await cancel();
    onClose();
  };

  return (
    <BottomSheetModal isOpen={isOpen} onClose={onClose} snapPoints={VOICE_SNAP_POINTS}>
      {stage !== 'processing' ? (
        <>
          <Text className={`mb-10 text-center text-base font-bold ${headingText}`}>
            듣고 있어요...
          </Text>

          <View className="mb-10 h-28 items-center justify-center">
            <Animated.View
              style={{
                position: 'absolute',
                width: PULSE_CIRCLE_SIZE,
                height: PULSE_CIRCLE_SIZE,
                borderRadius: PULSE_CIRCLE_RADIUS,
                backgroundColor: PALETTE.blue500,
                opacity: pulse1Opacity,
                transform: [{ scale: pulse1Scale }],
              }}
            />
            <Animated.View
              style={{
                position: 'absolute',
                width: PULSE_CIRCLE_SIZE,
                height: PULSE_CIRCLE_SIZE,
                borderRadius: PULSE_CIRCLE_RADIUS,
                backgroundColor: PALETTE.blue500,
                opacity: pulse2Opacity,
                transform: [{ scale: pulse2Scale }],
              }}
            />
            <View className="h-16 w-16 items-center justify-center rounded-full bg-blue-600">
              <Mic size={MIC_ICON_SIZE} color={PALETTE.white} />
            </View>
          </View>

          <View className="mb-10 h-10 flex-row items-center justify-center gap-1">
            {WAVEFORM_HEIGHTS.map((h, i) => (
              <View
                key={i}
                className="rounded-full bg-blue-500"
                style={{ width: WAVEFORM_BAR_WIDTH, height: h * WAVEFORM_HEIGHT_MULTIPLIER }}
              />
            ))}
          </View>

          <Pressable
            onPress={handleCancel}
            accessibilityRole="button"
            className={`w-full rounded-2xl py-3.5 active:opacity-70 ${cancelBtnBg}`}
          >
            <Text className={`text-center text-sm font-semibold ${cancelBtnText}`}>취소</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text className={`mb-10 text-center text-base font-bold ${headingText}`}>
            인식 중...
          </Text>
          <View className="mb-4 items-center">
            <Animated.View
              className="h-16 w-16 rounded-full border-4 border-blue-200 border-t-blue-600"
              style={{ transform: [{ rotate: spin }] }}
            />
          </View>
          <Text className={`mt-6 text-center text-sm ${sub}`}>일정을 분석하고 있어요</Text>
        </>
      )}
    </BottomSheetModal>
  );
}
