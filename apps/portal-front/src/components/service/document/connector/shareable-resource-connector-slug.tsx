'use client';
import * as React from 'react';

import {
  BreadcrumbNav,
  BreadcrumbNavLink,
} from '@/components/ui/breadcrumb-nav';
import { useTranslations } from 'next-intl';

import { PlatformMetadataMapping } from '@/components/registration/platform-identifier-mapping';
import { ServiceManageSheet } from '@/components/service/components/service-manage-sheet';
import { ShareableResourceConnectorPrivateDetails } from '@/components/service/document/connector/shareable-resource-connector-private-details';
import OneClickDeploy from '@/components/service/document/one-click-deploy/one-click-deploy';
import ShareableResourceDescription from '@/components/service/document/shareable-resource-description';
import BadgeOverflowCounter, {
  BadgeOverflow,
} from '@/components/ui/badge-overflow-counter';
import { ShareLinkButton } from '@/components/ui/share-link/share-link-button';
import { getPlatformIdentifier } from '@/utils/platform';
import { InfoIcon, MotionPlayIcon, VerifiedIcon } from '@filigran/icon';
import { SimpleTooltip } from '@filigran/ui';
import { Button } from '@filigran/ui/servers';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import Image from 'next/image';
import Link from 'next/link';

// Component interface
interface ShareableResourceConnectorSlugProps {
  documentData: documentItem_fragment$data;
  breadcrumbValue: BreadcrumbNavLink[];
  shareUrl: string;
  logo?: string;
}

// Component
const ShareableResourceConnectorSlug: React.FunctionComponent<
  ShareableResourceConnectorSlugProps
> = ({ documentData, breadcrumbValue, shareUrl, logo }) => {
  const t = useTranslations();
  const platformIdentifier = getPlatformIdentifier(documentData.type);
  const canClickOnDeployButton = documentData.manager_supported;

  const manifest_url = documentData.source_code
    ? `${documentData.source_code}/__metadata__/connector_manifest.json`
    : '';
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <div className="flex gap-s flex-col md:flex-row">
        {!!logo && (
          <div className="w-24 flex-shrink-0 rounded overflow-hidden">
            <Image
              src={logo}
              width={96}
              height={96}
              loading="lazy"
              alt={`${documentData.name} logo`}
              className="w-full h-full object-contain rounded"
            />
          </div>
        )}
        <div className="flex flex-col flex-1 justify-center">
          <div className="flex items-center gap-s flex-wrap">
            <h1 className="whitespace-nowrap">{documentData.name}</h1>
            {documentData.manager_supported && (
              <div className="flex items-center gap-s py-xs px-l font-semibold bg-green-100  text-green-500 dark:bg-turquoise-900 rounded-lg">
                <MotionPlayIcon className="h-5 w-5 shrink-0 mr-xs" />
                {t('Utils.AutomaticDeploy')}
              </div>
            )}
            {documentData.verified && (
              <div className="flex items-center gap-s py-xs px-l font-semibold bg-green-100  text-green-500 dark:bg-turquoise-900 rounded-lg">
                <VerifiedIcon className="h-5 w-5 shrink-0 mr-xs" />
                {t('Utils.Verified')}
              </div>
            )}
            <div className="ml-auto flex gap-s">
              <ShareLinkButton
                documentId={documentData.id}
                url={shareUrl}
              />
              <ServiceManageSheet
                document={documentData}
                variant={'button'}
              />
              {canClickOnDeployButton ? (
                <OneClickDeploy
                  documentData={documentData}
                  requiredProductVersion={documentData.product_version}
                />
              ) : (
                <SimpleTooltip
                  title={t('Service.Connectors.UnavailableDeployments')}>
                  <Button disabled={true}>
                    {t('Service.ShareableResources.Deploy.DeployPlatform', {
                      platformName:
                        PlatformMetadataMapping[platformIdentifier].name ??
                        'OpenCTI',
                    })}
                  </Button>
                </SimpleTooltip>
              )}
            </div>
          </div>
          <div className="w-full mt-s mb-xs">
            <BadgeOverflowCounter
              badges={documentData.use_cases as BadgeOverflow[]}
            />
          </div>
        </div>
      </div>
      {documentData.verified && (
        <div className="border border-solid border-blue rounded flex items-center gap-xs p-s text-sm mt-4">
          <InfoIcon className="shrink-0 h-4 w-4 mr-xs text-blue" />
          If you would like to improve this integration, please take a look at
          <Link
            href={manifest_url}
            target="_blank"
            className="underline">
            the github repository link here
          </Link>
        </div>
      )}
      <div className="flex flex-col-reverse lg:flex-row w-full mt-l gap-xl">
        <ShareableResourceDescription
          shortDescription={documentData?.short_description ?? ''}
          longDescription={documentData?.description ?? ''}
        />
        <ShareableResourceConnectorPrivateDetails
          connectorDetails={{ ...documentData, name: documentData.name ?? '' }}
        />
      </div>
    </>
  );
};

// Component export
export default ShareableResourceConnectorSlug;
