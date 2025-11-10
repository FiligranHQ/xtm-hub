'use client';
import * as React from 'react';

import {
  BreadcrumbNav,
  BreadcrumbNavLink,
} from '@/components/ui/breadcrumb-nav';
import { useTranslations } from 'next-intl';

import { ShareableResourceConnectorDetails } from '@/components/service/document/connector/shareable-resource-connector-details';
import OneClickDeploy from '@/components/service/document/one-click-deploy/one-click-deploy';
import ShareableResourceDescription from '@/components/service/document/shareable-resource-description';
import { ShareableResourceBasicInformation } from '@/components/service/document/ui/shareable-resource-basic-information';
import BadgeOverflowCounter, {
  BadgeOverflow,
} from '@/components/ui/badge-overflow-counter';
import { ShareLinkButton } from '@/components/ui/share-link/share-link-button';
import { integrationFeedsItem_fragment$data } from '@generated/integrationFeedsItem_fragment.graphql';
import { VerifiedIcon } from 'filigran-icon';
import Image from 'next/image';

// Component interface
interface ShareableResourceConnectorSlugProps {
  documentData: integrationFeedsItem_fragment$data;
  breadcrumbValue: BreadcrumbNavLink[];
  shareUrl: string;
  logo?: string;
}

// Component
const ShareableResourceConnectorSlug: React.FunctionComponent<
  ShareableResourceConnectorSlugProps
> = ({ documentData, breadcrumbValue, shareUrl, logo }) => {
  const t = useTranslations();

  const shouldDisplayOneClickDeployButton =
    documentData.manager_supported === 'true';

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
            {documentData.verified && (
              <div className="flex items-center gap-s py-xs px-l font-semibold bg-green-100  text-green-500 dark:bg-turquoise-900 rounded-lg">
                <VerifiedIcon className="h-5 w-5 shrink-0 mr-xs" />
                {t('Utils.Verified')}
              </div>
            )}
            <div className="ml-auto">
              <ShareLinkButton
                documentId={documentData.slug}
                url={shareUrl}
              />

              {shouldDisplayOneClickDeployButton && (
                <OneClickDeploy
                  documentData={documentData}
                  requiredProductVersion={documentData.product_version}
                />
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
        <ShareableResourceBasicInformation>
          <ShareableResourceConnectorDetails connectorDetails={documentData} />
        </ShareableResourceBasicInformation>
      </div>
    </>
  );
};

// Component export
export default ShareableResourceConnectorSlug;
