import { Pressable, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';

import BottomSheetModal from '@/components/common/BottomSheetModal';
import { PALETTE } from '@/constants/colors';
import { ICON_SIZE } from '@/constants/icons';
import {
  BADGE_LABEL,
  CONFIRM_LABEL,
  CONFIRMED_LABEL,
  DEPART_SUFFIX,
  NOTIFICATION_NOTICE,
  RESERVATION_TITLE,
  type RouteDisplayItem,
  type RouteBadgeId,
} from '@/constants/result';

const SHEET_SNAP_POINTS = ['52%'];

const BADGE_BG_CLASS: Record<RouteBadgeId, string> = {
  optimal: 'bg-blue-600',
  min_transfer: 'bg-emerald-600',
};

const STEPS_JOINER = ' → ';

interface ReservationCompleteModalProps {
  isOpen: boolean;
  route: RouteDisplayItem | null;
  confirmed: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ReservationCompleteModal({
  isOpen,
  route,
  confirmed,
  onClose,
  onConfirm,
}: ReservationCompleteModalProps) {
  const summaryCard = 'bg-zinc-50 border-zinc-100';
  const subText = 'text-zinc-500';
  const departureText = 'text-blue-500';

  const confirmBg = confirmed ? 'bg-emerald-500' : 'bg-blue-600';

  return (
    <BottomSheetModal
      isOpen={isOpen}
      onClose={onClose}
      title={RESERVATION_TITLE}
      snapPoints={SHEET_SNAP_POINTS}
    >
      {route ? (
        <View>
          {/* 선택 경로 요약 */}
          <View className={`mb-5 rounded-2xl border p-4 ${summaryCard}`}>
            <View className="mb-2 flex-row items-center">
              {route.badge ? (
                <View className={`rounded-full px-2 py-0.5 ${BADGE_BG_CLASS[route.badge]}`}>
                  <Text className="text-[11px] font-bold text-white">
                    {BADGE_LABEL[route.badge]}
                  </Text>
                </View>
              ) : null}
              <Text className={`${route.badge ? 'ml-2' : ''} text-xs ${subText}`}>{route.durationLabel}</Text>
            </View>
            <View className="flex-row items-baseline">
              <Text className={`text-2xl font-black ${departureText}`}>{route.departureTime}</Text>
              <Text className={`ml-2 text-sm font-semibold ${subText}`}>{DEPART_SUFFIX}</Text>
            </View>
            <Text className={`mt-1 text-sm ${subText}`}>{route.steps.join(STEPS_JOINER)}</Text>
          </View>

          <Text className={`mb-5 text-center text-sm ${subText}`}>{NOTIFICATION_NOTICE}</Text>

          <Pressable
            onPress={onConfirm}
            disabled={confirmed}
            accessibilityRole="button"
            accessibilityLabel={confirmed ? CONFIRMED_LABEL : CONFIRM_LABEL}
            className={`flex-row items-center justify-center rounded-2xl py-4 active:opacity-80 ${confirmBg}`}
          >
            {confirmed ? (
              <>
                <Check size={ICON_SIZE.header} color={PALETTE.white} />
                <Text className="ml-2 text-base font-bold text-white">{CONFIRMED_LABEL}</Text>
              </>
            ) : (
              <Text className="text-base font-bold text-white">{CONFIRM_LABEL}</Text>
            )}
          </Pressable>
        </View>
      ) : null}
    </BottomSheetModal>
  );
}
