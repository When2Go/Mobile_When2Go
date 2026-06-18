import { useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetModal as RNBottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { X } from 'lucide-react-native';

import { ICON_SIZE } from '@/constants/icons';
import { PALETTE } from '@/constants/colors';

const DEFAULT_SNAP_POINTS = ['50%'];
const BACKDROP_OPACITY = 0.5;
const APPEAR_INDEX = 0;
const DISAPPEAR_INDEX = -1;
const HANDLE_BAR_CLASS = 'h-1 w-10 self-center my-2 rounded-full';

interface BottomSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  snapPoints?: string[];
  /** 콘텐츠가 시트 높이를 넘으면 스크롤되도록 BottomSheetScrollView로 감싼다. */
  scrollable?: boolean;
  /** 키보드 등장 시 시트 동작. TextInput 포함 시트는 "interactive" 권장. */
  keyboardBehavior?: 'extend' | 'fillParent' | 'interactive';
  children: ReactNode;
}

export default function BottomSheetModal({
  isOpen,
  onClose,
  title,
  snapPoints = DEFAULT_SNAP_POINTS,
  scrollable = false,
  keyboardBehavior,
  children,
}: BottomSheetModalProps) {
  const ref = useRef<RNBottomSheetModal>(null);

  useEffect(() => {
    if (isOpen) {
      ref.current?.present();
    } else {
      ref.current?.dismiss();
    }
  }, [isOpen]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={APPEAR_INDEX}
        disappearsOnIndex={DISAPPEAR_INDEX}
        opacity={BACKDROP_OPACITY}
        pressBehavior="close"
      />
    ),
    [],
  );

  const renderHandle = useCallback(() => {
    const barBg = 'bg-zinc-200';
    return <View className={`${HANDLE_BAR_CLASS} ${barBg}`} />;
  }, []);

  const sheetBgColor = PALETTE.white;
  const headingText = 'text-zinc-900';
  const dividerBorder = 'border-zinc-100';
  const closeIconColor = PALETTE.zinc500;

  const backgroundStyle = useMemo(() => ({ backgroundColor: sheetBgColor }), [sheetBgColor]);

  return (
    <RNBottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      handleComponent={renderHandle}
      backgroundStyle={backgroundStyle}
      keyboardBehavior={keyboardBehavior}
      keyboardBlurBehavior="restore"
    >
      {scrollable ? (
        <BottomSheetScrollView showsVerticalScrollIndicator={false}>
          {title ? (
            <View
              className={`flex-row items-center justify-between border-b px-5 py-3 ${dividerBorder}`}
            >
              <Text className={`text-base font-bold ${headingText}`}>{title}</Text>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="닫기"
                className="-mr-2 rounded-full p-2 active:opacity-60"
              >
                <X size={ICON_SIZE.header} color={closeIconColor} />
              </Pressable>
            </View>
          ) : null}
          <View className="px-5 pb-10 pt-3">{children}</View>
        </BottomSheetScrollView>
      ) : (
        <BottomSheetView>
          {title ? (
            <View
              className={`flex-row items-center justify-between border-b px-5 py-3 ${dividerBorder}`}
            >
              <Text className={`text-base font-bold ${headingText}`}>{title}</Text>
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="닫기"
                className="-mr-2 rounded-full p-2 active:opacity-60"
              >
                <X size={ICON_SIZE.header} color={closeIconColor} />
              </Pressable>
            </View>
          ) : null}
          <View className="px-5 pb-10 pt-3">{children}</View>
        </BottomSheetView>
      )}
    </RNBottomSheetModal>
  );
}
