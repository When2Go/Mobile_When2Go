import { useMemo, useRef } from 'react';
import { View } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import MobileLayout from '@/components/common/MobileLayout';
import AdSlot from '@/components/common/AdSlot';
import MapPreview from '@/components/home/MapPreview';
import SearchEntryBar from '@/components/home/SearchEntryBar';
import FavoriteRoutes from '@/components/home/FavoriteRoutes';
import RecentDestinations from '@/components/home/RecentDestinations';
import { useTheme } from '@/contexts/ThemeContext';
import { PALETTE } from '@/constants/colors';

const SHEET_SNAP_POINTS = ['25%', '62%'];
const SHEET_INITIAL_INDEX = 0;
const SHEET_TOP_RADIUS = 24;
const PANEL_BOTTOM_PADDING = 24;
const SECTION_GAP = 20;

export default function Home() {
  const { isDark } = useTheme();
  const sheetRef = useRef<BottomSheet>(null);

  const sheetBgColor = isDark ? PALETTE.zinc900 : PALETTE.white;
  const handleColor = isDark ? PALETTE.zinc500 : PALETTE.zinc300;

  const backgroundStyle = useMemo(
    () => ({
      backgroundColor: sheetBgColor,
      borderTopLeftRadius: SHEET_TOP_RADIUS,
      borderTopRightRadius: SHEET_TOP_RADIUS,
    }),
    [sheetBgColor],
  );

  const handleIndicatorStyle = useMemo(
    () => ({ backgroundColor: handleColor }),
    [handleColor],
  );

  return (
    <MobileLayout>
      <View className="flex-1">
        <View className="absolute inset-0">
          <MapPreview />
        </View>
        <View className="absolute left-4 right-4 top-4">
          <SearchEntryBar />
        </View>

        <BottomSheet
          ref={sheetRef}
          snapPoints={SHEET_SNAP_POINTS}
          index={SHEET_INITIAL_INDEX}
          enablePanDownToClose={false}
          backgroundStyle={backgroundStyle}
          handleIndicatorStyle={handleIndicatorStyle}
        >
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: PANEL_BOTTOM_PADDING }}
          >
            <View className="pt-2">
              <FavoriteRoutes />
            </View>
            <View style={{ marginTop: SECTION_GAP }}>
              <RecentDestinations />
            </View>
            <View className="px-5" style={{ marginTop: SECTION_GAP }}>
              <AdSlot type="banner" />
            </View>
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </MobileLayout>
  );
}
