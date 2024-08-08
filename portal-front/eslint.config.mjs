import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import ts from "typescript-eslint";
import { FlatCompat } from '@eslint/eslintrc';
import prettierConfigRecommended from 'eslint-plugin-prettier/recommended';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [...compat.extends('next', 'next/core-web-vitals', 'prettier'), {
  rules: {
    'react-hooks/rules-of-hooks': 0,
    '@next/next/no-duplicate-head': 0,
  },
},
  ...ts.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  prettierConfigRecommended,
  { ignores: [".next/*"] }
];
