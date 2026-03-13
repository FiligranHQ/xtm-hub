// eslint-disable-next-line @typescript-eslint/no-require-imports
const { defaultGetPropertyMetadata } = require('kanel');

/**
 * Maps "TableName.columnName" to the TypeScript enum type that should replace `string`.
 * The importPath is used as-is in the generated import statement (isAbsolute: true),
 * so it must be relative to the generated file location (src/model/kanel/public/).
 */
const COLUMN_ENUM_MAP = {
  'Competitor.tier': {
    tsType: 'CompetitorTier',
    importPath: '../../../__generated__/resolvers-types',
  },
  'DeploymentRequest.platform_identifier': {
    tsType: 'PlatformIdentifier',
    importPath: '../../../__generated__/resolvers-types',
  },
  'DeploymentRequest.region': {
    tsType: 'DeploymentRequestPlatformRegion',
    importPath: '../../../__generated__/resolvers-types',
  },
  'DeploymentRequest.type': {
    tsType: 'DeploymentRequestDeploymentType',
    importPath: '../../../__generated__/resolvers-types',
  },
  'DeploymentRequest.hub_status': {
    tsType: 'DeploymentRequestHubStatus',
    importPath: '../../../__generated__/resolvers-types',
  },
  'DeploymentRequest.target_state': {
    tsType: 'DeploymentRequestPlatformState',
    importPath: '../../../__generated__/resolvers-types',
    nullable: true,
  },
  'DeploymentRequest.actual_state': {
    tsType: 'DeploymentRequestPlatformState',
    importPath: '../../../__generated__/resolvers-types',
    nullable: true,
  },
  'DeploymentRequest.use_case': {
    tsType: 'DeploymentRequestUseCase',
    importPath: '../../../__generated__/resolvers-types',
    nullable: true,
  },
  'DeploymentRequest.activity_sector': {
    tsType: 'DeploymentRequestActivitySector',
    importPath: '../../../__generated__/resolvers-types',
    nullable: true,
  },
  'DeploymentRequest.job_title': {
    tsType: 'DeploymentRequestJobTitle',
    importPath: '../../../__generated__/resolvers-types',
    nullable: true,
  },
  'DeploymentRequestQuota.platform_identifier': {
    tsType: 'PlatformIdentifier',
    importPath: '../../../__generated__/resolvers-types',
    nullable: true,
  },
  'DeploymentRequestQuota.region': {
    tsType: 'DeploymentRequestPlatformRegion',
    importPath: '../../../__generated__/resolvers-types',
    nullable: true,
  },
};

/** @type {import('kanel').Config} */
module.exports = {
  connection: {
    'host': '127.0.0.1',
    'port': 5434,
    'user': 'portal',
    'password': 'portal-password',
    'database': 'cloud-portal',
  },

  preDeleteOutputFolder: true,
  outputPath: './src/model/kanel',
  schemas: ['public'],

  customTypeMap: {
    'pg_catalog.tsvector': 'string',
    'pg_catalog.bpchar': 'string',
  },

  getPropertyMetadata(property, details, generateFor, config) {
    const mapping = COLUMN_ENUM_MAP[`${details.name}.${property.name}`];
    if (mapping) {
      return {
        name: property.name,
        typeOverride: {
          name: mapping.tsType,
          typeImports: [{
            name: mapping.tsType,
            isDefault: false,
            path: mapping.importPath,
            isAbsolute: true,
            importAsType: true,
          }],
        },
      };
    }
    return defaultGetPropertyMetadata(property, details, generateFor, config);
  },
};
