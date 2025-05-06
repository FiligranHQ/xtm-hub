'use client';
import BadgeOverflowCounter from '@/components/ui/badge-overflow-counter';
import { ShareLinkButton } from '@/components/ui/share-link/share-link-button';
import { csvFeedsItem_fragment$data } from '@generated/csvFeedsItem_fragment.graphql';
import { customDashboardsItem_fragment$data } from '@generated/customDashboardsItem_fragment.graphql';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { Badge } from 'filigran-ui';
import { AspectRatio } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ReactNode } from 'react';

export type ShareableResource =
  | documentItem_fragment$data
  | customDashboardsItem_fragment$data
  | csvFeedsItem_fragment$data;

interface ShareableResourceCardProps {
  document: ShareableResource;
  detailUrl: string;
  shareLinkUrl: string;
  children: ReactNode;
  extraContent?: ReactNode;
}

const isCustomDashboard = (
  document: ShareableResource
): document is customDashboardsItem_fragment$data => {
  return document.type === 'custom_dashboard';
};

const ShareableResourceCard = ({
  document,
  detailUrl,
  shareLinkUrl,
  children,
  extraContent,
}: ShareableResourceCardProps) => {
  const t = useTranslations();

  return (
    <li className="overflow-hidden border-light flex flex-col relative rounded border bg-page-background aria-disabled:opacity-60 hover:bg-hover">
      <div>
        <AspectRatio
          ratio={16 / 9}
          className={'z-[10]'}>
          {children}
        </AspectRatio>
      </div>
      <div className="flex flex-col flex-grow p-l space-y-s">
        <div className="flex items-center justify-between">
          {document?.labels && (
            <BadgeOverflowCounter
              badges={document?.labels}
              className="z-[2]"
            />
          )}
          <ShareLinkButton
            documentId={document.id}
            url={shareLinkUrl}
          />

          {extraContent}
        </div>
        <Link
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring after:cursor-pointer after:content-[' '] after:absolute after:inset-0"
          href={detailUrl}>
          <h3 className="line-clamp-2 text-ellipsis flex-1 max-h-[10rem] overflow-hidden">
            {document?.short_description}
          </h3>
        </Link>

        <div className="txt-mini items-center flex mt-auto">
          {isCustomDashboard(document) && document.product_version && (
            <div>
              {t('Service.CustomDashboards.FromOCTIVersion')} :{' '}
              {document.product_version}
            </div>
          )}
          <Badge
            size="sm"
            className="ml-auto"
            variant={document.active ? 'default' : 'warning'}>
            {t(
              document.active ? 'Badge.Published' : 'Badge.Draft'
            ).toUpperCase()}
          </Badge>
        </div>
      </div>
    </li>
  );
};

export default ShareableResourceCard;
