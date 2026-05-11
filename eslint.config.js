// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'node_modules/', '.expo/', 'build/'],
  },
  {
    rules: {
      // 중첩 삼항 금지 — if-else 또는 IIFE로 변환
      'no-nested-ternary': 'error',

      // console 금지 — src/utils/logger.ts 사용 (warn/error만 예외)
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // any 타입 금지 — src/api/{도메인}/types.ts 정의 또는 unknown + 타입 가드
      '@typescript-eslint/no-explicit-any': 'error',

      // 미사용 변수 즉시 삭제 (_prefix는 인자에 한해 허용)
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],

      // require() 대신 import
      '@typescript-eslint/no-require-imports': 'warn',

      // 빈 함수 경고
      '@typescript-eslint/no-empty-function': 'warn',
    },
  },
  {
    // 테스트 파일에서는 console 허용, any 경고로 완화
    files: ['**/__tests__/**/*.{ts,tsx}', '**/*.test.{ts,tsx}'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
]);
