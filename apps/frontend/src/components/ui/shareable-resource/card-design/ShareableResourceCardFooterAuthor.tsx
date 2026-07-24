import { getIntegrationSubTypeMetadata } from '@/components/service/integrations/Integration.utils';
import { UserDisplay } from '@/components/ui/UserDisplay';
import { ShareLinkButton } from '@/components/ui/share-link/ShareLinkButton';
import { PublicDocumentData } from '@/utils/shareable-resources/shareable-resources.types';
import { docHasMetadata } from '@/utils/shareable-resources/utils/shareable-resources.client.utils';
import { Badge } from '@filigran/ui/servers';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { DocumentMetadataKeyCode } from '@graphql/generated';
import { ReactNode } from 'react';

interface ShareableResourceCardFooterAuthorProps {
  document: documentItem_fragment$data | PublicDocumentData;
  shareLinkUrl: string;
  shouldDisplayAuthor?: boolean;
  extraContent?: ReactNode;
}
export const ShareableResourceCardFooterAuthor = ({
  document,
  shareLinkUrl,
  shouldDisplayAuthor = true,
  extraContent,
}: ShareableResourceCardFooterAuthorProps) => {
  let documentMetadata;
  if (docHasMetadata(document, DocumentMetadataKeyCode.IntegrationSubtype)) {
    documentMetadata = getIntegrationSubTypeMetadata(
      document.integration_subtype
    );
  }
  return (
    <>
      <div className="flex flex-wrap items-center flex-row gap-s">
        {documentMetadata && (
          <Badge
            className="mr-auto"
            variant="outline"
            color={documentMetadata.color}>
            {documentMetadata.label}
          </Badge>
        )}
        {shouldDisplayAuthor && (
          <div className="flex items-center gap-s whitespace-nowrap">
            <UserDisplay uploader={document.uploader} />
          </div>
        )}
      </div>
      <div className="flex flex-row self-end pr-m">
        <ShareLinkButton
          documentId={document.id}
          url={shareLinkUrl}
        />
        {extraContent}
      </div>
    </>
  );
};
