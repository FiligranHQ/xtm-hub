import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  {
    languageOptions: { globals: globals.node },
    plugins: {
      prettier: eslintConfigPrettier,
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.strict,
  globalIgnores([
    '**/dist/**',
    '**/node_modules/**',
    '**/__generated__/**',
    '**/builder/**',
    '**/tests/**',
    '**/src/utils/error/error.util.ts',
  ]),
  {
    files: ['**/*.test.ts', '**/*.test.utils.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
  {
    rules: {
      '@typescript-eslint/ban-ts-ignore': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
      'no-console': [
        'error',
        {
          allow: ['warn', 'error'],
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
]);
