'use client';
import { PlatformIdentifier } from '@graphql/generated';

import { TrialsTabQuotasPlatform } from '@/components/trials/tab/quotas/TrialsTabQuotasPlatform';
import TrialsTab from '@/components/trials/tab/TrialsTab';
import { TrialsTabType } from '@/components/trials/trials.const';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@filigran/ui';

import { useTranslate } from '@tolgee/react';
interface TrialsListProps {
  platformIdentifier: PlatformIdentifier;
}

const TrialsList = ({ platformIdentifier }: TrialsListProps) => {
  const { t } = useTranslate();

  return (
    <>
      <Tabs defaultValue={'waiting'}>
        <TabsList>
          <TabsTrigger value="cancelled">
            {t('TrialsDashboard_TabTitle_Cancelled')}
          </TabsTrigger>
          <TabsTrigger value="expired">
            {t('TrialsDashboard_TabTitle_Expired')}
          </TabsTrigger>
          <TabsTrigger value="running">
            {t('TrialsDashboard_TabTitle_Running')}
          </TabsTrigger>
          <TabsTrigger value="waiting">
            {t('TrialsDashboard_TabTitle_Waiting')}
          </TabsTrigger>
          <TabsTrigger value="quotas">
            {t('TrialsDashboard_TabTitle_Quotas')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="cancelled">
          <TrialsTab
            type={TrialsTabType.Cancelled}
            platformIdentifier={platformIdentifier}
          />
        </TabsContent>
        <TabsContent value="expired">
          <TrialsTab
            type={TrialsTabType.Expired}
            platformIdentifier={platformIdentifier}
          />
        </TabsContent>
        <TabsContent value="running">
          <TrialsTab
            type={TrialsTabType.Running}
            platformIdentifier={platformIdentifier}
          />
        </TabsContent>
        <TabsContent value="waiting">
          <TrialsTab
            type={TrialsTabType.Waiting}
            platformIdentifier={platformIdentifier}
          />
        </TabsContent>
        <TabsContent value="quotas">
          <TrialsTabQuotasPlatform platformIdentifier={platformIdentifier} />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default TrialsList;
