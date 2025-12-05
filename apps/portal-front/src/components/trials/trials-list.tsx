'use client';

import TrialsTab from '@/components/trials/trials-tab';
import { TrialsTabType } from '@/components/trials/trials.const';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'filigran-ui';
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
        </TabsList>
        <TabsContent value="cancelled">
          <TrialsTab type={TrialsTabType.Cancelled}></TrialsTab>
        </TabsContent>
        <TabsContent value="expired">
          <TrialsTab type={TrialsTabType.Expired}></TrialsTab>
        </TabsContent>
        <TabsContent value="running">
          <TrialsTab type={TrialsTabType.Running}></TrialsTab>
        </TabsContent>
        <TabsContent value="waiting">
          <TrialsTab type={TrialsTabType.Waiting}></TrialsTab>
        </TabsContent>
      </Tabs>
    </>
  );
};
export default TrialsList;
