import { getIntegrationSubTypeMetadata } from '@/components/service/integrations/integration.utils';
import { ShareLinkButton } from '@/components/ui/share-link/share-link-button';
import { ShareableResourceCardVersion } from '@/components/ui/shareable-resource/card-design/shareable-resource-card-version';
import { docHasMetadata } from '@/utils/shareable-resources/utils/shareable-resources.client.utils';
import { Badge } from '@filigran/ui/servers';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { DocumentMetadataKeyCodeEnum } from '@generated/models/DocumentMetadataKeyCode.enum';
import { publicDocumentItemFragment$data } from '@generated/publicDocumentItemFragment.graphql';
import { FunctionComponent, ReactNode } from 'react';

interface ShareableResourceCardFooterVersionProps {
  document: documentItem_fragment$data | publicDocumentItemFragment$data;
  publicPath?: boolean;
  shareLinkUrl: string;
  extraContent?: ReactNode;
}
export const ShareableResourceCardFooterVersion: FunctionComponent<
  ShareableResourceCardFooterVersionProps
> = ({ document, publicPath = false, shareLinkUrl, extraContent }) => {
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
      <div className="flex gap-l min-w-0 overflow-hidden">
        {documentMetadata && (
          <Badge
            className="min-w-0 max-w-full"
            variant="outline"
            color={documentMetadata.color}>
            <span className="truncate">{documentMetadata.label}</span>
          </Badge>
        )}
        {publicPath ||
        (docHasMetadata(document, 'manager_supported') &&
          !document.manager_supported) ? (
          <span className="text-sm">
            {docHasMetadata(document, 'product_version') &&
              document.product_version}
          </span>
        ) : (
          <ShareableResourceCardVersion
            className="text-sm"
            product_version={
              docHasMetadata(document, 'product_version')
                ? document.product_version
                : ''
            }
            requiredProductVersion={
              docHasMetadata(document, 'product_version')
                ? document.product_version
                : ''
            }
          />
        )}
      </div>
      <div className=" flex flex-row pr-m">
        <ShareLinkButton
          documentId={document.id}
          url={shareLinkUrl}
        />
        {extraContent}
      </div>
    </>
  );
};
