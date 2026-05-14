import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mic } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { PALETTE } from '@/constants/colors';
import { ICON_SIZE } from '@/constants/icons';
import SearchInput from '@/components/search/SearchInput';
import VoiceButton from '@/components/search/VoiceButton';
import VoiceModal from '@/components/search/VoiceModal';
import RecentSearchList from '@/components/search/RecentSearchList';
import SearchResultList from '@/components/search/SearchResultList';

export default function SearchScreen() {
  const router = useRouter();
  const { isDark } = useTheme();

  const [query, setQuery] = useState('');
  const [voiceOpen, setVoiceOpen] = useState(false);

  const startVoice = () => setVoiceOpen(true);
  const cancelVoice = () => setVoiceOpen(false);

  const handleSelect = (destination: string) => {
    router.push({ pathname: '/setup', params: { destination } });
  };

  const pageBg = isDark ? 'bg-zinc-950' : 'bg-zinc-50';
  const borderColor = isDark ? 'border-zinc-700' : 'border-zinc-100';
  const voiceCardBg = isDark ? 'border border-blue-800/40 bg-blue-900/40' : 'bg-blue-50';
  const voiceHeading = isDark ? 'text-blue-200' : 'text-blue-900';
  const voiceDesc = isDark ? 'text-blue-300/80' : 'text-blue-700/80';

  return (
    <SafeAreaView className={`flex-1 ${pageBg}`} edges={['top', 'left', 'right', 'bottom']}>
      {/* Search Bar */}
      <View className={`flex-row items-center gap-3 border-b px-5 py-3 ${borderColor}`}>
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
        className="flex-1 px-5"
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
                  <Mic size={ICON_SIZE.card} color={PALETTE.white} />
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

      {voiceOpen && (
        <VoiceModal
          isOpen={voiceOpen}
          onClose={cancelVoice}
          onComplete={() => { cancelVoice(); router.push('/setup'); }}
        />
      )}
    </SafeAreaView>
  );
}
