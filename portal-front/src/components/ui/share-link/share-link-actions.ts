'use server';

import { serverMutateGraphQL } from '@/relay/serverPortalApiFetch';
import { toGlobalId } from '@/utils/globalId';
import ShareLinkButtonMutation, {
  shareLinkButtonMutation,
  shareLinkButtonMutation$variables,
} from '@generated/shareLinkButtonMutation.graphql';

export async function updateShareNumber({
  variables,
}: {
  variables: shareLinkButtonMutation$variables;
}) {
  await serverMutateGraphQL<shareLinkButtonMutation>(ShareLinkButtonMutation, {
    documentId: toGlobalId('Document', variables.documentId),
  });
}
