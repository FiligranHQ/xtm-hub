import pluginJs from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    languageOptions: { globals: globals.node },
    plugins: {
      prettier: eslintConfigPrettier,
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.strict,
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/__generated__/**'],
  },
  {
    files: ['**/*.test.ts'],
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
    },
  },
];
