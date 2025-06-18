import BadgeOverflowCounter, {
  BadgeOverflow,
} from '@/components/ui/badge-overflow-counter';
import { ShareLinkButton } from '@/components/ui/share-link/share-link-button';
import { ShareableResource } from '@/utils/shareable-resources/shareable-resources.utils';
import { customDashboardsItem_fragment$data } from '@generated/customDashboardsItem_fragment.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { Badge } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ReactNode } from 'react';
import ShareableResourceCardIllustration from './shareable-resource-illustration';

interface ShareableResourceCardProps {
  document: ShareableResource;
  detailUrl: string;
  shareLinkUrl: string;
  extraContent?: ReactNode;
  serviceInstance:
    | NonNullable<serviceByIdQuery$data['serviceInstanceById']>
    | seoServiceInstanceFragment$data;
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
  extraContent,
  serviceInstance,
}: ShareableResourceCardProps) => {
  const t = useTranslations();

  return (
    <li className="overflow-hidden border-light flex flex-col relative rounded border bg-page-background aria-disabled:opacity-60 hover:bg-hover">
      <ShareableResourceCardIllustration
        document={document}
        detailUrl={detailUrl}
        serviceInstance={serviceInstance}
      />
      <div className="flex flex-col flex-grow p-l space-y-s">
        <div className="flex items-center justify-between">
          {document?.labels && (
            <BadgeOverflowCounter
              badges={document?.labels as BadgeOverflow[]}
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
