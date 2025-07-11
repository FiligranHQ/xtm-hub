'use server';

import { serverMutateGraphQL } from '@/relay/serverPortalApiFetch';
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
    documentId: variables.documentId,
  });
}
