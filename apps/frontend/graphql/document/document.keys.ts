import {
  useMostDeployedDocumentsQueryQuery,
  useUndeployedResourceTypesByProductQuery,
} from '@graphql/generated';

export const homepageDocumentKeys = {
  mostDeployed: useMostDeployedDocumentsQueryQuery.getRootKey,
  undeployedResourceTypesByProduct:
    useUndeployedResourceTypesByProductQuery.getRootKey,
};
