/**
 * 의미별 색상 토큰. NativeWind 클래스로 표현이 어려운 경우(RN API의 color prop,
 * lucide 아이콘 color, StatusBar 등)에 한해 직접 참조한다.
 * 값은 Tailwind 기본 팔레트의 hex 값을 그대로 사용.
 *
 * 매핑 근거: docs/DESIGN.md §2
 */

export const PALETTE = {
  // brand
  blue400: '#60a5fa',
  blue500: '#3b82f6',
  blue600: '#2563eb',
  blue700: '#1d4ed8',
  blue50: '#eff6ff',
  blue900: '#1e3a8a',
  // zinc
  zinc50: '#fafafa',
  zinc100: '#f4f4f5',
  zinc200: '#e4e4e7',
  zinc300: '#d4d4d8',
  zinc400: '#a1a1aa',
  zinc500: '#71717a',
  zinc700: '#3f3f46',
  zinc800: '#27272a',
  zinc900: '#18181b',
  zinc950: '#09090b',
  // state
  emerald100: '#d1fae5',
  emerald400: '#34d399',
  emerald600: '#059669',
  emerald700: '#047857',
  red500: '#ef4444',
  rose400: '#fb7185',
  rose600: '#e11d48',
  white: '#ffffff',
} as const;

export const COLORS = {
  light: {
    PRIMARY: PALETTE.blue600,
    PRIMARY_ACTIVE: PALETTE.blue500,
    BG: PALETTE.zinc50,
    CARD: PALETTE.white,
    INPUT: PALETTE.zinc100,
    BORDER: PALETTE.zinc100,
    TEXT_HEADING: PALETTE.zinc900,
    TEXT_LABEL: PALETTE.zinc800,
    TEXT_SUB: PALETTE.zinc500,
    TEXT_MUTED: PALETTE.zinc400,
    ICON_INACTIVE: PALETTE.zinc400,
  },
  dark: {
    PRIMARY: PALETTE.blue500,
    PRIMARY_ACTIVE: PALETTE.blue400,
    BG: PALETTE.zinc950,
    CARD: PALETTE.zinc900,
    INPUT: PALETTE.zinc800,
    BORDER: PALETTE.zinc700,
    TEXT_HEADING: PALETTE.zinc100,
    TEXT_LABEL: PALETTE.zinc200,
    TEXT_SUB: PALETTE.zinc400,
    TEXT_MUTED: PALETTE.zinc500,
    ICON_INACTIVE: PALETTE.zinc500,
  },
} as const;

export type ColorScheme = keyof typeof COLORS;
export type ColorToken = keyof typeof COLORS['light'];
