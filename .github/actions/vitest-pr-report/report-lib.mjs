// Pure functions behind report.mjs: parse the pull request diff, find which tests it touches, render the report.
// Kept free of I/O so report.test.mjs can drive them with fixtures.

const MAX_FAILURE_LINES = 12;
// `it(`, `test(`, `it.each(`, `test.skip(`... at the start of a line.
const TEST_CALL = /^\s*(?:it|test)(?:\.\w+)*\s*[(`]/;
// The title of a test written on one line: `it('title'`, `it.skip("title"`, or the `)('title'` of an `it.each` table.
const TEST_TITLE = [
  /^\s*(?:it|test)(?:\.\w+)*\(\s*(['"`])((?:\\.|(?!\1).)*)\1/,
  /^\s*\]?\)\(\s*(['"`])((?:\\.|(?!\1).)*)\1/,
];

const STATUS_ICON = { passed: '✅', failed: '❌' };
const statusIcon = (status) => STATUS_ICON[status] ?? '⏭️';
export const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// eslint-disable-next-line no-control-regex
const stripAnsi = (text) => text.replace(/\u001b\[[0-9;]*m/g, '');
const formatCount = (count) => count.toLocaleString('en-US');
const pluralize = (count, noun) =>
  `${formatCount(count)} ${noun}${count === 1 ? '' : 's'}`;
const isBlankOrComment = (line) => /^\s*(\/\/.*|\/\*.*|\*.*)?$/.test(line ?? '');

/**
 * Reads a `git diff --unified=0` output.
 * - changedLines: per file still present, the line numbers the diff adds or changes (new side).
 * - removedLines: per file, the content of the lines the diff removes (keyed by the new path when the file still
 *   exists).
 * - deletedFiles: the files the diff deletes.
 */
export const parseDiff = (diff) => {
  const changedLines = new Map();
  const removedLines = new Map();
  const deletedFiles = [];
  let oldPath = null;
  let newPath = null;
  let inHeader = false;
  let hunk = null;

  const closeHunk = () => {
    // A pure deletion touches the line it was removed after, unless what it removed is a whole test: that one is
    // reported as removed, not as a change to its neighbor.
    if (hunk && hunk.count === 0 && newPath && !hunk.removed.some((line) => TEST_CALL.test(line))) {
      changedLines.get(newPath).add(Math.max(hunk.start, 1));
    }
    hunk = null;
  };

  for (const line of diff.split('\n')) {
    if (line.startsWith('diff --git ')) {
      closeHunk();
      inHeader = true;
      oldPath = null;
      newPath = null;
      continue;
    }
    if (inHeader && line.startsWith('--- ')) {
      oldPath = line === '--- /dev/null' ? null : line.slice(6);
      continue;
    }
    if (inHeader && line.startsWith('+++ ')) {
      newPath = line === '+++ /dev/null' ? null : line.slice(6);
      if (newPath) {
        changedLines.set(newPath, new Set());
      } else if (oldPath) {
        deletedFiles.push(oldPath);
      }
      continue;
    }
    const header = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/.exec(line);
    if (header) {
      closeHunk();
      inHeader = false;
      hunk = {
        start: Number(header[1]),
        count: header[2] === undefined ? 1 : Number(header[2]),
        removed: [],
      };
      if (newPath) {
        for (let offset = 0; offset < hunk.count; offset++) {
          changedLines.get(newPath).add(hunk.start + offset);
        }
      }
      continue;
    }
    if (hunk && line.startsWith('-')) {
      const content = line.slice(1);
      hunk.removed.push(content);
      const key = newPath ?? oldPath;
      if (key) {
        removedLines.set(key, [...(removedLines.get(key) ?? []), content]);
      }
    }
  }
  closeHunk();
  return { changedLines, removedLines, deletedFiles };
};

// Index just past the bracket that closes the one at `index`, skipping strings, template literals and comments.
const CLOSING = { '(': ')', '[': ']', '{': '}' };
const skipQuoted = (source, index) => {
  const quote = source[index];
  let cursor = index + 1;
  while (cursor < source.length && source[cursor] !== quote && source[cursor] !== '\n') {
    cursor += source[cursor] === '\\' ? 2 : 1;
  }
  return cursor + 1;
};
const skipTemplate = (source, index) => {
  let cursor = index + 1;
  while (cursor < source.length && source[cursor] !== '`') {
    if (source[cursor] === '\\') {
      cursor += 2;
    } else if (source[cursor] === '$' && source[cursor + 1] === '{') {
      cursor = skipGroup(source, cursor + 1);
    } else {
      cursor++;
    }
  }
  return cursor + 1;
};
const skipGroup = (source, index) => {
  const closing = CLOSING[source[index]];
  let cursor = index + 1;
  while (cursor < source.length) {
    const char = source[cursor];
    if (char === closing) {
      return cursor + 1;
    }
    if (char === "'" || char === '"') {
      cursor = skipQuoted(source, cursor);
    } else if (char === '`') {
      cursor = skipTemplate(source, cursor);
    } else if (char === '/' && source[cursor + 1] === '/') {
      const end = source.indexOf('\n', cursor);
      cursor = end === -1 ? source.length : end;
    } else if (char === '/' && source[cursor + 1] === '*') {
      const end = source.indexOf('*/', cursor + 2);
      cursor = end === -1 ? source.length : end + 2;
    } else if (CLOSING[char]) {
      cursor = skipGroup(source, cursor);
    } else {
      cursor++;
    }
  }
  return source.length;
};

// Line where the test call starting on `startLine` ends: its arguments, plus the second call of `it.each(...)(...)`
// and the table of `it.each\`...\``.
const findCallEnd = (sourceLines, startLine) => {
  const source = sourceLines.join('\n');
  const lineOffset = sourceLines.slice(0, startLine - 1).join('\n').length + (startLine > 1 ? 1 : 0);
  let cursor = lineOffset + /^\s*(?:it|test)(?:\.\w+)*/.exec(sourceLines[startLine - 1])[0].length;
  let consumed = cursor;
  for (;;) {
    while (/\s/.test(source[cursor] ?? '')) {
      cursor++;
    }
    if (source[cursor] === '(') {
      cursor = skipGroup(source, cursor);
    } else if (source[cursor] === '`') {
      cursor = skipTemplate(source, cursor);
    } else {
      break;
    }
    consumed = cursor;
  }
  return source.slice(0, consumed).split('\n').length;
};

/**
 * Line range of each test, keyed by the line Vitest reports for it (the line holding its title). A range covers the
 * whole call: from `it(` / `test(` (walking up from the title, since `it.each` tables sit between the two) to the
 * closing parenthesis.
 */
export const findTestRanges = (sourceLines, titleLines) => {
  const sorted = [...new Set(titleLines.filter(Boolean))].sort((a, b) => a - b);
  const ranges = new Map();
  sorted.forEach((titleLine, index) => {
    const lowerBound = index === 0 ? 1 : sorted[index - 1] + 1;
    let start = titleLine;
    while (start > lowerBound && !TEST_CALL.test(sourceLines[start - 1])) {
      start--;
    }
    if (!TEST_CALL.test(sourceLines[start - 1] ?? '')) {
      ranges.set(titleLine, { start: titleLine, end: titleLine });
      return;
    }
    ranges.set(titleLine, { start, end: Math.max(findCallEnd(sourceLines, start), titleLine) });
  });
  return ranges;
};

/**
 * Splits the changed lines of a test file between its tests. A line inside a test marks that test as changed; a line
 * outside every test (imports, mocks, hooks, describe blocks) is shared code: every test may be affected. Blank and
 * comment-only lines are ignored.
 */
export const classifyChanges = (sourceLines, tests, changedLines) => {
  const ranges = findTestRanges(
    sourceLines,
    tests.map((test) => test.line)
  );
  const changedTitleLines = new Set();
  let sharedChanged = false;
  for (const line of changedLines) {
    if (isBlankOrComment(sourceLines[line - 1])) {
      continue;
    }
    const owners = [...ranges].filter(([, range]) => line >= range.start && line <= range.end);
    if (owners.length === 0) {
      sharedChanged = true;
    }
    for (const [titleLine] of owners) {
      changedTitleLines.add(titleLine);
    }
  }
  return {
    changedTests: tests.filter((test) => changedTitleLines.has(test.line)),
    sharedChanged,
  };
};

// Titles of the tests whose title line the diff removes and that no longer appear in the file. Best effort: a title
// built at runtime or split over several lines is not seen.
export const findRemovedTitles = (removedLines, currentSource) => {
  const titles = removedLines.flatMap((line) => {
    for (const pattern of TEST_TITLE) {
      const match = pattern.exec(line);
      if (match) {
        return [match[2]];
      }
    }
    return [];
  });
  return [...new Set(titles)].filter(
    (title) => !["'", '"', '`'].some((quote) => (currentSource ?? '').includes(`${quote}${title}${quote}`))
  );
};

const listFailures = (testFiles) =>
  testFiles.flatMap((testFile) => {
    const failures = testFile.tests
      .filter((test) => test.status === 'failed')
      .map((test) => ({ file: testFile.path, name: test.name, message: test.failureMessages.join('\n') }));
    // A file that fails before running any test (import error, failing hook) has no failed test of its own.
    if (testFile.status === 'failed' && failures.length === 0) {
      failures.push({ file: testFile.path, name: 'Test file failed to run', message: testFile.message ?? '' });
    }
    return failures;
  });

const renderFailure = (failure) => {
  const message = stripAnsi(failure.message).trim().split('\n').slice(0, MAX_FAILURE_LINES).join('\n');
  return [
    `<details open><summary>❌ <code>${escapeHtml(failure.file)}</code> › ${escapeHtml(failure.name)}</summary>`,
    '',
    '```',
    message.replace(/```/g, "'''"),
    '```',
    '</details>',
    '',
  ].join('\n');
};

const renderTestFile = (testFile, { changedTests, sharedChanged }) => {
  const changed = new Set(changedTests);
  const failed = testFile.status === 'failed' || testFile.tests.some((test) => test.status === 'failed');
  const renderTest = (test) =>
    `- ${statusIcon(test.status)} ${changed.has(test) ? '✏️ ' : ''}${escapeHtml(test.name)}`;
  // Changed tests come first, with any failing one; the untouched ones are folded away.
  const shown = testFile.tests.filter((test) => changed.has(test) || test.status === 'failed');
  const others = testFile.tests.filter((test) => !shown.includes(test));
  const lines = [
    `<details open><summary>${failed ? '❌' : '✅'} <code>${escapeHtml(testFile.path)}</code> · ${changed.size} changed of ${pluralize(testFile.tests.length, 'test')}${sharedChanged ? ' · ⚠️ shared code changed' : ''}</summary>`,
    '',
  ];
  if (sharedChanged) {
    lines.push(
      '⚠️ Code outside the tests changed (imports, mocks, hooks or describe blocks): every test of this file may be affected.',
      ''
    );
  }
  lines.push(...shown.map(renderTest));
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
  return lines.join('\n');
};

const renderRemoved = (removedTitles, deletedFiles) => {
  const lines = ['#### 🗑️ Tests removed or renamed', ''];
  for (const file of deletedFiles) {
    lines.push(`- <code>${escapeHtml(file)}</code>: test file deleted`);
  }
  for (const [file, titles] of removedTitles) {
    for (const title of titles) {
      lines.push(`- <code>${escapeHtml(file)}</code> › ${escapeHtml(title)}`);
    }
  }
  return [...lines, ''].join('\n');
};

/**
 * Builds the report twice from the same data: the job summary keeps everything, the pull request comment shows at
 * most `maxFailures` failures and stops at a whole block before `maxLength` characters, so the changed tests are not
 * pushed out by a long list of failures and every <details> and code block stays closed.
 */
export const buildReport = ({
  id,
  title,
  testFiles,
  diff,
  readSource,
  maxFailures = Infinity,
  maxLength = Infinity,
}) => {
  const header = `<!-- vitest-report:${id} -->\n### ${title}\n`;
  if (testFiles.length === 0) {
    const body = `${header}\n⚠️ No test report was found: the test shards did not produce any result.\n`;
    return { summary: body, comment: body };
  }

  const { changedLines, removedLines, deletedFiles } = parseDiff(diff);
  const failures = listFailures(testFiles);
  const changedTestFiles = testFiles
    .filter((testFile) => changedLines.has(testFile.path))
    .sort((a, b) => a.path.localeCompare(b.path));
  const fileBlocks = changedTestFiles.map((testFile) => {
    const sourceLines = (readSource(testFile.path) ?? '').split('\n');
    return renderTestFile(
      testFile,
      classifyChanges(sourceLines, testFile.tests, changedLines.get(testFile.path))
    );
  });
  const removedTitles = [...removedLines]
    .filter(([file]) => !deletedFiles.includes(file))
    .map(([file, lines]) => [file, findRemovedTitles(lines, readSource(file))])
    .filter(([, titles]) => titles.length > 0);
  const hasRemoved = removedTitles.length > 0 || deletedFiles.length > 0;

  const assemble = (failureLimit, lengthLimit) => {
    const blocks = [header];
    if (failures.length > 0) {
      blocks.push('#### ❌ Failed tests\n', ...failures.slice(0, failureLimit).map(renderFailure));
      if (failures.length > failureLimit) {
        blocks.push(`_…and ${failures.length - failureLimit} more failed tests, see the job summary._\n`);
      }
    }
    blocks.push('#### 🔍 Tests in the test files this pull request changes\n');
    if (changedTestFiles.length === 0) {
      blocks.push('_This pull request changes no test file here._\n');
    } else {
      blocks.push(
        '_✏️ marks the tests whose own code this pull request adds or changes. ⚠️ flags a file whose code outside the tests changed._\n',
        ...fileBlocks
      );
    }
    if (hasRemoved) {
      blocks.push(renderRemoved(removedTitles, deletedFiles));
    }

    const truncation = '_Report truncated, see the job summary._\n';
    let body = '';
    for (const block of blocks) {
      if (body.length + block.length + 1 + truncation.length > lengthLimit) {
        return `${body}\n${truncation}`;
      }
      body += `${block}\n`;
    }
    return body;
  };

  return {
    summary: assemble(Infinity, Infinity),
    comment: assemble(maxFailures, maxLength),
  };
};
