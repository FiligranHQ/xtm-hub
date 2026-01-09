'use client';
import * as React from 'react';

import {
  BreadcrumbNav,
  BreadcrumbNavLink,
} from '@/components/ui/breadcrumb-nav';
import { useTranslations } from 'next-intl';

import { PlatformTranslationMapping } from '@/components/registration/platform-identifier-mapping';
import { ShareableResourceConnectorPrivateDetails } from '@/components/service/document/connector/shareable-resource-connector-private-details';
import OneClickDeploy from '@/components/service/document/one-click-deploy/one-click-deploy';
import ShareableResourceDescription from '@/components/service/document/shareable-resource-description';
import BadgeOverflowCounter, {
  BadgeOverflow,
} from '@/components/ui/badge-overflow-counter';
import { ShareLinkButton } from '@/components/ui/share-link/share-link-button';
import { getPlatformIdentifier } from '@/utils/platform';
import { MotionPlayIcon, VerifiedIcon } from '@filigran/icon';
import { SimpleTooltip } from '@filigran/ui';
import { Button } from '@filigran/ui/servers';
import { integrationsItem_fragment$data } from '@generated/integrationsItem_fragment.graphql';
import Image from 'next/image';

// Component interface
interface ShareableResourceConnectorSlugProps {
  documentData: integrationsItem_fragment$data;
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
            <div className="ml-auto flex">
              <ShareLinkButton
                documentId={documentData.id}
                url={shareUrl}
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
                        PlatformTranslationMapping[platformIdentifier] ??
                        'OpenCTI',
                    })}
                  </Button>
                </SimpleTooltip>
              )}
            </div>
          </div>
          <div className="w-full mt-s mb-xs">
            <BadgeOverflowCounter
              badges={documentData.labels as BadgeOverflow[]}
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col-reverse lg:flex-row w-full mt-l gap-xl">
        <ShareableResourceDescription
          shortDescription={documentData?.short_description ?? ''}
          longDescription={documentData?.description ?? ''}
        />
        <ShareableResourceConnectorPrivateDetails
          connectorDetails={documentData}
        />
      </div>
    </>
  );
};

// Component export
export default ShareableResourceConnectorSlug;
