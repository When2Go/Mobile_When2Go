/**
 * lucide-react-native 아이콘 사이즈 표준.
 * 매핑 근거: docs/DESIGN.md §8
 *
 * Tailwind 사이즈 클래스 대응:
 * - tab    : h-7 w-7  (28px)
 * - header : h-5 w-5  (20px)
 * - card   : h-4 w-4  (16px)
 * - caption: h-3 w-3  (12px)
 */

export const ICON_SIZE = {
  tab: 28,
  header: 20,
  card: 16,
  caption: 12,
} as const;

export const ICON_TW_CLASS = {
  tab: 'h-7 w-7',
  header: 'h-5 w-5',
  card: 'h-4 w-4',
  caption: 'h-3 w-3',
} as const;

export type IconSizeKey = keyof typeof ICON_SIZE;
