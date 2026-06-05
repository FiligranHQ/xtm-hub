'use server';

import { serverMutateGraphQL } from '@/relay/server-portal-api-fetch';
import ShareLinkButtonMutation, {
  ShareLinkButtonMutation$variables,
  ShareLinkButtonMutation as shareLinkButtonMutationType,
} from '@generated/ShareLinkButtonMutation.graphql';

export async function updateShareNumber({
  variables,
}: {
  variables: ShareLinkButtonMutation$variables;
}) {
  await serverMutateGraphQL<shareLinkButtonMutationType>(
    ShareLinkButtonMutation,
    {
      documentId: variables.documentId,
    }
  );
}
