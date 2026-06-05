import fs from 'node:fs';
import path from 'node:path';

const generatedPath = path.resolve('graphql/generated.ts');

if (!fs.existsSync(generatedPath)) {
  process.exit(0);
}

const generatedContent = fs.readFileSync(generatedPath, 'utf8');
const lines = generatedContent.split('\n');

lines[0] =
  'import type { GraphQLClient, RequestOptions } from "graphql-request";';
lines[1] =
  'type GraphQLClientRequestHeaders = RequestOptions["requestHeaders"];';

const withHeaderFix = lines.join('\n');

// Make reruns idempotent by removing previous injected getRootKey lines.
const withoutPreviousRootKeys = withHeaderFix.replace(
  /^\w+\.getRootKey\s*=\s*\(\)\s*=>\s*\[[^\]]*\]\s+as\s+const;\s*$/gm,
  ''
);

// Add hook.getRootKey() next to each generated hook.getKey().
// Example:
// useUseCasesListQuery.getKey = (variables) => ['UseCasesList', variables];
// useUseCasesListQuery.getRootKey = () => ['UseCasesList'] as const;
const normalizedWithRootKeys = withoutPreviousRootKeys.replace(
  /^(\w+)\.getKey\s*=\s*(\(.*?\)\s*=>\s*\[([^\],]+)[^\]]*\]);\s*$/gm,
  (_match, hookName, getKeyExpr, rootKeyExpr) =>
    `${hookName}.getKey = ${getKeyExpr};\n${hookName}.getRootKey = () => [${rootKeyExpr.trim()}] as const;`
);

fs.writeFileSync(generatedPath, normalizedWithRootKeys);
