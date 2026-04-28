'use server';

import ShareLinkButtonMutation, {
  ShareLinkButtonMutation$variables,
  ShareLinkButtonMutation as shareLinkButtonMutationType,
} from '@generated/ShareLinkButtonMutation.graphql';
import { serverMutateGraphQL } from '../../../relay/server-portal-api-fetch';

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
