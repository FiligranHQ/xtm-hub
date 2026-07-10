'use client';

import LastDeployedResourceRow from '@/components/homepage/LastDeployedResourceRow';
import { LastDeployedPlatform } from '@/components/homepage/LastDeployedResourcesSection';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@filigran/ui';
import { Separator } from '@filigran/ui/clients';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Fragment, useState } from 'react';

type LastDeployedResourcesClientProps = {
  platforms: LastDeployedPlatform[];
};

const LastDeployedResourcesClient = ({
  platforms,
}: LastDeployedResourcesClientProps) => {
  const t = useTranslations('HomePage.LastDeployedResources');
  const tPlatform = useTranslations('PublicHomePage.XtmPlatform');

  const platformsWithResources = platforms.filter(
    (platform) => platform.overview.resources.length > 0
  );

  const [selectedPlatformId, setSelectedPlatformId] = useState<string>(
    platformsWithResources[0]?.id ?? ''
  );

  if (platformsWithResources.length === 0) {
    return (
      <section className="flex-1 min-w-0 flex flex-col gap-l">
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
      </section>
    );
  }

  const effectivePlatform =
    platformsWithResources.find(
      (platform) => platform.id === selectedPlatformId
    ) ?? platformsWithResources[0]!;

  const resources = effectivePlatform.overview.resources;

  return (
    <section className="flex-1 min-w-0 flex flex-col gap-l">
      <div className="flex items-center gap-m">
        <h2 className="content-body-base text-text-default-primary">
          {t('Title')}
        </h2>
        <Select
          value={effectivePlatform.id}
          onValueChange={setSelectedPlatformId}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder={t('ProductPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {platformsWithResources.map((platform) => (
              <SelectItem
                key={platform.id}
                value={platform.id}>
                {platform.productName
                  ? `${platform.productName} - ${platform.title}`
                  : platform.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
    </section>
  );
};

export default LastDeployedResourcesClient;
