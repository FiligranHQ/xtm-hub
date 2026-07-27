'use client';

import { LastDeployedOverview } from '@/components/homepage/last-deployed-resources/LastDeployedResourcesSection';
import BadgeOverflowCounter from '@/components/ui/BadgeOverflowCounter';
import { UserDisplay } from '@/components/ui/UserDisplay';
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/date';
import { ResourceTypeIcon } from '@/utils/shareable-resources/resource-type-icon';
import {
  SHAREABLE_RESOURCE_SERVICE_DEFINITION_IDENTIFIER_MAPPING,
  SHAREABLE_RESOURCE_SERVICE_SLUG_MAPPING,
  ShareableResourceType,
} from '@/utils/shareable-resources/shareable-resources.types';
import { CalendarMonthIcon } from '@filigran/icon';
import { Badge } from '@filigran/ui/servers';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const BADGE_CLASS = 'border-0 bg-primary/20 p-l';

type DeployedResource = LastDeployedOverview['resources'][number];

type LastDeployedResourceRowProps = {
  resource: DeployedResource;
};

const LastDeployedResourceRow = ({
  resource,
}: LastDeployedResourceRowProps) => {
  const t = useTranslations('HomePage.LastDeployedResources');
  const deployedAt = formatDate(resource.deployedAt, 'DATE_MEDIUM');

  const { document } = resource;
  const resourceType = document.type as ShareableResourceType;
  const serviceSlug = SHAREABLE_RESOURCE_SERVICE_SLUG_MAPPING[resourceType];

  if (!serviceSlug || !document.slug || !document.service_instance_id) {
    return null;
  }

  const url = `/app/service/${SHAREABLE_RESOURCE_SERVICE_DEFINITION_IDENTIFIER_MAPPING[resourceType]}/${document.service_instance_id}/${document.id}`;

  return (
    <Link
      href={url}
      className="flex items-center">
      <div className="flex items-center gap-m rounded p-s bg-elevation-background-layer-1">
        <div className="shrink-0">
          <ResourceTypeIcon
            resourceType={resourceType}
            className="size-6"
          />
        </div>
        <div className="flex items-center gap-s">
          <span className="content-body-base font-bold truncate">
            {document.name}
          </span>
          <BadgeOverflowCounter
            badges={document.use_cases ?? []}
            badgeClassName={BADGE_CLASS}
          />
        </div>
      </div>
      <div className="ml-auto shrink-0 flex items-center gap-s text-text-default-secondary txt-small">
        <Badge className={cn('shrink-0', BADGE_CLASS)}>
          <CalendarMonthIcon className="size-4" />
        </Badge>
        <span>{t('On')}</span>
        <span className="content-body-base text-text-default-primary">
          {deployedAt}
        </span>
        {resource.deployedBy && (
          <>
            <span>{t('By')}</span>
            <UserDisplay uploader={resource.deployedBy} />
          </>
        )}
      </div>
    </Link>
  );
};

export default LastDeployedResourceRow;
