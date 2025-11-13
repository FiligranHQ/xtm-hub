'use client';
import { getIngestionConnectorMetadata } from '@/components/connectors/connector.utils';
import { ShareableResourceConnectorType } from '@/components/service/document/connector/shareable-resource-connector-slug-public';
import BadgeOverflowCounter, {
  BadgeOverflow,
} from '@/components/ui/badge-overflow-counter';
import { ShareLinkButton } from '@/components/ui/share-link/share-link-button';
import { ServiceDefinitionIdentifier } from '@generated/serviceInstance_fragment.graphql';
import { VerifiedIcon } from 'filigran-icon';
import { Badge } from 'filigran-ui/servers';
import Image from 'next/image';
import Link from 'next/link';
import { FunctionComponent } from 'react';

export interface ShareableServiceInstance {
  id: string;
  service_definition?: {
    identifier: ServiceDefinitionIdentifier;
  } | null;
}

export interface ShareableResourceConnectorCardProps {
  shareableConnector: ShareableResourceConnectorType;
  shareLinkUrl: string;
  serviceInstance: ShareableServiceInstance;
  detailUrl: string;
  requiredProductVersion?: string;
  isConnectorCompatible?: boolean;
}

const ShareableResourceConnectorCard: FunctionComponent<
  ShareableResourceConnectorCardProps
> = ({
  shareableConnector,
  serviceInstance,
  shareLinkUrl,
  detailUrl,
  isConnectorCompatible = true,
}) => {
  const connectorMetadata = getIngestionConnectorMetadata(
    shareableConnector.integration_subtype
  );

  return (
    <li className="overflow-hidden border-light flex flex-col relative rounded border bg-page-background hover:bg-hover">
      <Link
        aria-disabled={!isConnectorCompatible}
        className="flex flex-col h-full aria-disabled:opacity-60 aria-disabled:after:hidden"
        href={detailUrl}>
        <div className="flex items-stretch gap-l p-l relative">
          <div className="w-24 self-stretch flex">
            <Image
              src={`/document/images/${serviceInstance.id}/${shareableConnector.children_documents?.[0]?.id}`}
              alt={`${shareableConnector.name} logo`}
              width={96}
              height={96}
              style={{ minHeight: '96px' }}
              loading="lazy"
              className="rounded object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-lg font-semibold leading-tight min-w-0 pr-xxl">
                {shareableConnector.name}
              </h2>
              {shareableConnector.verified && (
                <VerifiedIcon className="absolute top-l right-l h-6 w-6 shrink-0 text-green-500" />
              )}
            </div>
            <div className="mt-s flex flex-wrap gap-s mb-xs">
              <BadgeOverflowCounter
                badges={shareableConnector.labels as BadgeOverflow[]}
                className="z-[2]"
              />
            </div>
          </div>
        </div>
        <p className="p-l text-gray-300 text-sm">
          {shareableConnector.short_description}
        </p>
        <div className="flex items-center justify-end mt-auto p-l">
          {connectorMetadata && (
            <Badge
              className="mr-auto"
              variant="outline"
              color={connectorMetadata.color}>
              {connectorMetadata.label}
            </Badge>
          )}
          <ShareLinkButton
            documentId={shareableConnector.id}
            url={shareLinkUrl}
          />
        </div>
      </Link>
    </li>
  );
};

export default ShareableResourceConnectorCard;
