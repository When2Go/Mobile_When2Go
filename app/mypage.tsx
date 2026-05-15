import { useState } from 'react';
import { Alert, Linking, ScrollView, Text, View } from 'react-native';

import MobileLayout from '@/components/common/MobileLayout';
import BottomSheetModal from '@/components/common/BottomSheetModal';
import AdSlot from '@/components/common/AdSlot';
import ProfileHeader from '@/components/mypage/ProfileHeader';
import SafetyBufferRow from '@/components/mypage/SafetyBufferRow';
import BufferSheetBody from '@/components/common/BufferSheetBody';
import NotificationSettingsRow from '@/components/mypage/NotificationSettingsRow';
import RepeatReservationLink from '@/components/mypage/RepeatReservationLink';
import DarkModeRow from '@/components/mypage/DarkModeRow';
import TermsLink from '@/components/mypage/TermsLink';
import VersionRow from '@/components/mypage/VersionRow';
import { useTheme } from '@/contexts/ThemeContext';
import { useSettingsStore } from '@/stores/settingsStore';

const SECTION_GAP_CLASS = 'gap-2';
const SECTION_PADDING_CLASS = 'px-5 py-4';
const AD_SECTION_PADDING_CLASS = 'px-5 pt-6 pb-8';
const NOTI_ALERT_TITLE = '알림 방식 변경';
const NOTI_ALERT_MESSAGE =
  '소리·진동은 기기 설정에서 바꿀 수 있다. 설정 앱으로 이동할까?';
const NOTI_ALERT_CONFIRM = '설정 열기';
const NOTI_ALERT_CANCEL = '취소';

export default function MyPageScreen() {
  const { isDark } = useTheme();
  const bufferMinutes = useSettingsStore((s) => s.bufferMinutes);
  const setBufferMinutes = useSettingsStore((s) => s.setBufferMinutes);

  const [isBufferSheetOpen, setBufferSheetOpen] = useState(false);

  const sectionCard = isDark ? 'bg-zinc-900' : 'bg-white';
  const sectionTitle = 'text-zinc-500';
  const scrollBg = isDark ? 'bg-zinc-950' : 'bg-zinc-50';

  const handleSaveBuffer = (next: number) => {
    setBufferMinutes(next);
    setBufferSheetOpen(false);
  };

  const handleOpenSystemNotificationSettings = () => {
    Alert.alert(NOTI_ALERT_TITLE, NOTI_ALERT_MESSAGE, [
      { text: NOTI_ALERT_CANCEL, style: 'cancel' },
      {
        text: NOTI_ALERT_CONFIRM,
        onPress: () => {
          void Linking.openSettings();
        },
      },
    ]);
  };

  return (
    <MobileLayout>
      <ScrollView className={`flex-1 ${scrollBg}`} contentContainerClassName="pb-4">
        <ProfileHeader />

        <View className={`mt-2 ${SECTION_GAP_CLASS}`}>
          {/* 나의 설정 */}
          <View className={`${SECTION_PADDING_CLASS} ${sectionCard}`}>
            <Text className={`mb-2 text-xs font-semibold uppercase tracking-wider ${sectionTitle}`}>
              나의 설정
            </Text>
            <SafetyBufferRow value={bufferMinutes} onPress={() => setBufferSheetOpen(true)} />
            <NotificationSettingsRow onPress={handleOpenSystemNotificationSettings} />
            <RepeatReservationLink />
            <DarkModeRow noBorder />
          </View>

          {/* 앱 정보 */}
          <View className={`${SECTION_PADDING_CLASS} ${sectionCard}`}>
            <Text className={`mb-2 text-xs font-semibold uppercase tracking-wider ${sectionTitle}`}>
              앱 정보
            </Text>
            <TermsLink />
            <VersionRow noBorder />
          </View>
        </View>

        <View className={AD_SECTION_PADDING_CLASS}>
          <AdSlot type="banner" />
        </View>
      </ScrollView>

      {isBufferSheetOpen ? (
        <BottomSheetModal
          isOpen={isBufferSheetOpen}
          onClose={() => setBufferSheetOpen(false)}
          title="안전 버퍼 시간"
        >
          <BufferSheetBody
            value={bufferMinutes}
            onSave={handleSaveBuffer}
            onCancel={() => setBufferSheetOpen(false)}
          />
        </BottomSheetModal>
      ) : null}
    </MobileLayout>
  );
}
