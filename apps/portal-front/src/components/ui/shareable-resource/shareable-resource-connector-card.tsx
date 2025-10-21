'use client';
import {
  IngestionConnectorType,
  ingestionConnectorTypeMetadata,
} from '@/components/connectors/connector.utils';
import { connectorsItem } from '@/components/service/integration-feeds/integration-feed.graphql';
import BadgeOverflowCounter, {
  BadgeOverflow,
} from '@/components/ui/badge-overflow-counter';
import { ShareLinkButton } from '@/components/ui/share-link/share-link-button';
import {
  APP_PATH,
  PUBLIC_CYBERSECURITY_SOLUTIONS_PATH,
} from '@/utils/path/constant';
import { integrationFeedConnectorsItem_fragment$key } from '@generated/integrationFeedConnectorsItem_fragment.graphql';
import { integrationFeedsItem_fragment$data } from '@generated/integrationFeedsItem_fragment.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { VerifiedIcon } from 'filigran-icon';
import { Badge } from 'filigran-ui/servers';
import Image from 'next/image';
import Link from 'next/link';
import { FunctionComponent } from 'react';
import { useFragment } from 'react-relay';

interface ShareableResourceConnectorCard {
  integrationFeed: integrationFeedsItem_fragment$data;
  serviceInstance: serviceInstance_fragment$data;
}

const ShareableResourceConnectorCard: FunctionComponent<
  ShareableResourceConnectorCard
> = ({ integrationFeed, serviceInstance }) => {
  const connector = useFragment<integrationFeedConnectorsItem_fragment$key>(
    connectorsItem,
    integrationFeed
  );

  const connectorMetadata =
    ingestionConnectorTypeMetadata[
      connector.integration_subtype as IngestionConnectorType
    ];

  return (
    <li className="overflow-hidden border-light flex flex-col relative rounded border bg-page-background hover:bg-hover">
      <Link
        className="flex flex-col h-full"
        href={`/${APP_PATH}/service/${serviceInstance.service_definition?.identifier}/${serviceInstance.id}/${integrationFeed.id}`}>
        <div className="flex items-stretch gap-l p-l relative">
          <div className="w-24 self-stretch flex">
            <Image
              src={`/document/images/${serviceInstance.id}/${integrationFeed.children_documents?.[0]?.id}`}
              alt={`${integrationFeed.name} logo`}
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
                {integrationFeed.name}
              </h2>
              {connector.verified && (
                <VerifiedIcon className="absolute top-l right-l h-6 w-6 shrink-0 text-green-500" />
              )}
            </div>
            <div className="mt-s flex flex-wrap gap-s mb-xs">
              <BadgeOverflowCounter
                badges={integrationFeed.labels as BadgeOverflow[]}
                className="z-[2]"
              />
            </div>
          </div>
        </div>
        <p className="p-l text-gray-300 text-sm">
          {integrationFeed.short_description}
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
            documentId={integrationFeed.slug}
            url={`${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/opencti-connectors/${integrationFeed?.slug}`}
          />
        </div>
      </Link>
    </li>
  );
};

export default ShareableResourceConnectorCard;
