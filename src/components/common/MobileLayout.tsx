import { type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePathname, useRouter } from 'expo-router';
import { Bell, ChevronLeft, Home, Map, User } from 'lucide-react-native';

import { useTheme } from '@/contexts/ThemeContext';
import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';

const HEADER_HEIGHT_CLASS = 'h-14';
const BOTTOM_NAV_HEIGHT_CLASS = 'h-[84px]';
const NAV_ITEM_WIDTH_CLASS = 'w-20';
const NAV_ITEM_HEIGHT_CLASS = 'h-14';
const ACTIVE_COLOR = PALETTE.blue500;

const PAGE_TITLE: Record<string, string> = {
  '/search': '목적지 검색',
  '/result': '출발 시간 안내',
  '/mypage': '마이페이지',
  '/lockwidget': '잠금화면 위젯',
  '/routes': '경로 관리',
  '/schedule': '일정',
};

const HIDE_BOTTOM_NAV_PATHS = ['/setup', '/active', '/onboarding'];
/** 탭 루트 경로 — 뒤로가기 없는 메인 화면. 헤더 자체를 숨긴다. */
const TAB_ROOT_PATHS = ['/', '/schedule', '/routes', '/mypage'];

interface MobileLayoutProps {
  children: ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark } = useTheme();

  const isTabRoot = TAB_ROOT_PATHS.includes(pathname);
  const hideBottomNav = HIDE_BOTTOM_NAV_PATHS.includes(pathname);

  const rootBg = isDark ? 'bg-zinc-950' : 'bg-zinc-50';
  const headerBg = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100';
  const navBg = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100';
  const headingText = isDark ? 'text-zinc-100' : 'text-zinc-900';

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const inactiveIconColor = isDark ? PALETTE.zinc500 : PALETTE.zinc400;
  const iconColorFor = (isActive: boolean) => (isActive ? ACTIVE_COLOR : inactiveIconColor);

  return (
    <SafeAreaView className={`flex-1 ${rootBg}`} edges={['top', 'left', 'right']}>
      {!isTabRoot && !hideBottomNav && (
        <View
          className={`${HEADER_HEIGHT_CLASS} flex-row items-center justify-between border-b px-4 ${headerBg}`}
        >
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="뒤로 가기"
            className="-ml-2 rounded-full p-2 active:opacity-60"
          >
            <ChevronLeft
              size={ICON_SIZE.header}
              color={isDark ? PALETTE.zinc100 : PALETTE.zinc900}
            />
          </Pressable>
          <Text className={`font-semibold ${headingText}`}>{PAGE_TITLE[pathname] ?? ''}</Text>
          <View className="w-9" />
        </View>
      )}

      <View className="flex-1">{children}</View>

      {!hideBottomNav && (
        <View
          className={`${BOTTOM_NAV_HEIGHT_CLASS} flex-row items-center justify-around border-t px-2 pb-3 pt-1 ${navBg}`}
        >
          <NavItem
            icon={<Home size={ICON_SIZE.tab} color={iconColorFor(pathname === '/')} />}
            label="홈"
            active={pathname === '/'}
            isDark={isDark}
            onPress={() => router.push('/')}
          />
          <NavItem
            icon={<Bell size={ICON_SIZE.tab} color={iconColorFor(pathname === '/schedule')} />}
            label="일정"
            active={pathname === '/schedule'}
            isDark={isDark}
            onPress={() => router.push('/schedule')}
          />
          <NavItem
            icon={<Map size={ICON_SIZE.tab} color={iconColorFor(pathname === '/routes')} />}
            label="경로"
            active={pathname === '/routes'}
            isDark={isDark}
            onPress={() => router.push('/routes')}
          />
          <NavItem
            icon={<User size={ICON_SIZE.tab} color={iconColorFor(pathname === '/mypage')} />}
            label="MY"
            active={pathname === '/mypage'}
            isDark={isDark}
            onPress={() => router.push('/mypage')}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

interface NavItemProps {
  icon: ReactNode;
  label: string;
  active: boolean;
  isDark: boolean;
  onPress: () => void;
}

function NavItem({ icon, label, active, isDark, onPress }: NavItemProps) {
  const labelColor = (() => {
    if (active) return 'text-blue-500';
    return isDark ? 'text-zinc-500' : 'text-zinc-400';
  })();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityLabel={label}
      className={`${NAV_ITEM_WIDTH_CLASS} ${NAV_ITEM_HEIGHT_CLASS} items-center justify-center gap-1 rounded-xl active:opacity-60`}
    >
      {icon}
      <Text className={`text-xs font-semibold ${labelColor}`}>{label}</Text>
    </Pressable>
  );
}
