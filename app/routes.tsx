import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';

import MobileLayout from '@/components/common/MobileLayout';
import AdSlot from '@/components/common/AdSlot';
import RouteListItem from '@/components/routes/RouteListItem';
import EmptyState from '@/components/routes/EmptyState';
import RouteEditModal from '@/components/routes/RouteEditModal';
import { PALETTE } from '@/constants/colors';
import { ICON_SIZE } from '@/constants/icons';
import { useRouteDraftStore } from '@/stores/routeDraftStore';
import { useRouteStore } from '@/stores/routeStore';
import type { RouteFormData, RouteItem } from '@/types/routes.types';

const EMPTY_FORM: RouteFormData = { name: '', from: '', to: '', frequency: '' };

export default function RoutesScreen() {
  const router = useRouter();
  const routes = useRouteStore((s) => s.routes);
  const addRoute = useRouteStore((s) => s.addRoute);
  const updateRoute = useRouteStore((s) => s.updateRoute);
  const removeRoute = useRouteStore((s) => s.removeRoute);

  const [editTarget, setEditTarget] = useState<RouteItem | undefined>(undefined);
  const [isEditOpen, setEditOpen] = useState(false);
  const [draftForm, setDraftForm] = useState<RouteFormData>(EMPTY_FORM);

  // search → routes 위치 선택 복귀 여부 추적
  const isAwaitingLocationRef = useRef(false);

  // 검색 화면에서 위치 선택 후 복귀했을 때 draft 적용(텍스트 + 좌표) + 모달 재오픈
  useFocusEffect(
    useCallback(() => {
      if (!isAwaitingLocationRef.current) return;
      isAwaitingLocationRef.current = false;

      const draft = useRouteDraftStore.getState();
      const pending = draft.consumePendingLocation();
      if (pending) {
        const coordsKey = pending.field === 'from' ? 'fromCoords' : 'toCoords';
        const coords = pending.field === 'from' ? draft.fromCoords : draft.toCoords;
        setDraftForm((prev) => ({
          ...prev,
          [pending.field]: pending.location,
          [coordsKey]: coords ?? undefined,
        }));
      }
      setEditOpen(true);
    }, []),
  );

  const pageBg = 'bg-zinc-50';
  const headerBg = 'bg-white border-zinc-100';
  const headingText = 'text-zinc-900';
  const addBtnBg = 'bg-blue-50';
  const addBtnText = 'text-blue-600';
  const listHeading = 'text-zinc-900';

  const handleAdd = () => {
    setEditTarget(undefined);
    setDraftForm(EMPTY_FORM);
    setEditOpen(true);
  };

  const handleEdit = (route: RouteItem) => {
    setEditTarget(route);
    setDraftForm({
      name: route.name,
      from: route.from,
      to: route.to,
      frequency: route.frequency,
      fromCoords: route.fromCoords,
      toCoords: route.toCoords,
    });
    setEditOpen(true);
  };

  // 저장된 목적지 좌표를 draft 스토어에 주입 → setup 진입 시 재검색 없이 재사용
  const handleNavigateToSetup = (route: RouteItem) => {
    const draft = useRouteDraftStore.getState();
    if (route.toCoords) draft.setCoords('to', route.toCoords);
    draft.setToName(route.to);
    router.push({ pathname: '/setup', params: { destination: route.to } });
  };

  const handleDelete = (id: string) => {
    removeRoute(id);
  };

  const handleSave = () => {
    if (editTarget) {
      updateRoute(editTarget.id, draftForm);
    } else {
      addRoute(draftForm);
    }
    setEditOpen(false);
  };

  const handleClose = () => {
    if (!isAwaitingLocationRef.current) {
      useRouteDraftStore.getState().consumePendingLocation();
    }
    setEditOpen(false);
  };

  // 출발지/목적지 검색 화면으로 이동 — 복귀 시 모달 재오픈을 위해 ref 설정
  const handleSelectLocation = (field: 'from' | 'to') => {
    isAwaitingLocationRef.current = true;
    setEditOpen(false);
    router.push({ pathname: '/search', params: { mode: 'select-location', field } });
  };

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
          <Plus size={ICON_SIZE.card} color={PALETTE.blue600} />
          <Text className={`text-sm font-semibold ${addBtnText}`}>추가</Text>
        </Pressable>
      </View>

      {routes.length === 0 ? (
        <View className={`flex-1 ${pageBg}`}>
          <EmptyState onAddPress={handleAdd} />
        </View>
      ) : (
        <ScrollView className={`flex-1 ${pageBg}`} showsVerticalScrollIndicator={false}>
          {/* F-AD01 광고 배너 슬롯 */}
          <View className="px-5 pt-4">
            <AdSlot type="banner" />
          </View>

          {/* 경로 목록 */}
          <View className="px-5 pb-6 pt-5">
            <Text className={`mb-3 text-sm font-semibold ${listHeading}`}>저장된 경로</Text>
            <View className="gap-3">
              {routes.map((route) => (
                <RouteListItem
                  key={route.id}
                  route={route}
                  onNavigateToSetup={handleNavigateToSetup}
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
          isEditMode={editTarget !== undefined}
          form={draftForm}
          onFormChange={(updates) => setDraftForm((prev) => ({ ...prev, ...updates }))}
          onSelectLocation={handleSelectLocation}
        />
      )}
    </MobileLayout>
  );
}
