import { getIntegrationSubTypeMetadata } from '@/components/service/integrations/integration.utils';
import { ShareLinkButton } from '@/components/ui/share-link/share-link-button';
import { ShareableResourceCardVersion } from '@/components/ui/shareable-resource/card-design/shareable-resource-card-version';
import { formatDate } from '@/utils/date';
import { formatPersonNames } from '@/utils/format/name';
import {
  PublicShareableResource,
  ShareableResource,
} from '@/utils/shareable-resources/shareable-resources.types';
import { Avatar } from '@filigran/ui/clients';
import { Badge } from '@filigran/ui/servers';
import { IntegrationTypeEnum } from '@generated/models/IntegrationType.enum';
import { FunctionComponent, ReactNode } from 'react';

interface DisplayFooterCardProps {
  document: ShareableResource | PublicShareableResource;
  publicPath?: boolean;
  shareLinkUrl: string;
  extraContent?: ReactNode;
}
export const ShareableResourceCardFooter: FunctionComponent<
  DisplayFooterCardProps
> = ({ document, publicPath = false, shareLinkUrl, extraContent }) => {
  let connectorMetadata;
  if (
    'integration_type' in document &&
    document.integration_type === IntegrationTypeEnum.CONNECTOR
  ) {
    connectorMetadata = getIntegrationSubTypeMetadata(
      document.integration_subtype
    );
  }
  return (
    <>
      {'integration_type' in document &&
      document.integration_type === IntegrationTypeEnum.CONNECTOR ? (
        <>
          <div className="flex gap-l">
            {connectorMetadata && (
              <Badge
                className="mr-auto"
                variant="outline"
                color={connectorMetadata.color}>
                {connectorMetadata.label}
              </Badge>
            )}
            {publicPath || !document.manager_supported ? (
              <span className="text-sm">{document.product_version}</span>
            ) : (
              <ShareableResourceCardVersion
                className="text-sm"
                product_version={document.product_version ?? ''}
                requiredProductVersion={document.product_version ?? ''}
              />
            )}
          </div>
          <div className=" pr-m">
            <ShareLinkButton
              documentId={document.id}
              url={shareLinkUrl}
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center flex-row gap-s">
            <div className="size-8">
              <Avatar src={document.uploader?.picture ?? ''} />
            </div>
            {formatPersonNames(document.uploader)}
            <div className="text-gray-300 text-sm whitespace-nowrap">
              {formatDate(
                document.updated_at ?? document.created_at,
                'DATE_FULL'
              )}
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
      )}
    </>
  );
};
