#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const fileArgs = process.argv.slice(2);
const frontendRoot = path.resolve(process.cwd(), 'apps/frontend');

const isFrontendFile = (filePath) => {
  const normalizedPath = path.normalize(filePath);
  const frontendPathSegment = `${path.sep}apps${path.sep}frontend${path.sep}`;

  return (
    normalizedPath.includes(frontendPathSegment) ||
    normalizedPath.startsWith(`${frontendRoot}${path.sep}`)
  );
};

if (fileArgs.length === 0) {
  process.exit(0);
}

const forbiddenImportPatterns = [
  /from\s+['"]@generated\/models\/[^'"]+\.enum(?:\.ts)?['"]/g,
  /from\s+['"][^'"]*__generated__\/models\/[^'"]+\.enum(?:\.ts)?['"]/g,
  /import\(\s*['"]@generated\/models\/[^'"]+\.enum(?:\.ts)?['"]\s*\)/g,
  /import\(\s*['"][^'"]*__generated__\/models\/[^'"]+\.enum(?:\.ts)?['"]\s*\)/g,
];

const errors = [];

for (const rawFilePath of fileArgs) {
  const filePath = path.resolve(rawFilePath);

  if (!isFrontendFile(filePath)) {
    continue;
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8');

  for (const pattern of forbiddenImportPatterns) {
    for (const match of content.matchAll(pattern)) {
      const index = match.index ?? 0;
      const line = content.slice(0, index).split('\n').length;
      errors.push({
        filePath,
        line,
        snippet: match[0],
      });
    }
  }
}

if (errors.length > 0) {
  process.stderr.write(
    'Forbidden enum import detected in modified files. Use @graphql/generated instead.\n\n'
  );

  for (const error of errors) {
    process.stderr.write(`- ${error.filePath}:${error.line}\n`);
    process.stderr.write(`  ${error.snippet}\n`);
  }

  process.exit(1);
}

process.exit(0);
