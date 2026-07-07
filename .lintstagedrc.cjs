const path = require('path');

const workspaceRoot = process.cwd();
const backendRoot = path.join(workspaceRoot, 'apps/backend');
const frontendRoot = path.join(workspaceRoot, 'apps/frontend');
const e2eRoot = path.join(workspaceRoot, 'apps/e2e');

const toWorkspaceRelative = (workspaceDir, files) =>
  files.map((file) => path.relative(workspaceDir, file));

const quoteFiles = (files) => files.map((f) => JSON.stringify(f)).join(' ');

const buildWorkspaceCommands = (workspaceName, workspaceDir, files) => {
  if (files.length === 0) {
    return [];
  }

  const relativeFiles = toWorkspaceRelative(workspaceDir, files);
  const args = quoteFiles(relativeFiles);

  return [
    `yarn workspace ${workspaceName} eslint --fix ${args}`,
    `yarn workspace ${workspaceName} prettier --write ${args}`,
  ];
};

module.exports = {
  '**/*.{js,jsx,ts,tsx,json}': (files) => {
    const backendFiles = files.filter((file) =>
      file.startsWith(`${backendRoot}${path.sep}`)
    );
    const frontendFiles = files.filter((file) =>
      file.startsWith(`${frontendRoot}${path.sep}`)
    );
    const e2eFiles = files.filter((file) =>
      file.startsWith(`${e2eRoot}${path.sep}`)
    );

    return [
      ...buildWorkspaceCommands('@xtm-hub/backend', backendRoot, backendFiles),
      ...buildWorkspaceCommands('@xtm-hub/frontend', frontendRoot, frontendFiles),
      ...buildWorkspaceCommands('@xtm-hub/test_e2e', e2eRoot, e2eFiles),
    ];
  },
};

