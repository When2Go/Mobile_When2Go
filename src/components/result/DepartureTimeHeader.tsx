import { Text, View } from 'react-native';

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
  const headingText = 'text-zinc-900';
  const subText = 'text-zinc-500';
  const bufferText = 'text-blue-600';

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
