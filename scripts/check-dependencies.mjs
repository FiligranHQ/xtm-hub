import fs from 'node:fs';
import path from 'node:path';

const workspaceFiles = [
  'apps/backend/package.json',
  'apps/frontend/package.json',
  'apps/e2e/package.json',
];

const readJson = (relativePath) => {
  const absolutePath = path.resolve(process.cwd(), relativePath);
  const content = fs.readFileSync(absolutePath, 'utf8');
  return JSON.parse(content);
};

const collectDependencies = (pkgJson) => ({
  // Explicitly check both runtime and dev dependencies.
  ...(pkgJson.dependencies ?? {}),
  ...(pkgJson.devDependencies ?? {}),
});

const workspaces = workspaceFiles.map((file) => ({
  file,
  dependencies: collectDependencies(readJson(file)),
}));

const allNames = new Set(
  workspaces.flatMap((workspace) => Object.keys(workspace.dependencies))
);

const sharedInAtLeastTwo = [...allNames].filter((name) => {
  const workspaceCount = workspaces.filter(
    (workspace) => name in workspace.dependencies
  ).length;

  return workspaceCount >= 2;
});

const mismatches = sharedInAtLeastTwo
  .map((name) => ({
    name,
    versions: workspaces
      .filter((workspace) => name in workspace.dependencies)
      .map((workspace) => ({
        file: workspace.file,
        version: workspace.dependencies[name],
      })),
  }))
  .filter((entry) =>
    entry.versions.some((versionInfo) => versionInfo.version !== 'catalog:')
  );

if (mismatches.length === 0) {
  console.log(
    `check:dependencies passed (${sharedInAtLeastTwo.length} dependencies/devDependencies shared by at least 2 workspaces are aligned to catalog:`
  );
  process.exit(0);
}

console.error(
  'check:dependencies failed. Dependencies/devDependencies shared by at least 2 workspaces are not aligned to catalog:'
);
for (const mismatch of mismatches) {
  console.error(`\n- ${mismatch.name}`);
  for (const versionInfo of mismatch.versions) {
    console.error(`  ${versionInfo.file}: ${versionInfo.version}`);
  }
}

process.exit(1);
