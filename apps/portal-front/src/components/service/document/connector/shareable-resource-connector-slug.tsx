'use client';
import * as React from 'react';

import {
  BreadcrumbNav,
  BreadcrumbNavLink,
} from '@/components/ui/breadcrumb-nav';
import { useTranslations } from 'next-intl';

import { ShareableResourceConnectorDetails } from '@/components/service/document/connector/shareable-resource-connector-details';
import ShareableResourceDescription from '@/components/service/document/shareable-resource-description';
import { ShareableResourceBasicInformation } from '@/components/service/document/ui/shareable-resource-basic-information';
import BadgeOverflowCounter, {
  BadgeOverflow,
} from '@/components/ui/badge-overflow-counter';
import { ShareLinkButton } from '@/components/ui/share-link/share-link-button';
import { integrationFeedsItem_fragment$data } from '@generated/integrationFeedsItem_fragment.graphql';
import { VerifiedIcon } from 'filigran-icon';

// Component interface
interface ShareableResourceConnectorSlugProps {
  documentData: integrationFeedsItem_fragment$data;
  breadcrumbValue: BreadcrumbNavLink[];
  shareUrl: string;
}

// Component
const ShareableResourceConnectorSlug: React.FunctionComponent<
  ShareableResourceConnectorSlugProps
> = ({ documentData, breadcrumbValue, shareUrl }) => {
  const t = useTranslations();

  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <div className="flex gap-s flex-col">
        <div className="flex gap-s">
          <h1 className="whitespace-nowrap">{documentData.name}</h1>
          {documentData.verified && (
            <div className="flex items-center gap-s py-xs px-l font-semibold bg-green-100  text-green-500 dark:bg-turquoise-900 rounded-lg">
              <VerifiedIcon className="h-5 w-5 shrink-0 mr-xs" />
              {t('Utils.Verified')}
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            <ShareLinkButton
              documentId={documentData.slug}
              url={shareUrl}
            />
          </div>
        </div>
        <BadgeOverflowCounter badges={documentData.labels as BadgeOverflow[]} />
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
