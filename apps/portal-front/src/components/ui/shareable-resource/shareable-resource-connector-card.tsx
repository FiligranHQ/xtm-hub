'use client';
import { ShareableResourceConnectorType } from '@/components/service/document/connector/shareable-resource-connector-slug-public';
import { getIntegrationSubTypeMetadata } from '@/components/service/integrations/integration.utils';
import BadgeOverflowCounter, {
  BadgeOverflow,
} from '@/components/ui/badge-overflow-counter';
import { ShareLinkButton } from '@/components/ui/share-link/share-link-button';
import { DisplayVersionCard } from '@/components/ui/shareable-resource/display-version-card';
import { cn } from '@/lib/utils';
import { MotionPlayIcon, VerifiedIcon } from '@filigran/icon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@filigran/ui/clients';
import { Badge } from '@filigran/ui/servers';
import { ServiceDefinitionIdentifier } from '@generated/serviceInstance_fragment.graphql';
import { useTranslations } from 'next-intl';
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
  publicPath?: boolean;
}

const ShareableResourceConnectorCard: FunctionComponent<
  ShareableResourceConnectorCardProps
> = ({
  shareableConnector,
  serviceInstance,
  shareLinkUrl,
  detailUrl,
  requiredProductVersion,
  publicPath = false,
}) => {
  const t = useTranslations();
  const connectorMetadata = getIntegrationSubTypeMetadata(
    shareableConnector.integration_subtype
  );

  return (
    <li className="overflow-hidden border-light flex flex-col relative rounded border bg-page-background hover:bg-hover">
      <Link
        className="flex flex-col h-full"
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
              <h2
                className={cn(
                  'text-base md:text-lg font-semibold leading-tight min-w-0 pr-xxl',
                  shareableConnector.manager_supported && 'pr-[3.25rem]'
                )}>
                {shareableConnector.name}
              </h2>
              <TooltipProvider>
                {shareableConnector.manager_supported && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <MotionPlayIcon className="absolute top-l right-[2.75rem] h-6 w-6 shrink-0 text-green-500" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-50">
                      {t('Utils.AutomaticDeploy')}
                    </TooltipContent>
                  </Tooltip>
                )}
                {shareableConnector.verified && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <VerifiedIcon className="absolute top-l right-l h-6 w-6 shrink-0 text-green-500" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-50">
                      {t('Utils.Verified')}
                    </TooltipContent>
                  </Tooltip>
                )}
              </TooltipProvider>
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
        <div className="flex items-center justify-between mt-auto p-l">
          <div className="flex gap-l">
            {connectorMetadata && (
              <Badge
                className="mr-auto"
                variant="outline"
                color={connectorMetadata.color}>
                {connectorMetadata.label}
              </Badge>
            )}
            {publicPath || !shareableConnector.manager_supported ? (
              <span className="text-sm">
                {shareableConnector.product_version}
              </span>
            ) : (
              <DisplayVersionCard
                className="text-sm"
                product_version={shareableConnector.product_version}
                requiredProductVersion={requiredProductVersion}
              />
            )}
          </div>
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
