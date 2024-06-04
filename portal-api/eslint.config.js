import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';


export default [
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.strict,
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/__generated__/**'],
  },
];
