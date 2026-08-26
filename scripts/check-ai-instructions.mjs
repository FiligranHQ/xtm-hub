// Mechanical, objective checks for the AI instruction surface: `.github/copilot-instructions.md`,
// `.github/instructions/*.md`, `.github/prompts/*.md`, `.github/agents/*.agent.md`,
// `.github/skills/*/SKILL.md` and `AGENTS.md`.
//
// This only catches what can be verified against the filesystem: broken frontmatter, `applyTo`
// globs that match nothing, and `yarn <script>` references that don't exist in any package.json.
// It cannot judge whether prose *describes the code correctly* — that needs a human or an agent
// reading both sides. See `.github/prompts/review-instructions.prompt.md` for that half of the
// review, which asks a question instead of guessing when something looks wrong.
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();
const errors = [];
const warnings = [];

const readFile = (relativePath) =>
  fs.readFileSync(path.resolve(repoRoot, relativePath), 'utf8');

const exists = (relativePath) =>
  fs.existsSync(path.resolve(repoRoot, relativePath));

const listMarkdownFiles = (dir) =>
  fs.existsSync(path.resolve(repoRoot, dir))
    ? fs
        .readdirSync(path.resolve(repoRoot, dir))
        .filter((file) => file.endsWith('.md'))
        .map((file) => path.join(dir, file))
    : [];

// A tiny glob matcher: only supports the subset actually used in `applyTo:` frontmatter
// (`**`, `*`, literal path segments, comma-separated alternatives). Good enough to catch a glob
// that matches zero files after a rename/move; not a general-purpose glob engine.
const globToRegExp = (glob) => {
  const escaped = glob
    .split('')
    .map((char) => (/[.+^${}()|[\]\\]/.test(char) ? `\\${char}` : char))
    .join('');
  const pattern = escaped
    .replace(/\*\*/g, '§DOUBLESTAR§')
    .replace(/\*/g, '[^/]*')
    .replace(/§DOUBLESTAR§/g, '.*');
  return new RegExp(`^${pattern}$`);
};

const walkFiles = (dir, out = []) => {
  const absoluteDir = path.resolve(repoRoot, dir);
  if (!fs.existsSync(absoluteDir)) return out;
  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue;
    const entryRelative = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(entryRelative, out);
    } else {
      out.push(entryRelative);
    }
  }
  return out;
};

let allRepoFilesCache = null;
const allRepoFiles = () => {
  if (!allRepoFilesCache) {
    allRepoFilesCache = walkFiles('.');
  }
  return allRepoFilesCache;
};

const checkFrontmatter = (file, content) => {
  if (!content.startsWith('---\n')) {
    errors.push(`${file}: missing frontmatter (must start with "---")`);
    return null;
  }
  const end = content.indexOf('\n---', 4);
  if (end === -1) {
    errors.push(`${file}: frontmatter opened but never closed with "---"`);
    return null;
  }
  return content.slice(4, end);
};

const checkApplyToCoverage = (file, frontmatter) => {
  const match = frontmatter.match(/applyTo:\s*'([^']*)'/);
  if (!match) {
    errors.push(`${file}: no applyTo: '...' field found in frontmatter`);
    return;
  }
  const globs = match[1].split(',').map((glob) => glob.trim());
  const files = allRepoFiles().map((filePath) => filePath.replace(/\\/g, '/'));
  for (const glob of globs) {
    const regExp = globToRegExp(glob);
    const matched = files.some((filePath) => regExp.test(filePath));
    if (!matched) {
      warnings.push(
        `${file}: applyTo glob "${glob}" matches zero files in the repo — dead scope or a stale glob after a rename`
      );
    }
  }
};

const checkPromptFrontmatter = (file, frontmatter) => {
  if (!/mode:\s*agent/.test(frontmatter)) {
    warnings.push(`${file}: expected "mode: agent" in frontmatter`);
  }
  if (!/description:/.test(frontmatter)) {
    errors.push(`${file}: missing description: in frontmatter`);
  }
};

// package.json scripts and dependency (bin) names, keyed by the workspace name used in
// `yarn workspace @xtm-hub/<name> ...`. A call is valid if its first token is either a declared
// script or a dependency name — `yarn workspace @xtm-hub/frontend next typegen` invokes the `next`
// binary directly, it isn't a package.json script.
const readPackageJson = (relativePath) => JSON.parse(readFile(relativePath));

const workspacePackages = {
  root: readPackageJson('package.json'),
  '@xtm-hub/backend': readPackageJson('apps/backend/package.json'),
  '@xtm-hub/frontend': readPackageJson('apps/frontend/package.json'),
  '@xtm-hub/test_e2e': readPackageJson('apps/e2e/package.json'),
};

const workspaceCallableNames = Object.fromEntries(
  Object.entries(workspacePackages).map(([workspace, pkg]) => [
    workspace,
    new Set([
      ...Object.keys(pkg.scripts ?? {}),
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.devDependencies ?? {}),
    ]),
  ])
);

