import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Moon, Sun } from 'lucide-react-native';

import MobileLayout from '@/components/common/MobileLayout';
import BottomSheetModal from '@/components/common/BottomSheetModal';
import AdSlot from '@/components/common/AdSlot';
import { useTheme } from '@/contexts/ThemeContext';
import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';

const SCROLL_PADDING_BOTTOM = 32;
const SHEET_SNAP_POINTS = ['40%'];

export default function Home() {
  const { isDark, toggle } = useTheme();
  const [sheetOpen, setSheetOpen] = useState(false);

  const pageBg = isDark ? 'bg-zinc-950' : 'bg-zinc-50';
  const headingText = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const subText = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const card = isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-zinc-100';
  const cardLabel = isDark ? 'text-zinc-200' : 'text-zinc-800';
  const themeIconColor = isDark ? PALETTE.zinc100 : PALETTE.zinc900;

  return (
    <MobileLayout>
      <ScrollView
        className={`flex-1 ${pageBg}`}
        contentContainerStyle={{ padding: 20, paddingBottom: SCROLL_PADDING_BOTTOM }}
        showsVerticalScrollIndicator={false}
      >
        <Text className={`text-xl font-bold ${headingText}`}>When2Go 디자인 시스템 데모</Text>
        <Text className={`mt-1 text-sm ${subText}`}>
          이슈 #2 인프라 셋업 확인용 페이지
        </Text>

        <View className={`mt-5 flex-row items-center justify-between rounded-2xl border p-4 ${card}`}>
          <View className="flex-1">
            <Text className={`text-base font-bold ${cardLabel}`}>다크 모드</Text>
            <Text className={`mt-1 text-xs ${subText}`}>
              현재: {isDark ? 'Dark' : 'Light'}
            </Text>
          </View>
          <Pressable
            onPress={toggle}
            accessibilityRole="button"
            accessibilityLabel="테마 토글"
            className="flex-row items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 active:bg-blue-700"
          >
            {isDark ? (
              <Sun size={ICON_SIZE.card} color={PALETTE.white} />
            ) : (
              <Moon size={ICON_SIZE.card} color={PALETTE.white} />
            )}
            <Text className="text-sm font-bold text-white">토글</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() => setSheetOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="바텀시트 열기"
          className="mt-4 items-center justify-center rounded-2xl bg-blue-600 py-4 active:bg-blue-700"
        >
          <Text className="text-base font-bold text-white">바텀시트 열기</Text>
        </Pressable>

        <Text className={`mt-6 text-base font-bold ${headingText}`}>AdSlot 데모</Text>
        <View className="mt-3 gap-3">
          <AdSlot type="banner" />
          <AdSlot type="splash" />
          <AdSlot type="interstitial" />
        </View>

        <View className="mt-6 flex-row items-center gap-2">
          {/* 아이콘 컬러도 토큰을 통해 - className 미적용 prop 분기 데모 */}
          {isDark ? (
            <Moon size={ICON_SIZE.caption} color={themeIconColor} />
          ) : (
            <Sun size={ICON_SIZE.caption} color={themeIconColor} />
          )}
          <Text className={`text-[11px] ${subText}`}>NativeWind v4 + Expo Router 6</Text>
        </View>
      </ScrollView>

      <BottomSheetModal
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="데모 시트"
        snapPoints={SHEET_SNAP_POINTS}
      >
        <Text className={`text-sm ${cardLabel}`}>
          @gorhom/bottom-sheet 래퍼 동작 확인. 아래로 드래그하거나 X 버튼으로 닫을 수 있다.
        </Text>
        <Text className={`mt-3 text-xs ${subText}`}>
          다크 모드에서는 배경·핸들·구분선이 zinc 700/900 톤으로 전환된다.
        </Text>
      </BottomSheetModal>
    </MobileLayout>
  );
}
