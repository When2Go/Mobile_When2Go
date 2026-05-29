import { createContext, useContext, useMemo, type ReactNode } from 'react';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

// 다크모드는 현재 일괄 제거 상태입니다 (#58). 재도입 시 본 컨텍스트 내부만 복원하면 되도록
// ThemeProvider/useTheme/시그니처는 그대로 보존하고, 외부에서 보이는 동작만 라이트로 고정합니다.
function noop() {
  // 다크모드 비활성: setMode / toggle은 의도적으로 아무 동작도 하지 않습니다.
}

const FIXED_VALUE: ThemeContextValue = {
  isDark: false,
  mode: 'light',
  setMode: noop,
  toggle: noop,
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const value = useMemo<ThemeContextValue>(() => FIXED_VALUE, []);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme은 ThemeProvider 내부에서만 호출할 수 있다.');
  }
  return ctx;
}
