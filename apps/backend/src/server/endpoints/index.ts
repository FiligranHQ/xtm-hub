import { Express } from 'express';
import { FeatureFlag } from '../../__generated__/resolvers-types';
import { isFeatureEnabled } from '../../utils/feature-flag.util';
import { documentDownloadEndpoint } from './document/document-download-endpoint';
import { documentVisualizeEndpoint } from './document/document-visualize-endpoint';
import { healthEndpoint } from './health/health-endpoint';
import { integrationCsvExportEndpoint } from './integration-csv-export/integration-csv-export-endpoint';
import { manifestEndpoint } from './manifest/manifest-endpoint';
import { productVersionEndpoint } from './product-version/product-version-endpoint';
import { userPictureEndpoint } from './user-picture/user-picture-endpoint';
import { verificationEmailEndpoint } from './verification-email/verification-email-endpoint';
import { versionsMatrixEndpoint } from './versions-matrix/versions-matrix-endpoint';

// Single wiring point for every REST endpoint — add new ones here.
export const registerEndpoints = (app: Express) => {
  healthEndpoint(app);
  userPictureEndpoint(app);
  if (isFeatureEnabled(FeatureFlag.DecouplingConnectors)) {
    manifestEndpoint(app);
    versionsMatrixEndpoint(app);
  }
  productVersionEndpoint(app);
  // Implemented as routes, not GraphQL resolvers: a resolver can't attach a file to the response.
  documentDownloadEndpoint(app);
  documentVisualizeEndpoint(app);
  integrationCsvExportEndpoint(app);
  verificationEmailEndpoint(app);
};
