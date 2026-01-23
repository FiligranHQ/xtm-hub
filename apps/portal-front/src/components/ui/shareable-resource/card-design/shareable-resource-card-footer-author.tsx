import { getIntegrationSubTypeMetadata } from '@/components/service/integrations/integration.utils';
import { ShareLinkButton } from '@/components/ui/share-link/share-link-button';
import { formatDate } from '@/utils/date';
import { formatPersonNames } from '@/utils/format/name';
import {
  PublicShareableResource,
  ShareableResource,
} from '@/utils/shareable-resources/shareable-resources.types';
import { docHasMetadata } from '@/utils/shareable-resources/utils/shareable-resources.client.utils';
import { Avatar } from '@filigran/ui/clients';
import { Badge } from '@filigran/ui/servers';
import { FunctionComponent, ReactNode } from 'react';

interface ShareableResourceCardFooterAuthorProps {
  document: ShareableResource | PublicShareableResource;
  shareLinkUrl: string;
  extraContent?: ReactNode;
}
export const ShareableResourceCardFooterAuthor: FunctionComponent<
  ShareableResourceCardFooterAuthorProps
> = ({ document, shareLinkUrl, extraContent }) => {
  let documentMetadata;
  if (docHasMetadata(document, 'integration_subtype')) {
    documentMetadata = getIntegrationSubTypeMetadata(
      document.integration_subtype
    );
  }
  return (
    <>
      <div className="flex items-center flex-row gap-s">
        {documentMetadata && (
          <Badge
            className="mr-auto"
            variant="outline"
            color={documentMetadata.color}>
            {documentMetadata.label}
          </Badge>
        )}
        <div className="size-8">
          <Avatar src={document.uploader?.picture ?? ''} />
        </div>
        {formatPersonNames(document.uploader)}
        <div className="text-gray-300 text-sm whitespace-nowrap">
          {formatDate(document.updated_at ?? document.created_at, 'DATE_FULL')}
        </div>
      </div>
      <div className="flex flex-row pr-m">
        <ShareLinkButton
          documentId={document.id}
          url={shareLinkUrl}
        />
        {extraContent}
      </div>
    </>
  );
};
