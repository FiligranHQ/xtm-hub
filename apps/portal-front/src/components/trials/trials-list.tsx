'use client';

import { TrialsTabQuotas } from '@/components/trials/tab/quotas/trials-tab-quotas';
import TrialsTab from '@/components/trials/tab/trials-tab';
import { TrialsTabType } from '@/components/trials/trials.const';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@filigran/ui';
import { useTranslations } from 'next-intl';
import { FunctionComponent } from 'react';

const TrialsList: FunctionComponent = () => {
  const t = useTranslations();

  return (
    <>
      <Tabs defaultValue={'waiting'}>
        <TabsList>
          <TabsTrigger value="cancelled">
            {t('TrialsDashboard.TabTitle.Cancelled')}
          </TabsTrigger>
          <TabsTrigger value="expired">
            {t('TrialsDashboard.TabTitle.Expired')}
          </TabsTrigger>
          <TabsTrigger value="running">
            {t('TrialsDashboard.TabTitle.Running')}
          </TabsTrigger>
          <TabsTrigger value="waiting">
            {t('TrialsDashboard.TabTitle.Waiting')}
          </TabsTrigger>
          <TabsTrigger value="quotas">
            {t('TrialsDashboard.TabTitle.Quotas')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="cancelled">
          <TrialsTab type={TrialsTabType.Cancelled} />
        </TabsContent>
        <TabsContent value="expired">
          <TrialsTab type={TrialsTabType.Expired} />
        </TabsContent>
        <TabsContent value="running">
          <TrialsTab type={TrialsTabType.Running} />
        </TabsContent>
        <TabsContent value="waiting">
          <TrialsTab type={TrialsTabType.Waiting} />
        </TabsContent>
        <TabsContent value="quotas">
          <TrialsTabQuotas />
        </TabsContent>
      </Tabs>
    </>
  );
};
export default TrialsList;
