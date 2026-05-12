import { Text, View } from 'react-native';

import MobileLayout from '@/components/common/MobileLayout';
import { useTheme } from '@/contexts/ThemeContext';

interface RoutePlaceholderProps {
  title: string;
  issueRef?: string;
}

/**
 * 후속 이슈에서 실제 화면이 구현되기 전까지의 임시 placeholder.
 * 화면을 만들 때 이 컴포넌트를 제거하고 실 구현으로 교체.
 */
export default function RoutePlaceholder({ title, issueRef }: RoutePlaceholderProps) {
  const { isDark } = useTheme();

  const pageBg = isDark ? 'bg-zinc-950' : 'bg-zinc-50';
  const headingText = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const subText = isDark ? 'text-zinc-400' : 'text-zinc-500';

  return (
    <MobileLayout>
      <View className={`flex-1 items-center justify-center px-6 ${pageBg}`}>
        <Text className={`text-lg font-bold ${headingText}`}>{title}</Text>
        <Text className={`mt-2 text-center text-sm ${subText}`}>
          후속 이슈에서 구현 예정{issueRef ? ` (${issueRef})` : ''}
        </Text>
      </View>
    </MobileLayout>
  );
}
