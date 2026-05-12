import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mic } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { PALETTE } from '@/constants/colors';
import SearchInput from '@/components/search/SearchInput';
import VoiceButton from '@/components/search/VoiceButton';
import RecentSearchList from '@/components/search/RecentSearchList';
import SearchResultList from '@/components/search/SearchResultList';

type VoiceStage = 'listening' | 'processing';

const VOICE_LISTENING_MS = 3000;
const VOICE_PROCESSING_MS = 1500;
const PULSE_DURATION_MS = 1000;
const PULSE2_DELAY_MS = 300;
const SPIN_DURATION_MS = 800;
const MIC_ICON_SIZE = 28;
const WAVEFORM_HEIGHTS = [3, 6, 9, 5, 11, 7, 4, 10, 6, 8, 5, 9, 4, 7, 3] as const;
const WAVEFORM_BAR_WIDTH = 6;
const WAVEFORM_HEIGHT_MULTIPLIER = 3;

export default function SearchScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  const [query, setQuery] = useState('');
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [voiceStage, setVoiceStage] = useState<VoiceStage>('listening');

  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!voiceOpen) return;
    if (voiceStage === 'listening') {
      const timer = setTimeout(() => setVoiceStage('processing'), VOICE_LISTENING_MS);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => {
      setVoiceOpen(false);
      router.push('/setup');
    }, VOICE_PROCESSING_MS);
    return () => clearTimeout(timer);
  }, [voiceOpen, voiceStage, router]);

  useEffect(() => {
    if (!voiceOpen || voiceStage !== 'listening') {
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
  }, [voiceOpen, voiceStage, pulse1, pulse2]);

  useEffect(() => {
    if (voiceStage !== 'processing') {
      spinAnim.setValue(0);
      return;
    }
    const anim = Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: SPIN_DURATION_MS, useNativeDriver: true }),
    );
    anim.start();
    return () => anim.stop();
  }, [voiceStage, spinAnim]);

  const startVoice = () => {
    setVoiceStage('listening');
    setVoiceOpen(true);
  };

  const cancelVoice = () => setVoiceOpen(false);

  const handleSelect = (destination: string) => {
    router.push({ pathname: '/setup', params: { destination } });
  };

  const pulse1Scale = pulse1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });
  const pulse1Opacity = pulse1.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 0.15, 0] });
  const pulse2Scale = pulse2.interpolate({ inputRange: [0, 1], outputRange: [1, 2] });
  const pulse2Opacity = pulse2.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.2, 0.1, 0] });
  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const pageBg = isDark ? 'bg-zinc-900' : 'bg-white';
  const borderColor = isDark ? 'border-zinc-800' : 'border-zinc-100';
  const headingText = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const sub = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const sheetBg = isDark ? 'bg-zinc-900' : 'bg-white';
  const handleBarBg = isDark ? 'bg-zinc-700' : 'bg-zinc-300';
  const cancelBtnBg = isDark ? 'bg-zinc-800' : 'bg-zinc-100';
  const cancelBtnText = isDark ? 'text-zinc-300' : 'text-zinc-600';
  const voiceCardBg = isDark ? 'border border-blue-800/40 bg-blue-900/40' : 'bg-blue-50';
  const voiceHeading = isDark ? 'text-blue-200' : 'text-blue-900';
  const voiceDesc = isDark ? 'text-blue-300/80' : 'text-blue-700/80';

  return (
    <SafeAreaView className={`flex-1 ${pageBg}`} edges={['top', 'left', 'right', 'bottom']}>
      {/* Search Bar */}
      <View className={`flex-row items-center gap-3 border-b px-4 py-3 ${borderColor}`}>
        <SearchInput
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery('')}
          onSubmit={() => { if (query.trim()) handleSelect(query.trim()); }}
        />
        <VoiceButton onPress={startVoice} />
      </View>

      {/* Content */}
      <ScrollView
        className="flex-1 px-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {query.trim() ? (
          <View className="mt-6">
            <SearchResultList query={query.trim()} onSelect={handleSelect} />
          </View>
        ) : (
          <>
            {/* Voice Prompt Card */}
            <View className={`mt-6 rounded-2xl p-5 ${voiceCardBg}`}>
              <View className="mb-2 flex-row items-center gap-3">
                <View className="h-8 w-8 items-center justify-center rounded-full bg-blue-600">
                  <Mic size={16} color={PALETTE.white} />
                </View>
                <Text className={`font-semibold ${voiceHeading}`}>음성으로 편하게 말해보세요</Text>
              </View>
              <Text className={`mb-3 text-sm ${voiceDesc}`}>
                {'"내일 아침 9시까지 강남역 도착하게 알려줘"'}
              </Text>
              <Pressable
                onPress={startVoice}
                accessibilityRole="button"
                className="w-full rounded-xl bg-blue-600 py-3 active:bg-blue-700"
              >
                <Text className="text-center text-sm font-semibold text-white">음성 인식 시작</Text>
              </Pressable>
            </View>

            {/* Recent Searches */}
            <View className="mt-6">
              <RecentSearchList onSelect={handleSelect} />
            </View>
          </>
        )}
        <View className="h-8" />
      </ScrollView>

      {/* Voice Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={voiceOpen}
        onRequestClose={cancelVoice}
        statusBarTranslucent
      >
        <Pressable
          className="absolute inset-0 bg-black/50"
          onPress={cancelVoice}
          accessibilityRole="button"
          accessibilityLabel="음성 인식 닫기"
        />
        <View className={`absolute bottom-0 left-0 right-0 rounded-t-3xl px-6 pb-12 pt-5 ${sheetBg}`}>
          <View className={`mx-auto mb-6 h-1 w-10 rounded-full ${handleBarBg}`} />

          {voiceStage === 'listening' ? (
            <>
              <Text className={`mb-10 text-center text-base font-bold ${headingText}`}>
                듣고 있어요...
              </Text>

              {/* Pulsing Mic */}
              <View className="mb-10 h-28 items-center justify-center">
                <Animated.View
                  style={{
                    position: 'absolute',
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: PALETTE.blue500,
                    opacity: pulse1Opacity,
                    transform: [{ scale: pulse1Scale }],
                  }}
                />
                <Animated.View
                  style={{
                    position: 'absolute',
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: PALETTE.blue500,
                    opacity: pulse2Opacity,
                    transform: [{ scale: pulse2Scale }],
                  }}
                />
                <View className="h-16 w-16 items-center justify-center rounded-full bg-blue-600">
                  <Mic size={MIC_ICON_SIZE} color={PALETTE.white} />
                </View>
              </View>

              {/* Waveform */}
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
                onPress={cancelVoice}
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
        </View>
      </Modal>
    </SafeAreaView>
  );
}
