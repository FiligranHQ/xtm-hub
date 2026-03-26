import { getIntegrationSubTypeMetadata } from '@/components/service/integrations/integration.utils';
import { ShareLinkButton } from '@/components/ui/share-link/share-link-button';
import { formatPersonNames } from '@/utils/format/name';
import { docHasMetadata } from '@/utils/shareable-resources/utils/shareable-resources.client.utils';
import { Avatar } from '@filigran/ui/clients';
import { Badge } from '@filigran/ui/servers';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { DocumentMetadataKeyCodeEnum } from '@generated/models/DocumentMetadataKeyCode.enum';
import { publicDocumentItemFragment$data } from '@generated/publicDocumentItemFragment.graphql';
import { FunctionComponent, ReactNode } from 'react';

interface ShareableResourceCardFooterAuthorProps {
  document: documentItem_fragment$data | publicDocumentItemFragment$data;
  shareLinkUrl: string;
  shouldDisplayAuthor?: boolean;
  extraContent?: ReactNode;
}
export const ShareableResourceCardFooterAuthor: FunctionComponent<
  ShareableResourceCardFooterAuthorProps
> = ({ document, shareLinkUrl, shouldDisplayAuthor = true, extraContent }) => {
  let documentMetadata;
  if (
    docHasMetadata(document, DocumentMetadataKeyCodeEnum.INTEGRATION_SUBTYPE)
  ) {
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
            <div className="size-8 shrink-0">
              <Avatar src={document.uploader?.picture ?? ''} />
            </div>
            <span className="truncate max-w-[220px]">
              {formatPersonNames(document.uploader)}
            </span>
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
