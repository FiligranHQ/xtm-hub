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

const XTM_ONE_GRADIENT_ID = 'xtm-one-tab-gradient';

const XtmOneTabGradientDefs = () => (
  <svg
    aria-hidden="true"
    className="absolute h-0 w-0">
    <defs>
      <linearGradient
        id={XTM_ONE_GRADIENT_ID}
        x1="0"
        y1="0"
        x2="1"
        y2="1">
        <stop
          offset="0%"
          stopColor="var(--color-filigran-ia-secondary)"
        />
        <stop
          offset="100%"
          stopColor="var(--color-filigran-ia-main)"
        />
      </linearGradient>
    </defs>
  </svg>
);

// Note: this literal string must match XTM_ONE_GRADIENT_ID above, Tailwind
// requires the full class name to be statically present in the source.
const XTM_ONE_TAB_ICON_GRADIENT_CLASSES =
  '[&_path]:fill-[url(#xtm-one-tab-gradient)] [&_path]:stroke-[url(#xtm-one-tab-gradient)] [&_circle]:stroke-[url(#xtm-one-tab-gradient)]';

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
      <XtmOneTabGradientDefs />
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
                  'flex-1',
                  isXtmOne &&
                    'data-[state=active]:border-[var(--color-filigran-ia-main)] data-[state=active]:text-[var(--color-filigran-ia-main)]'
                )}>
                <span className="flex items-center gap-s">
                  <Icon
                    className={cn(
                      'w-4 h-4',
                      isXtmOne && XTM_ONE_TAB_ICON_GRADIENT_CLASSES
                    )}
                  />
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
