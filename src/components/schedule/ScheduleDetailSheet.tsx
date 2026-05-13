import { Alert, Pressable, Text, View } from 'react-native';
import { Clock, MapPin, TrainFront } from 'lucide-react-native';

import BottomSheetModal from '@/components/common/BottomSheetModal';
import { useTheme } from '@/contexts/ThemeContext';
import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';
import type { ScheduleItem } from '@/types/schedule.types';

const SHEET_SNAP_POINTS = ['55%'];
const DELETE_ALERT_TITLE_PREFIX = '"';
const DELETE_ALERT_TITLE_SUFFIX = '" 삭제';
const DELETE_ALERT_MSG = '이 일정을 삭제하면 되돌릴 수 없어요.';
const DELETE_ALERT_CANCEL = '취소';
const DELETE_ALERT_CONFIRM = '삭제하기';

interface ScheduleDetailSheetProps {
  schedule: ScheduleItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: number) => void;
}

/**
 * Schedule 카드 탭 시 상세 BottomSheet.
 * - 지도 이미지 · 외부 링크는 mock 단계에서 제외 (실 데이터 연동 후 별도 이슈).
 * - 출발/도착 시간, 경로, 삭제 버튼만 노출.
 */
export default function ScheduleDetailSheet({
  schedule,
  isOpen,
  onClose,
  onDelete,
}: ScheduleDetailSheetProps) {
  const { isDark } = useTheme();

  // 닫힘 상태에서는 sheet 자체를 렌더하지 않는다.
  // mypage 패턴과 동일하게 부모가 isOpen=false면 unmount.
  if (!schedule) {
    return null;
  }

  const headingText = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const subText = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const subIconColor = isDark ? PALETTE.zinc400 : PALETTE.zinc500;
  const infoBoxClass = isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-100';
  const departureValueText = isDark ? 'text-blue-400' : 'text-blue-500';

  const handlePressDelete = () => {
    const title = `${DELETE_ALERT_TITLE_PREFIX}${schedule.title}${DELETE_ALERT_TITLE_SUFFIX}`;
    Alert.alert(title, DELETE_ALERT_MSG, [
      { text: DELETE_ALERT_CANCEL, style: 'cancel' },
      {
        text: DELETE_ALERT_CONFIRM,
        style: 'destructive',
        onPress: () => {
          onDelete(schedule.id);
          onClose();
        },
      },
    ]);
  };

  return (
    <BottomSheetModal isOpen={isOpen} onClose={onClose} snapPoints={SHEET_SNAP_POINTS}>
      <View className="gap-4">
        {/* 헤더 */}
        <View>
          <Text className={`text-lg font-black ${headingText}`}>{schedule.title}</Text>
          <Text className={`text-sm ${subText}`}>{schedule.destination}</Text>
        </View>

        {/* 경로/시간 정보 */}
        <View className={`rounded-xl border p-3 ${infoBoxClass}`}>
          <View className="mb-2 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Clock size={ICON_SIZE.card} color={subIconColor} />
              <Text className={`text-xs font-semibold ${subText}`}>출발 시간</Text>
            </View>
            <Text className={`text-sm font-bold ${departureValueText}`}>
              {schedule.departureTime}
            </Text>
          </View>
          <View className="mb-2 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <MapPin size={ICON_SIZE.card} color={subIconColor} />
              <Text className={`text-xs font-semibold ${subText}`}>도착 시간</Text>
            </View>
            <Text className={`text-sm font-bold ${headingText}`}>{schedule.arrivalTime}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <TrainFront size={ICON_SIZE.card} color={subIconColor} />
            <Text className={`flex-1 text-xs ${subText}`}>{schedule.route}</Text>
          </View>
        </View>

        {/* 삭제 버튼 */}
        <Pressable
          onPress={handlePressDelete}
          accessibilityRole="button"
          accessibilityLabel="이 일정 삭제하기"
          className="w-full items-center rounded-2xl bg-red-500 py-4 active:bg-red-600"
        >
          <Text className="text-base font-bold text-white">삭제하기</Text>
        </Pressable>
      </View>
    </BottomSheetModal>
  );
}
