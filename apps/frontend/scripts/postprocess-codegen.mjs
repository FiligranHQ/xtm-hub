import fs from 'node:fs';
import path from 'node:path';

const generatedPath = path.resolve('graphql/generated.ts');

if (!fs.existsSync(generatedPath)) {
  process.exit(0);
}

const lines = fs.readFileSync(generatedPath, 'utf8').split('\n');

lines[0] =
  'import type { GraphQLClient, RequestOptions } from "graphql-request";';
lines[1] =
  'type GraphQLClientRequestHeaders = RequestOptions["requestHeaders"];';

fs.writeFileSync(generatedPath, lines.join('\n'));
