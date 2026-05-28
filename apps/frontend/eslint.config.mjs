import { FlatCompat } from '@eslint/eslintrc';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import unicorn from 'eslint-plugin-unicorn';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const restrictedGlobalTestMocks = new Set([
  'next-intl',
  'next/navigation',
  '@/relay/environment/registry',
  '@/components/error-frontend-log.graphql',
]);

const getStringLiteralValue = (node) => {
  if (node?.type === 'Literal' && typeof node.value === 'string') {
    return node.value;
  }

  return null;
};

const localTestRulesPlugin = {
  rules: {
    'no-remock-shared-globals': {
      meta: {
        type: 'problem',
        docs: {
          description:
            'Disallow re-mocking modules already mocked globally in setup-vitest.ts',
        },
        schema: [],
      },
      create(context) {
        return {
          CallExpression(node) {
            if (
              node.callee.type !== 'MemberExpression' ||
              node.callee.object.type !== 'Identifier' ||
              node.callee.object.name !== 'vi' ||
              node.callee.property.type !== 'Identifier' ||
              node.callee.property.name !== 'mock'
            ) {
              return;
            }

            const moduleName = getStringLiteralValue(node.arguments[0]);
            if (!moduleName || !restrictedGlobalTestMocks.has(moduleName)) {
              return;
            }

            context.report({
              node: node.arguments[0],
              message:
                "'{{moduleName}}' is already mocked in setup-vitest.ts. Reuse the shared mock and override it with vi.mocked(...) in tests.",
              data: { moduleName },
            });
          },
        };
      },
    },
  },
};

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    plugins: {
      unicorn,
    },
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  ...compat.extends('prettier'),
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'react/destructuring-assignment': ['error', 'always'],
      'react/function-component-definition': [
        'error',
        {
          namedComponents: 'arrow-function',
          unnamedComponents: 'arrow-function',
        },
      ],
      'react/no-typos': 'error',
      '@typescript-eslint/no-restricted-types': [
        'error',
        {
          types: {
            'React.FC': {
              message: 'Use a function typed with Props instead',
            },
          },
        },
      ],
      'react-hooks/rules-of-hooks': 'off',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          'ts-expect-error': false,
        },
      ],
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
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ImportDeclaration[source.value=/^(\\.\\.\\/){2,}/]',
          message: "Avoid deep relative imports. Use '@/...'.",
        },
      ],
    },
  },

  // Default → kebab-case (utils, hooks, etc.)
  {
    files: ['**/*.{ts,tsx}'],
    ignores: ['**/components/**', '**/__generated__/**'],
    rules: {
      'unicorn/filename-case': ['error', { case: 'kebabCase' }],
    },
  },
  // Components → PascalCase
  {
    files: ['**/components/**/*.tsx'],
    rules: {
      'unicorn/filename-case': ['error', { case: 'pascalCase' }],
    },
  },
  {
    files: ['**/*.test.{ts,tsx}'],
    plugins: {
      'xtm-hub-test-rules': localTestRulesPlugin,
    },
    rules: {
      'xtm-hub-test-rules/no-remock-shared-globals': 'error',
    },
  },

  {
    files: ['scripts/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'graphql/generated.ts',
      'graphql/mocks.ts',
    ],
  },
];

export default eslintConfig;
