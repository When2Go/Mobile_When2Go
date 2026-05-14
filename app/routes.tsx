import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Clock, Plus } from 'lucide-react-native';

import MobileLayout from '@/components/common/MobileLayout';
import RouteListItem from '@/components/routes/RouteListItem';
import EmptyState from '@/components/routes/EmptyState';
import RouteEditModal from '@/components/routes/RouteEditModal';
import { useTheme } from '@/contexts/ThemeContext';
import { PALETTE } from '@/constants/colors';
import { ICON_SIZE } from '@/constants/icons';
import type { RouteFormData, RouteItem } from '@/types/routes.types';

const MOCK_ROUTES: RouteItem[] = [
  { id: 1, name: '출근', from: '인하대 정문', to: '강남역 2호선', isFavorite: true, frequency: '주 5회 이용' },
  { id: 2, name: '퇴근', from: '강남역 2호선', to: '인하대 정문', isFavorite: true, frequency: '주 5회 이용' },
  { id: 3, name: '헬스장', from: '집', to: '애니타임 피트니스', isFavorite: false, frequency: '주 3회 이용' },
  { id: 4, name: '부모님댁', from: '집', to: '수원역', isFavorite: false, frequency: '월 2회 이용' },
  { id: 5, name: '병원', from: '집', to: '서울대학교 병원', isFavorite: false, frequency: '월 1회 이용' },
];

let nextId = MOCK_ROUTES.length + 1;

export default function RoutesScreen() {
  const { isDark } = useTheme();
  const [routes, setRoutes] = useState<RouteItem[]>(MOCK_ROUTES);
  const [editTarget, setEditTarget] = useState<RouteItem | undefined>(undefined);
  const [isEditOpen, setEditOpen] = useState(false);

  const pageBg = isDark ? 'bg-zinc-950' : 'bg-zinc-50';
  const headerBg = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-100';
  const headingText = isDark ? 'text-zinc-100' : 'text-zinc-900';
  const addBtnBg = isDark ? 'bg-blue-900/50' : 'bg-blue-50';
  const addBtnText = isDark ? 'text-blue-400' : 'text-blue-600';
  const mapAreaBg = isDark ? 'bg-zinc-900' : 'bg-zinc-200';
  const summaryCardBg = isDark ? 'bg-zinc-800/80 border-zinc-700/50' : 'bg-white/80 border-zinc-200/50';
  const sub = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const listHeading = isDark ? 'text-zinc-100' : 'text-zinc-900';

  const handleAdd = () => {
    setEditTarget(undefined);
    setEditOpen(true);
  };

  const handleEdit = (route: RouteItem) => {
    setEditTarget(route);
    setEditOpen(true);
  };

  const handleDelete = (id: number) => {
    setRoutes((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSave = (data: RouteFormData) => {
    if (editTarget) {
      setRoutes((prev) => prev.map((r) => (r.id === editTarget.id ? { ...data, id: r.id } : r)));
    } else {
      const newRoute: RouteItem = { ...data, id: nextId++ };
      setRoutes((prev) => [...prev, newRoute]);
    }
    setEditOpen(false);
  };

  const handleClose = () => setEditOpen(false);

  return (
    <MobileLayout>
      {/* 커스텀 헤더 — /routes는 TAB_ROOT이므로 MobileLayout 헤더 없음 */}
      <View className={`flex-row items-center justify-between border-b px-5 py-4 ${headerBg}`}>
        <Text className={`text-lg font-bold ${headingText}`}>경로 관리</Text>
        <Pressable
          onPress={handleAdd}
          accessibilityRole="button"
          className={`flex-row items-center gap-1.5 rounded-lg px-3 py-2 active:opacity-70 ${addBtnBg}`}
        >
          <Plus size={ICON_SIZE.card} color={isDark ? PALETTE.blue400 : PALETTE.blue600} />
          <Text className={`text-sm font-semibold ${addBtnText}`}>추가</Text>
        </Pressable>
      </View>

      {routes.length === 0 ? (
        <View className={`flex-1 ${pageBg}`}>
          <EmptyState onAddPress={handleAdd} />
        </View>
      ) : (
        <ScrollView
          className={`flex-1 ${pageBg}`}
          showsVerticalScrollIndicator={false}
        >
          {/* 경로 요약 배너 */}
          <View className={`relative h-36 w-full ${mapAreaBg}`}>
            <View className="absolute inset-x-0 bottom-4 px-5">
              <View className={`rounded-2xl border p-4 ${summaryCardBg}`}>
                <View className="mb-1 flex-row items-center gap-2">
                  <Clock size={ICON_SIZE.card} color={isDark ? PALETTE.zinc400 : PALETTE.zinc500} />
                  <Text className={`text-xs font-semibold ${sub}`}>경로 요약</Text>
                </View>
                <Text className={`text-sm font-bold ${listHeading}`}>
                  총 {routes.length}개의 자주 쓰는 경로
                </Text>
              </View>
            </View>
          </View>

          {/* 경로 목록 */}
          <View className="px-5 pb-6 pt-5">
            <Text className={`mb-3 text-sm font-semibold ${listHeading}`}>저장된 경로</Text>
            <View className="gap-3">
              {routes.map((route) => (
                <RouteListItem
                  key={route.id}
                  route={route}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      )}

      {isEditOpen && (
        <RouteEditModal
          isOpen={isEditOpen}
          onClose={handleClose}
          onSave={handleSave}
          initialRoute={editTarget}
        />
      )}
    </MobileLayout>
  );
}
