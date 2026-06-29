import { useCallback, useEffect, useRef, type Context } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  type ListRenderItem,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { NativeViewGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import {
  HOUR_OPTIONS,
  MINUTE_OPTIONS,
  PERIOD_OPTIONS,
  TIME_RANGE_NOTICE,
  WHEEL_ITEM_HEIGHT,
  WHEEL_VISIBLE_SIDE_COUNT,
  type Period,
} from '@/constants/setup';
import { clampIndex, indexToOffset, offsetToIndex } from '@/utils/wheelPicker';

/** 휠 전체 높이 = (양옆 보이는 칸 + 중앙 1칸) * 항목 높이. */
const WHEEL_HEIGHT = (WHEEL_VISIBLE_SIDE_COUNT * 2 + 1) * WHEEL_ITEM_HEIGHT;
/** 첫/마지막 항목도 중앙 라인에 닿도록 위·아래에 두는 스페이서 높이. */
const SPACER_HEIGHT = WHEEL_VISIBLE_SIDE_COUNT * WHEEL_ITEM_HEIGHT;
/** 중앙에서 멀어질수록 적용할 최소 opacity / scale (페이드 끝값). */
const MIN_OPACITY = 0.25;
const MIN_SCALE = 0.82;
/** opacity·scale 보간을 적용할 거리(칸 수) 범위. */
const FADE_DISTANCE = WHEEL_VISIBLE_SIDE_COUNT + 1;
/** 휠 항목 Pressable 의 hitSlop(작은 글자 탭 보조). */
const WHEEL_ITEM_HIT_SLOP = 4;
/** Reanimated onScroll 의 호출 간격(ms). 60fps ≈ 16ms 와 일치. */
const SCROLL_EVENT_THROTTLE_MS = 16;
/** 중앙 강조 박스를 정확히 가운데 칸에 맞추기 위한 음수 마진(절반 높이만큼 위로). */
const CENTER_BAR_MARGIN_TOP = -(WHEEL_ITEM_HEIGHT / 2);
/** 화면에 보이는 칸 수(중앙 1 + 양옆). FlatList 초기/batch 렌더 수의 기준. */
const WHEEL_VISIBLE_COUNT = WHEEL_VISIBLE_SIDE_COUNT * 2 + 1;
/**
 * FlatList 윈도우 크기(뷰포트 배수). 3 = 가시 1 + 위·아래 각 1 뷰포트.
 * 페이드 적용 구간(FADE_DISTANCE 칸)이 항상 마운트된 상태를 유지하도록
 * 가시 영역보다 넉넉히 잡아 항목이 페이드 없이 튀어나오는 것을 막는다.
 *
 * 참고: removeClippedSubviews 는 일부러 켜지 않는다. reanimated 워크릿이 붙은
 * 셀을 클립하면 페이드/터치가 깨지는 알려진 문제가 있어, 윈도잉은 windowSize 로만 한다.
 */
const WHEEL_WINDOW_SIZE = 3;

const AnimatedFlatList = Animated.FlatList;

/**
 * RN ScrollView 가 자식에게 내려주는 orientation context.
 * VirtualizedList 는 이 context 가 같은 방향으로 존재하면
 * "VirtualizedLists should never be nested inside plain ScrollViews" 경고를 띄운다.
 * 휠은 BottomSheetScrollView(RepeatEditModal) 안에서도 쓰이는데, 고정 높이(WHEEL_HEIGHT)로
 * 독립 스크롤하므로 시트 스크롤에 기여하지 않는다 → 가상화도 정상 동작한다.
 * 휠 FlatList 서브트리에서만 context 를 null 로 리셋해 그 오탐 경고를 막는다.
 * (런타임 static 이지만 RN TS 타입에 노출되지 않아 cast 로 접근.)
 */
const ScrollViewContext = (ScrollView as unknown as { Context: Context<unknown> }).Context;

interface Props {
  period: Period;
  hour: number;
  minute: number;
  onPeriodChange: (period: Period) => void;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
}

type ColumnAlign = 'start' | 'center' | 'end';

interface WheelColumnProps<T> {
  options: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
  format: (value: T) => string;
  align: ColumnAlign;
  itemText: string;
}

/** 열 정렬별 항목 className (시안: period=우측, hour=중앙, minute=좌측). */
const ITEM_ALIGN_CLASS: Record<ColumnAlign, string> = {
  start: 'items-start pl-3',
  end: 'items-end pr-3',
  center: 'items-center',
};

/**
 * 휠 한 열(period | hour | minute 공통).
 * - 세로 FlatList(가상화) + snapToInterval=WHEEL_ITEM_HEIGHT 로 항상 한 칸에 정렬.
 *   화면 밖 항목은 마운트하지 않아(windowing) reanimated 워크릿 평가 수를 줄인다.
 *   고정 높이라 getItemLayout 으로 위치를 즉시 계산 → 초기 중앙 위치도 blank 없이 렌더.
 * - 상·하단 SPACER_HEIGHT 스페이서(ListHeader/ListFooter) → 첫/마지막 항목도 중앙 도달(비순환).
 *   스페이서를 헤더/푸터로 두고 getItemLayout offset 에 SPACER_HEIGHT 를 포함시켜
 *   FlatList 의 렌더 윈도우 판정과 실제 레이아웃을 정확히 일치시킨다.
 * - 스크롤 멈춤(onMomentumScrollEnd/onScrollEndDrag)에서 offset→index→clamp 후
 *   외부 selected 와 다를 때만 onSelect + Haptics.selectionAsync() 1회.
 * - 외부 prop 변경 시 해당 index 로 scrollTo. 프로그램적 스크롤 타깃을
 *   programmaticIndexRef 로 들고, 그로 인한 멈춤 콜백의 재-onSelect 를 가드.
 * - 거리 기반 opacity/scale 페이드는 Reanimated scrollY 로 프레임 단위 보간(튐 없음).
 * - NativeViewGestureHandler(disallowInterruption) 로 래핑: 휠 세로 드래그가
 *   조상 스크롤/팬(바텀시트 content pan · BottomSheetScrollView · 페이지 ScrollView)
 *   에게 양보되지 않도록 터치를 독점. gorhom 공식 트러블슈팅 권장 방식.
 */
function WheelColumn<T>({
  options,
  selected,
  onSelect,
  format,
  align,
  itemText,
}: WheelColumnProps<T>) {
  const length = options.length;
  const selectedIndex = clampIndex(Math.max(0, options.indexOf(selected)), length);

  const scrollRef = useRef<Animated.FlatList<T>>(null);
  const scrollY = useSharedValue(indexToOffset(selectedIndex, WHEEL_ITEM_HEIGHT));
  // 프로그램적으로 스크롤 보낸 목표 index. 그로 인한 멈춤 콜백은 onSelect 재호출 금지.
  const programmaticIndexRef = useRef<number | null>(null);
  // 현재 외부 선택 index 의 최신값(콜백 클로저 stale 방지).
  const selectedIndexRef = useRef(selectedIndex);
  selectedIndexRef.current = selectedIndex;
  // 마운트 가드: 초기 위치는 contentOffset 로 이미 잡히므로 첫 effect 실행
  // (마운트)에서의 animated scrollTo 는 같은 위치로의 불필요한 호출. 건너뛴다.
  const didMountRef = useRef(false);
  // 이중 발화 가드: 관성 있는 드래그는 onScrollEndDrag → onMomentumScrollEnd 순으로
  // settle 콜백이 두 번 발화한다. onMomentumScrollBegin 으로 관성 시작 여부를
  // 표시해, onScrollEndDrag 는 짧은 드래그(관성 없음) 폴백 시에만 settle.
  const isMomentumScrollRef = useRef(false);

  const scrollToIndex = useCallback((index: number, animated: boolean) => {
    scrollRef.current?.scrollToOffset({ offset: indexToOffset(index, WHEEL_ITEM_HEIGHT), animated });
  }, []);

  // 외부 prop(칩/period 전환 등) 변경 → 해당 index 로 동기화.
  // 가드: 프로그램적 타깃으로 마킹해 결과 멈춤 콜백이 onSelect 를 되쏘지 않게 함.
  useEffect(() => {
    if (!didMountRef.current) {
      // 마운트: contentOffset 가 이미 selectedIndex 위치라 스크롤 불필요.
      didMountRef.current = true;
      return;
    }
    programmaticIndexRef.current = selectedIndex;
    scrollToIndex(selectedIndex, true);
    scrollY.value = indexToOffset(selectedIndex, WHEEL_ITEM_HEIGHT);
  }, [selectedIndex, scrollToIndex, scrollY]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const settleToOffset = (offsetY: number) => {
    const nextIndex = offsetToIndex(offsetY, WHEEL_ITEM_HEIGHT, length);

    // 프로그램적 스크롤로 도달한 지점이면 가드 해제만 하고 콜백 금지(피드백 루프 차단).
    if (programmaticIndexRef.current !== null) {
      if (programmaticIndexRef.current === nextIndex) {
        programmaticIndexRef.current = null;
        return;
      }
      programmaticIndexRef.current = null;
    }

    // 실제 선택 index 가 바뀔 때만 onSelect + 햅틱 1회.
    if (nextIndex !== selectedIndexRef.current) {
      void Haptics.selectionAsync();
      onSelect(options[nextIndex]);
    }
  };

  const handleScrollBeginDrag = () => {
    isMomentumScrollRef.current = false;
  };

  const handleMomentumScrollBegin = () => {
    isMomentumScrollRef.current = true;
  };

  // 짧은 드래그(관성 없음) 폴백: 한 프레임 양보 후 관성이 시작되지 않았으면 직접 settle.
  // 관성이 시작되면 onMomentumScrollEnd 가 단독으로 settle 하므로 이중 발화 방지.
  const handleScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    requestAnimationFrame(() => {
      if (!isMomentumScrollRef.current) {
        settleToOffset(offsetY);
      }
    });
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    isMomentumScrollRef.current = false;
    settleToOffset(event.nativeEvent.contentOffset.y);
  };

  // 값 기준 안정 key → 윈도잉으로 항목이 마운트/언마운트돼도 워크릿이 엉키지 않는다.
  const keyExtractor = useCallback((value: T) => format(value), [format]);

  // 고정 높이 → 위치를 즉시 계산. offset 에 스페이서(헤더) 높이를 포함시켜
  // FlatList 의 렌더 윈도우 판정과 실제 레이아웃을 일치시킨다.
  const getItemLayout = useCallback(
    (_data: ArrayLike<T> | null | undefined, index: number) => ({
      length: WHEEL_ITEM_HEIGHT,
      offset: SPACER_HEIGHT + index * WHEEL_ITEM_HEIGHT,
      index,
    }),
    [],
  );

  const renderSpacer = useCallback(() => <View style={{ height: SPACER_HEIGHT }} />, []);

  const renderItem = useCallback<ListRenderItem<T>>(
    ({ item, index }) => (
      <WheelItem
        label={format(item)}
        index={index}
        scrollY={scrollY}
        align={align}
        itemText={itemText}
        onPress={() => {
          // 탭 폴백: 오프셋 항목 탭 → 그 항목을 중앙으로 스크롤.
          programmaticIndexRef.current = index;
          scrollToIndex(index, true);
          if (index !== selectedIndexRef.current) {
            void Haptics.selectionAsync();
            onSelect(options[index]);
          }
        }}
      />
    ),
    [format, scrollY, align, itemText, scrollToIndex, onSelect, options],
  );

  return (
    <View className="flex-1" style={{ height: WHEEL_HEIGHT }}>
      <ScrollViewContext.Provider value={null}>
        <NativeViewGestureHandler disallowInterruption>
          <AnimatedFlatList
            ref={scrollRef}
            data={options}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            getItemLayout={getItemLayout}
            ListHeaderComponent={renderSpacer}
            ListFooterComponent={renderSpacer}
            showsVerticalScrollIndicator={false}
            snapToInterval={WHEEL_ITEM_HEIGHT}
            decelerationRate="fast"
            scrollEventThrottle={SCROLL_EVENT_THROTTLE_MS}
            onScroll={scrollHandler}
            onScrollBeginDrag={handleScrollBeginDrag}
            onMomentumScrollBegin={handleMomentumScrollBegin}
            onScrollEndDrag={handleScrollEndDrag}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            contentOffset={{ x: 0, y: indexToOffset(selectedIndex, WHEEL_ITEM_HEIGHT) }}
            initialNumToRender={WHEEL_VISIBLE_COUNT}
            maxToRenderPerBatch={WHEEL_VISIBLE_COUNT}
            windowSize={WHEEL_WINDOW_SIZE}
          />
        </NativeViewGestureHandler>
      </ScrollViewContext.Provider>
    </View>
  );
}

interface WheelItemProps {
  label: string;
  index: number;
  scrollY: ReturnType<typeof useSharedValue<number>>;
  align: ColumnAlign;
  itemText: string;
  onPress: () => void;
}

/** 휠 항목 1개. 중앙으로부터 거리에 따라 opacity·scale 보간(프레임 단위). */
function WheelItem({
  label,
  index,
  scrollY,
  align,
  itemText,
  onPress,
}: WheelItemProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const centeredIndex = scrollY.value / WHEEL_ITEM_HEIGHT;
    const distance = Math.min(Math.abs(index - centeredIndex), FADE_DISTANCE);
    const t = distance / FADE_DISTANCE;
    return {
      opacity: 1 - (1 - MIN_OPACITY) * t,
      transform: [{ scale: 1 - (1 - MIN_SCALE) * t }],
    };
  });

  return (
    <Animated.View
      style={[animatedStyle, { height: WHEEL_ITEM_HEIGHT }]}
      className={`justify-center ${ITEM_ALIGN_CLASS[align]}`}
    >
      <Pressable onPress={onPress} accessibilityRole="button" hitSlop={WHEEL_ITEM_HIT_SLOP}>
        <Text className={`text-2xl font-medium ${itemText}`}>{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

/**
 * iOS 스타일 시간 휠.
 * - 3열: 오전·오후 / 시 / 분. 각 열은 손가락 드래그로 스크롤되며
 *   가운데 항목이 항상 선택값(snap). 외부 period/hour/minute 와 양방향 동기화.
 * - 중앙 강조 박스(renderCenterBar) + 다크모드 z-order 의도 유지.
 * - 끝단 비순환(clamp) — 시안이 선형 리스트라 일치.
 */
export default function TimeWheelPicker({
  period,
  hour,
  minute,
  onPeriodChange,
  onHourChange,
  onMinuteChange,
}: Props) {
  const centerBoxBg = 'bg-white';
  // 항목 색은 단일 톤 — 중앙 강조는 거리 기반 opacity/scale 페이드가 담당.
  const itemText = 'text-zinc-900';
  const noticeBg = 'bg-red-50';
  const noticeText = 'text-red-500';

  // Android: overflow-hidden + absolute 형제 조합에서 z-order가 역전될 수 있어
  // 중앙 박스(z-0)와 컬럼 컨테이너(z-10)에 z-index를 명시한다.
  const renderCenterBar = () => (
    <View
      style={{ pointerEvents: 'none', height: WHEEL_ITEM_HEIGHT, marginTop: CENTER_BAR_MARGIN_TOP }}
      className={`absolute inset-x-3 top-1/2 z-0 rounded-xl ${centerBoxBg}`}
    />
  );

  const formatHour = (h: number) => String(h);
  const formatMinute = (m: number) => String(m).padStart(2, '0');
  const formatPeriod = (p: Period) => p;

  return (
    <View>
      <View className="relative overflow-hidden" style={{ height: WHEEL_HEIGHT }}>
        {renderCenterBar()}
        <View className="relative z-10 h-full flex-row">
          <WheelColumn<Period>
            options={PERIOD_OPTIONS}
            selected={period}
            onSelect={onPeriodChange}
            format={formatPeriod}
            align="end"
            itemText={itemText}
          />
          <WheelColumn<number>
            options={HOUR_OPTIONS}
            selected={hour}
            onSelect={onHourChange}
            format={formatHour}
            align="center"
            itemText={itemText}
          />
          <WheelColumn<number>
            options={MINUTE_OPTIONS}
            selected={minute}
            onSelect={onMinuteChange}
            format={formatMinute}
            align="start"
            itemText={itemText}
          />
        </View>
      </View>

      <View className={`mx-3 mb-3 mt-1 items-center justify-center rounded-xl py-2 ${noticeBg}`}>
        <Text className={`text-xs font-medium ${noticeText}`}>{TIME_RANGE_NOTICE}</Text>
      </View>
    </View>
  );
}