const checkYarnScriptReferences = (file, content) => {
  const workspaceCallPattern =
    /yarn workspace\s+(@xtm-hub\/[a-z_]+)\s+([a-zA-Z0-9:_-]+)/g;
  for (const match of content.matchAll(workspaceCallPattern)) {
    const [, workspace, firstToken] = match;
    const callable = workspaceCallableNames[workspace];
    if (!callable) {
      errors.push(`${file}: references unknown workspace "${workspace}"`);
    } else if (!callable.has(firstToken)) {
      errors.push(
        `${file}: references "yarn workspace ${workspace} ${firstToken}", but that is neither a script nor a dependency (bin) in that workspace's package.json`
      );
    }
  }

  const bareCallPattern = /`yarn ([a-zA-Z0-9:_-]+)`/g;
  for (const match of content.matchAll(bareCallPattern)) {
    const [, script] = match;
    const knownEverywhere = Object.values(workspaceCallableNames).some(
      (callable) => callable.has(script)
    );
    if (!knownEverywhere) {
      warnings.push(
        `${file}: references \`yarn ${script}\` but no workspace declares that script or dependency — confirm it still exists`
      );
    }
  }
};

// Backtick-quoted, path-shaped references, e.g. `apps/backend/src/config.ts` or `.github/LABELS.md`.
// Instructions files often write paths relative to the app they document (e.g.
// `backend.instructions.md` writes `src/config.ts` meaning `apps/backend/src/config.ts`), so try a
// handful of base directories before flagging a path as broken.
const pathResolutionBases = ['', 'apps/backend/', 'apps/frontend/', 'apps/e2e/'];

const checkPathReferences = (file, content) => {
  const pathPattern =
    /`((?:apps|\.github|src|config)\/[a-zA-Z0-9._/-]+|\.[a-zA-Z]+\/[a-zA-Z0-9._/-]+|[A-Z][A-Za-z0-9_-]*\.md)`/g;
  for (const match of content.matchAll(pathPattern)) {
    const referenced = match[1].replace(/\/$/, '');
    if (referenced.includes('*')) continue; // glob-shaped, not a literal path
    const resolvable = pathResolutionBases.some((base) =>
      exists(path.join(base, referenced))
    );
    if (!resolvable) {
      warnings.push(
        `${file}: references path \`${referenced}\`, which does not exist under the repo root or any app directory — confirm it wasn't renamed or removed`
      );
    }
  }
};

const listSkillFiles = (dir) => {
  const base = path.resolve(repoRoot, dir);
  if (!fs.existsSync(base)) return [];
  return fs
    .readdirSync(base, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(dir, entry.name, 'SKILL.md'))
    .filter(exists);
};

const instructionFiles = listMarkdownFiles('.github/instructions');
const promptFiles = listMarkdownFiles('.github/prompts');
const agentFiles = fs
  .readdirSync(path.resolve(repoRoot, '.github/agents'))
  .filter((file) => file.endsWith('.agent.md'))
  .map((file) => path.join('.github/agents', file));
const skillFiles = listSkillFiles('.github/skills');
const otherFiles = ['.github/copilot-instructions.md', 'AGENTS.md'].filter(
  exists
);

for (const file of instructionFiles) {
  const content = readFile(file);
  const frontmatter = checkFrontmatter(file, content);
  if (frontmatter) checkApplyToCoverage(file, frontmatter);
  checkYarnScriptReferences(file, content);
  checkPathReferences(file, content);
}

for (const file of promptFiles) {
  const content = readFile(file);
  const frontmatter = checkFrontmatter(file, content);
  if (frontmatter) checkPromptFrontmatter(file, frontmatter);
  checkYarnScriptReferences(file, content);
  checkPathReferences(file, content);
}

for (const file of [...agentFiles, ...skillFiles, ...otherFiles]) {
  const content = readFile(file);
  checkYarnScriptReferences(file, content);
  checkPathReferences(file, content);
}

const totalFiles =
  instructionFiles.length +
  promptFiles.length +
  agentFiles.length +
  skillFiles.length +
  otherFiles.length;

if (warnings.length > 0) {
  console.warn(
    `check:ai-instructions found ${warnings.length} warning(s) across ${totalFiles} file(s):`
  );
  for (const warning of warnings) console.warn(`  - ${warning}`);
}

if (errors.length > 0) {
  console.error(
    `\ncheck:ai-instructions found ${errors.length} error(s) across ${totalFiles} file(s):`
  );
  for (const error of errors) console.error(`  - ${error}`);
  console.error(
    '\nThese are objective breakages (broken command/path references) — fix them directly.'
  );
  process.exit(1);
}

console.log(
  `check:ai-instructions passed (${totalFiles} file(s) checked, ${warnings.length} warning(s)). ` +
    'This only covers mechanical breakage — run the "Review AI instructions" prompt for a semantic pass ' +
    'against the actual codebase.'
);
process.exit(0);
