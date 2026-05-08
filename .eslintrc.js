module.exports = {
  root: true,
  extends: [
    'expo',
    '@react-native',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  rules: {
    // ─── 중첩 삼항 금지 ───────────────────────────────────────────────
    // 조건이 2개 이상이면 if-else 또는 IIFE로 변환할 것.
    // 예: const label = (() => { if (s==='active') return '진행중'; ... })();
    'no-nested-ternary': 'error',

    // ─── console 금지 ────────────────────────────────────────────────
    // src/utils/logger.ts 를 사용할 것. logger.debug(), logger.error() 등.
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // ─── any 타입 금지 ────────────────────────────────────────────────
    // API 응답이면 src/api/{도메인}/types.ts 에 타입 정의.
    // 불확실하면 unknown + 타입 가드 패턴 사용.
    // as unknown as T 캐스팅 단독 사용 금지 — 반드시 타입 가드와 함께.
    '@typescript-eslint/no-explicit-any': 'error',

    // ─── 미사용 변수 금지 ─────────────────────────────────────────────
    // 즉시 삭제. _prefix 변수도 실제로 미사용이면 삭제.
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

    // ─── require() 금지 (import 사용) ────────────────────────────────
    '@typescript-eslint/no-var-requires': 'warn',

    // ─── 빈 함수 경고 ────────────────────────────────────────────────
    '@typescript-eslint/no-empty-function': 'warn',

    // ─── React import 불필요 (React 17+) ─────────────────────────────
    'react/react-in-jsx-scope': 'off',
  },
  overrides: [
    {
      // 테스트 파일에서는 console 허용
      files: ['**/__tests__/**/*.ts', '**/__tests__/**/*.tsx', '**/*.test.ts', '**/*.test.tsx'],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
      },
    },
  ],
  ignorePatterns: ['node_modules/', '.expo/', 'dist/', 'build/'],
};
