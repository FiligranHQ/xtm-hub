// Builds a Markdown test report from Vitest JSON reports, focused on what a pull request touches: every failed test,
// and the tests of the test files the pull request changes, with a ✏️ on the tests whose lines changed.
//
// Usage: node report.mjs --id <id> --title <title> --app-dir <apps/x> --reports <dir> --base <git ref> [--max-length <n>]
// Vitest must run with `--reporter=json --includeTaskLocation` so each test carries its line number.

import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

const MAX_FAILURE_LINES = 12;
const TEST_CALL = /^\s*(it|test)\b/;

const { values: args } = parseArgs({
  options: {
    id: { type: 'string' },
    title: { type: 'string' },
    'app-dir': { type: 'string' },
    reports: { type: 'string' },
    base: { type: 'string' },
    'max-length': { type: 'string' },
  },
});
const appDir = args['app-dir'].replace(/\/$/, '');

const STATUS_ICON = { passed: '✅', failed: '❌' };
const statusIcon = (status) => STATUS_ICON[status] ?? '⏭️';
const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// eslint-disable-next-line no-control-regex
const stripAnsi = (text) => text.replace(/\u001b\[[0-9;]*m/g, '');
const formatCount = (count) => count.toLocaleString('en-US');
const pluralize = (count, noun) => `${formatCount(count)} ${noun}${count === 1 ? '' : 's'}`;

// Vitest writes absolute paths from inside the test container: keep the part from the app directory on.
const toRepoPath = (absolutePath) => {
  const index = absolutePath.lastIndexOf(`/${appDir}/`);
  return index === -1 ? absolutePath : absolutePath.slice(index + 1);
};

const readTestFiles = () => {
  if (!existsSync(args.reports)) {
    return [];
  }
  return readdirSync(args.reports)
    .filter((file) => file.endsWith('.json'))
    .flatMap(
      (file) =>
        JSON.parse(readFileSync(path.join(args.reports, file), 'utf8'))
          .testResults
    )
    .map((testFile) => ({
      path: toRepoPath(testFile.name),
      status: testFile.status,
      message: testFile.message,
      tests: testFile.assertionResults.map((test) => ({
        name: [...test.ancestorTitles, test.title].join(' › '),
        status: test.status,
        line: test.location?.line,
        failureMessages: test.failureMessages ?? [],
      })),
    }));
};

// Changed line numbers of each file, on the new side of the diff.
const readChangedLines = () => {
  const diff = execFileSync(
    'git',
    ['diff', '--unified=0', '--no-color', args.base, 'HEAD', '--', appDir],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
  );
  const changedLines = new Map();
  let currentFile = null;
  for (const line of diff.split('\n')) {
    if (line.startsWith('+++ ')) {
      currentFile = line === '+++ /dev/null' ? null : line.slice(6);
      if (currentFile) {
        changedLines.set(currentFile, new Set());
      }
      continue;
    }
    const hunk = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(line);
    if (hunk && currentFile) {
      const start = Number(hunk[1]);
      const count = hunk[2] === undefined ? 1 : Number(hunk[2]);
      // A pure deletion (count 0) still touches the line it was removed after.
      const lines = changedLines.get(currentFile);
      if (count === 0) {
        lines.add(Math.max(start, 1));
      }
      for (let offset = 0; offset < count; offset++) {
        lines.add(start + offset);
      }
    }
  }
  return changedLines;
};

// A test spans from the `it(` / `test(` call that holds its title down to the line before the next test. Vitest
// reports the title's line, so walk up to the call itself: `it.each` tables sit between the two.
const markChangedTests = (testFile, changedLines) => {
  if (!existsSync(testFile.path)) {
    return;
  }
  const sourceLines = readFileSync(testFile.path, 'utf8').split('\n');
  const titleLines = [
    ...new Set(testFile.tests.map((test) => test.line).filter(Boolean)),
  ].sort((a, b) => a - b);
  const ranges = new Map();
  titleLines.forEach((titleLine, index) => {
    const lowerBound = index === 0 ? 1 : titleLines[index - 1] + 1;
    let start = titleLine;
    while (start > lowerBound && !TEST_CALL.test(sourceLines[start - 1])) {
      start--;
    }
    ranges.set(titleLine, { start: TEST_CALL.test(sourceLines[start - 1]) ? start : titleLine });
  });
  titleLines.forEach((titleLine, index) => {
    const next = titleLines[index + 1];
    ranges.get(titleLine).end = next ? ranges.get(next).start - 1 : sourceLines.length;
  });
  for (const test of testFile.tests) {
    const range = ranges.get(test.line);
    test.changed =
      !!range &&
      [...changedLines].some((line) => line >= range.start && line <= range.end);
  }
};

const renderFailures = (testFiles) => {
  const failures = testFiles.flatMap((testFile) => {
    const failedTests = testFile.tests
      .filter((test) => test.status === 'failed')
      .map((test) => ({ file: testFile.path, name: test.name, message: test.failureMessages.join('\n') }));
    // A file that fails before running any test (import error, failing hook) has no failed test of its own.
    if (testFile.status === 'failed' && failedTests.length === 0) {
      failedTests.push({ file: testFile.path, name: 'Test file failed to run', message: testFile.message ?? '' });
    }
    return failedTests;
  });
  if (failures.length === 0) {
    return [];
  }
  const lines = ['#### ❌ Failed tests', ''];
  for (const failure of failures) {
    const message = stripAnsi(failure.message).trim().split('\n').slice(0, MAX_FAILURE_LINES).join('\n');
    lines.push(
      `<details open><summary>❌ <code>${escapeHtml(failure.file)}</code> › ${escapeHtml(failure.name)}</summary>`,
      '',
      '```',
      message.replace(/```/g, "'''"),
      '```',
      '</details>',
      ''
    );
  }
  return lines;
};

const renderChangedTestFiles = (testFiles, changedLines) => {
  const lines = ['#### 🔍 Tests in the test files this pull request changes', ''];
  const changedTestFiles = testFiles
    .filter((testFile) => changedLines.has(testFile.path))
    .sort((a, b) => a.path.localeCompare(b.path));
  if (changedTestFiles.length === 0) {
    return [...lines, '_This pull request changes no test file here._', ''];
  }
  lines.push('_✏️ marks the tests whose lines this pull request adds or changes._', '');
  const renderTest = (test) =>
    `- ${statusIcon(test.status)} ${test.changed ? '✏️ ' : ''}${escapeHtml(test.name)}`;
  for (const testFile of changedTestFiles) {
    markChangedTests(testFile, changedLines.get(testFile.path));
    const failed = testFile.status === 'failed' || testFile.tests.some((test) => test.status === 'failed');
    // Changed tests come first, with any failing one; the untouched ones are folded away.
    const shown = testFile.tests.filter((test) => test.changed || test.status === 'failed');
    const others = testFile.tests.filter((test) => !shown.includes(test));
    const changedCount = testFile.tests.filter((test) => test.changed).length;
    lines.push(
      `<details open><summary>${failed ? '❌' : '✅'} <code>${escapeHtml(testFile.path)}</code> · ${changedCount} changed of ${pluralize(testFile.tests.length, 'test')}</summary>`,
      '',
      ...shown.map(renderTest)
    );
    if (others.length > 0) {
      lines.push(
        '',
        `<details><summary>${pluralize(others.length, 'other test')}</summary>`,
        '',
        ...others.map(renderTest),
        '',
        '</details>'
      );
    }
    lines.push('', '</details>', '');
  }
  return lines;
};

const testFiles = readTestFiles();

const lines = [`<!-- vitest-report:${args.id} -->`, `### ${args.title}`, ''];
if (testFiles.length === 0) {
  lines.push('⚠️ No test report was found: the test shards did not produce any result.');
} else {
  lines.push(
    ...renderFailures(testFiles),
    ...renderChangedTestFiles(testFiles, readChangedLines())
  );
}

let body = lines.join('\n');
const maxLength = Number(args['max-length'] ?? Infinity);
if (body.length > maxLength) {
  // Cut on a line boundary, then close the code block and every <details> left open so the comment still renders.
  body = body.slice(0, body.lastIndexOf('\n', maxLength));
  if ((body.match(/^```/gm) ?? []).length % 2 === 1) {
    body += '\n```';
  }
  const openDetails =
    (body.match(/<details/g) ?? []).length -
    (body.match(/<\/details>/g) ?? []).length;
  body += '\n\n</details>'.repeat(openDetails);
  body += '\n\n_Report truncated, see the job summary._';
}
process.stdout.write(`${body}\n`);
