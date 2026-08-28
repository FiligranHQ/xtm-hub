'use client';

import { PlatformMetadataMapping } from '@/components/registration/PlatformIdentifierMapping';
import { SuggestedActionsChecklist } from '@/components/service/trial-guide/SuggestedActionsChecklist';
import { TRIAL_GUIDE_CONTENT } from '@/components/service/trial-guide/TrialGuide.content';
import { TrialGuideResourceCard } from '@/components/service/trial-guide/TrialGuideResourceCard';
import { SlackSupportButton } from '@/components/service/trial-instances/SlackSupport';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { cn } from '@/lib/utils';
import { APP_PATH } from '@/utils/path/constant';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@filigran/ui';
import { PlatformIdentifier } from '@graphql/generated';
import { useTranslations } from 'next-intl';

const TRIAL_GUIDE_TABS = [
  PlatformIdentifier.Opencti,
  PlatformIdentifier.Openaev,
  PlatformIdentifier.Xtmone,
];

export const TrialGuidePage = () => {
  const t = useTranslations();

  const breadcrumbs = [
    {
      label: 'MenuLinks.Home',
      href: `/${APP_PATH}`,
    },
    {
      label: 'Service.TrialGuide.Breadcrumb.TrialPlatform',
      href: `/${APP_PATH}/service/xtm-platform-trial`,
    },
    {
      label: 'Service.TrialGuide.Breadcrumb.TrialGuide',
    },
  ];

  return (
    <>
      <BreadcrumbNav value={breadcrumbs} />
      <p className="heading-sm bg-clip-text text-transparent bg-gradient-focus w-fit mb-m">
        {t('Service.TrialGuide.Eyebrow')}
      </p>
      <div className="flex items-start justify-between gap-m flex-wrap">
        <div className="flex flex-col gap-s">
          <h1 className="heading-2xl">{t('Service.TrialGuide.Title')}</h1>
          <p className="text-content-body-medium text-text-default-secondary">
            {t('Service.TrialGuide.Description')}
          </p>
        </div>
        <SlackSupportButton />
      </div>
      <Tabs
        defaultValue={PlatformIdentifier.Opencti}
        className="mt-l">
        <TabsList className="w-full">
          {TRIAL_GUIDE_TABS.map((platformIdentifier) => {
            const { name, Icon } = PlatformMetadataMapping[platformIdentifier];
            const isXtmOne = platformIdentifier === PlatformIdentifier.Xtmone;
            return (
              <TabsTrigger
                key={platformIdentifier}
                value={platformIdentifier}
                className={cn(
                  'group flex-1',
                  isXtmOne &&
                    'data-[state=active]:border-[var(--color-filigran-ia-main)]'
                )}>
                <span
                  className={cn(
                    'flex items-center gap-s',
                    isXtmOne &&
                      'group-data-[state=active]:text-[var(--color-filigran-ia-main)]'
                  )}>
                  <Icon className="w-4 h-4" />
                  {name}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
        {TRIAL_GUIDE_TABS.map((platformIdentifier) => {
          const { resourceCards, checklistItems } =
            TRIAL_GUIDE_CONTENT[platformIdentifier];
          return (
            <TabsContent
              key={platformIdentifier}
              value={platformIdentifier}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-m mt-m">
                {resourceCards.map((resourceCard) => (
                  <TrialGuideResourceCard
                    key={resourceCard.id}
                    resourceCard={resourceCard}
                  />
                ))}
              </div>
              <SuggestedActionsChecklist checklistItems={checklistItems} />
            </TabsContent>
          );
        })}
      </Tabs>
    </>
  );
};

export default TrialGuidePage;
