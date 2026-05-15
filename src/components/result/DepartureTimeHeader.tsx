import { Text, View } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { SAFETY_BUFFER_NOTICE_FORMAT } from '@/constants/result';

interface DepartureTimeHeaderProps {
  targetPrefix: string;
  heading: string;
  safetyBufferMin: number;
}

export default function DepartureTimeHeader({
  targetPrefix,
  heading,
  safetyBufferMin,
}: DepartureTimeHeaderProps) {
  const { isDark } = useTheme();

  const headingText = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const subText = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const bufferText = isDark ? 'text-blue-400' : 'text-blue-600';

  return (
    <View className="px-5 pb-4 pt-5">
      <Text className={`mb-1 text-sm font-medium ${subText}`}>{targetPrefix}</Text>
      <Text className={`text-xl font-black ${headingText}`}>{heading}</Text>
      <Text className={`mt-2 text-xs font-semibold ${bufferText}`}>
        {SAFETY_BUFFER_NOTICE_FORMAT(safetyBufferMin)}
      </Text>
    </View>
  );
}
