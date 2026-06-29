import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { NativeViewGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedReaction,
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
/**
 * 가시 범위 슬라이싱(윈도잉)에서 중앙 기준 위·아래로 마운트해 둘 칸 수.
 * = 가시 측면(WHEEL_VISIBLE_SIDE_COUNT=2) + 페이드 끝(FADE_DISTANCE 너머)까지 덮고도
 *   빠른 플링 동안 JS 가 renderCenter 를 따라잡을 여유 버퍼까지 포함한 값.
 * 분(60칸)도 이 범위(중앙 ±8 = 최대 17칸)만 마운트해 매 프레임 평가되는 워크릿 수를 줄인다.
 */
const WHEEL_RENDER_SIDE_COUNT = 8;

const AnimatedScrollView = Animated.ScrollView;

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
 * - 세로 ScrollView + snapToInterval=WHEEL_ITEM_HEIGHT 로 항상 한 칸에 정렬.
 * - 가시 범위 슬라이싱(윈도잉): 항목을 전부 마운트하지 않고, 현재 중앙(renderCenter)
 *   기준 ±WHEEL_RENDER_SIDE_COUNT 칸만 렌더한다. 분(60칸)에서 매 스크롤 프레임
 *   평가되는 reanimated 워크릿 수를 줄이는 게 목적. 항목은 절대 위치로 깔아
 *   콘텐츠 전체 높이는 고정 → 안 그린 칸이 있어도 스크롤 범위·snap 이 변하지 않는다.
 * - renderCenter 는 scrollY(공유값)를 useAnimatedReaction 으로 관찰해, 중앙 index 가
 *   바뀔 때만 runOnJS 로 갱신한다(매 프레임 setState 아님). 초기값은 selectedIndex 라
 *   첫 렌더부터 선택값과 이웃 칸이 가운데에 정상 표시된다.
 * - 상·하단 SPACER_HEIGHT 스페이서(콘텐츠 높이에 포함) → 첫/마지막 항목도 중앙 도달(비순환).
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
  // 항목을 절대 위치로 깔기 위한 콘텐츠 전체 높이(스페이서 위·아래 + 항목 전체).
  const contentHeight = length * WHEEL_ITEM_HEIGHT + SPACER_HEIGHT * 2;

  const scrollRef = useRef<Animated.ScrollView>(null);
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

  // 윈도잉 중앙 index. scrollY 를 따라 움직이며, 이 값 ±side 칸만 렌더한다.
  const [renderCenter, setRenderCenter] = useState(selectedIndex);

  const scrollToIndex = useCallback((index: number, animated: boolean) => {
    scrollRef.current?.scrollTo({ y: indexToOffset(index, WHEEL_ITEM_HEIGHT), animated });
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

  // scrollY → 중앙 index. 정수 칸이 바뀔 때만 renderCenter 갱신(매 프레임 setState 방지).
  useAnimatedReaction(
    () => {
      const raw = Math.round(scrollY.value / WHEEL_ITEM_HEIGHT);
      if (raw < 0) return 0;
      if (raw > length - 1) return length - 1;
      return raw;
    },
    (curr, prev) => {
      if (curr !== prev) runOnJS(setRenderCenter)(curr);
    },
    [length],
  );

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

  // 중앙 ±side 칸만 렌더(끝단 clamp). 안 그린 칸이 있어도 절대 위치라 레이아웃 불변.
  const renderStart = Math.max(0, renderCenter - WHEEL_RENDER_SIDE_COUNT);
  const renderEnd = Math.min(length - 1, renderCenter + WHEEL_RENDER_SIDE_COUNT);
  const visibleIndices = Array.from(
    { length: renderEnd - renderStart + 1 },
    (_, k) => renderStart + k,
  );

  return (
    <View className="flex-1" style={{ height: WHEEL_HEIGHT }}>
      <NativeViewGestureHandler disallowInterruption>
        <AnimatedScrollView
          ref={scrollRef}
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
        >
          <View style={{ height: contentHeight }}>
            {visibleIndices.map((index) => (
              <WheelItem
                key={format(options[index])}
                label={format(options[index])}
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
            ))}
          </View>
        </AnimatedScrollView>
      </NativeViewGestureHandler>
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

/**
 * 휠 항목 1개. 중앙으로부터 거리에 따라 opacity·scale 보간(프레임 단위).
 * 슬라이싱 윈도잉이라 항목은 콘텐츠 안에서 절대 위치(top = 스페이서 + index*높이)로 깔린다.
 */
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
      style={[
        animatedStyle,
        {
          position: 'absolute',
          left: 0,
          right: 0,
          top: SPACER_HEIGHT + index * WHEEL_ITEM_HEIGHT,
          height: WHEEL_ITEM_HEIGHT,
        },
      ]}
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
