import { ScrollView, View } from 'react-native';

import MobileLayout from '@/components/common/MobileLayout';
import AdSlot from '@/components/common/AdSlot';
import MapPreview from '@/components/home/MapPreview';
import SearchEntryBar from '@/components/home/SearchEntryBar';
import FavoriteRoutes from '@/components/home/FavoriteRoutes';
import RecentDestinations from '@/components/home/RecentDestinations';
import { useTheme } from '@/contexts/ThemeContext';

const PANEL_MAX_HEIGHT_RATIO = 0.62;
const PANEL_OVERLAP_OFFSET = -20;
const PANEL_BOTTOM_PADDING = 16;
const SECTION_GAP = 20;

export default function Home() {
  const { isDark } = useTheme();

  const panelBg = isDark ? 'bg-zinc-900' : 'bg-white';
  const handleBg = isDark ? 'bg-zinc-600' : 'bg-zinc-300';

  return (
    <MobileLayout>
      <View className="flex-1">
        <View className="flex-1">
          <View className="absolute inset-0">
            <MapPreview />
          </View>
          <View className="absolute left-4 right-4 top-4">
            <SearchEntryBar />
          </View>
        </View>

        <View
          className={`rounded-t-3xl ${panelBg}`}
          style={{
            marginTop: PANEL_OVERLAP_OFFSET,
            maxHeight: `${PANEL_MAX_HEIGHT_RATIO * 100}%`,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: isDark ? 0.4 : 0.12,
            shadowRadius: 16,
            elevation: 12,
          }}
        >
          <View className="items-center pb-1 pt-3">
            <View className={`h-1 w-10 rounded-full ${handleBg}`} />
          </View>

          <ScrollView
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
          </ScrollView>
        </View>
      </View>
    </MobileLayout>
  );
}
