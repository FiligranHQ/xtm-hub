import { ShareLinkButton } from '@/components/ui/share-link/ShareLinkButton';
import { ShareableResourceCardVersion } from '@/components/ui/shareable-resource/card-design/ShareableResourceCardVersion';
import { PublicDocumentData } from '@/utils/shareable-resources/shareable-resources.types';
import { docHasMetadata } from '@/utils/shareable-resources/utils/shareable-resources.client.utils';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { DocumentMetadataKeyCode } from '@graphql/generated';
import { ReactNode } from 'react';

interface ShareableResourceCardFooterVersionProps {
  document: documentItem_fragment$data | PublicDocumentData;
  publicPath?: boolean;
  shareLinkUrl: string;
  extraContent?: ReactNode;
}
export const ShareableResourceCardFooterVersion = ({
  document,
  publicPath = false,
  shareLinkUrl,
  extraContent,
}: ShareableResourceCardFooterVersionProps) => {
  return (
    <>
      <div className="flex gap-l min-w-0 overflow-hidden">
        {publicPath ||
        (docHasMetadata(document, DocumentMetadataKeyCode.ManagerSupported) &&
          !document.manager_supported) ? (
          <span className="text-sm">
            {docHasMetadata(document, DocumentMetadataKeyCode.ProductVersion) &&
              document.product_version}
          </span>
        ) : (
          <ShareableResourceCardVersion
            className="text-sm"
            product_version={
              docHasMetadata(document, DocumentMetadataKeyCode.ProductVersion)
                ? document.product_version
                : ''
            }
            requiredProductVersion={
              docHasMetadata(document, DocumentMetadataKeyCode.ProductVersion)
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
