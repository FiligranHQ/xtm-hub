'use client';

import LastDeployedResourceRow from '@/components/homepage/LastDeployedResourceRow';
import { LastDeployedPlatform } from '@/components/homepage/LastDeployedResourcesSection';
import { portalGraphqlClient } from '@/lib/graphql-client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@filigran/ui';
import { Separator } from '@filigran/ui/clients';
import { useLastDeployedOverviewQueryQuery } from '@graphql/generated';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Fragment, useState } from 'react';

const LAST_DEPLOYED_LIMIT = 4;

type LastDeployedResourcesClientProps = {
  platforms: LastDeployedPlatform[];
};

const LastDeployedResourcesClient = ({
  platforms,
}: LastDeployedResourcesClientProps) => {
  const t = useTranslations('HomePage.LastDeployedResources');
  const tPlatform = useTranslations('PublicHomePage.XtmPlatform');

  const [selectedServiceInstanceId, setSelectedServiceInstanceId] =
    useState<string>(platforms[0]?.serviceInstanceId ?? '');

  const { data, isLoading } = useLastDeployedOverviewQueryQuery(
    portalGraphqlClient,
    {
      limit: LAST_DEPLOYED_LIMIT,
      serviceInstanceId: selectedServiceInstanceId,
    }
  );

  const resources = data?.lastDeployedOverview.resources ?? [];

  return (
    <section className="flex-1 min-w-0 flex flex-col gap-l">
      <div className="flex items-center gap-m">
        <h2 className="content-body-base text-text-default-primary">
          {t('Title')}
        </h2>
        <Select
          value={selectedServiceInstanceId}
          onValueChange={setSelectedServiceInstanceId}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder={t('ProductPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {platforms.map((platform) => (
              <SelectItem
                key={platform.serviceInstanceId}
                value={platform.serviceInstanceId}>
                {platform.productName
                  ? `${platform.productName} - ${platform.title}`
                  : platform.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!isLoading && resources.length === 0 ? (
        <div className="flex items-center justify-center">
          <Image
            src="/xtm_platform.png"
            alt={tPlatform('ImageAlt')}
            width={1370}
            height={680}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="w-auto max-h-70"
          />
        </div>
      ) : (
        <ul className="flex flex-col gap-l">
          {resources.map((resource, index) => (
            <Fragment key={`${resource.document.id}-${index}`}>
              {index > 0 && (
                <li
                  aria-hidden="true"
                  className="shrink-0">
                  <Separator className="bg-elevation-border-subtle" />
                </li>
              )}
              <li>
                <LastDeployedResourceRow resource={resource} />
              </li>
            </Fragment>
          ))}
        </ul>
      )}
    </section>
  );
};

export default LastDeployedResourcesClient;
