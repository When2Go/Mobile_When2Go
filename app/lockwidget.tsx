import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import MobileLayout from '@/components/common/MobileLayout';
import IOSLiveActivityPreview from '@/components/widget-preview/IOSLiveActivityPreview';
import DynamicIslandPreview from '@/components/widget-preview/DynamicIslandPreview';
import AndroidNotificationPreview from '@/components/widget-preview/AndroidNotificationPreview';

type WidgetTab = 'ios-lock' | 'dynamic-island' | 'android';

const TABS: { id: WidgetTab; label: string }[] = [
  { id: 'ios-lock', label: 'iOS 잠금화면' },
  { id: 'dynamic-island', label: 'Dynamic Island' },
  { id: 'android', label: 'Android 알림' },
];

/** 잠금화면/Dynamic Island/Android 알림 위젯 인앱 미리보기 화면 (이슈 #13, F-W01~W07). */
export default function LockWidgetScreen() {
  const [activeTab, setActiveTab] = useState<WidgetTab>('ios-lock');

  return (
    <MobileLayout>
      {/* 탭 바 */}
      <View className="border-b border-zinc-100 bg-white px-4 pt-2">
        <View className="flex-row gap-1">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={tab.label}
                className="rounded-t-lg px-3.5 py-2.5 active:opacity-60"
              >
                <Text
                  className={`text-xs font-semibold ${isActive ? 'text-blue-600' : 'text-zinc-400'}`}
                >
                  {tab.label}
                </Text>
                {isActive ? (
                  <View className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-500" />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 탭 콘텐츠 */}
      <ScrollView className="flex-1 bg-zinc-50" contentContainerClassName="px-4 py-5">
        <Animated.View key={activeTab} entering={FadeIn.duration(200)}>
          {activeTab === 'ios-lock' ? <IOSLiveActivityPreview /> : null}
          {activeTab === 'dynamic-island' ? <DynamicIslandPreview /> : null}
          {activeTab === 'android' ? <AndroidNotificationPreview /> : null}
        </Animated.View>
      </ScrollView>
    </MobileLayout>
  );
}
