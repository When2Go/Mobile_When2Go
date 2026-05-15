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

      // [PALETTE] JSX color/fill 등 prop에 16진수 색상 리터럴 직접 사용 금지
      // → src/constants/colors.ts 의 PALETTE.* 상수로 교체
      // 예: color="#f59e0b" ❌  →  color={PALETTE.amber500} ✅
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'JSXAttribute[name.name=/^(color|fill|stroke|backgroundColor|tintColor|trackColor|thumbColor)$/][value.type="Literal"][value.value=/^#[0-9a-fA-F]{3,8}$/]',
          message:
            '하드코딩 색상 리터럴 금지. PALETTE.* 상수를 사용하세요 (src/constants/colors.ts). 예: color={PALETTE.amber500}',
        },
        // [ICON_SIZE] lucide 등 아이콘 size prop에 숫자 리터럴 직접 사용 금지
        // → src/constants/icons.ts 의 ICON_SIZE.* 또는 파일 상단 const 사용
        // 예: size={18} ❌  →  size={ICON_SIZE.card} 또는 const FORM_ICON_SIZE = 18 ✅
        {
          selector: 'JSXAttribute[name.name="size"] > JSXExpressionContainer > Literal',
          message:
            '매직 사이즈 금지. ICON_SIZE.* (src/constants/icons.ts) 또는 파일 상단 const를 사용하세요. 예: const FORM_ICON_SIZE = 18',
        },
      ],

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
