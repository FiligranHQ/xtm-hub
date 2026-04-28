'use client';

import { TrialsTabType } from '@/components/trials/trials.const';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@filigran/ui';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { useTranslations } from 'next-intl';
import { FunctionComponent } from 'react';
import { TrialsTabQuotasPlatform } from './tab/quotas/TrialsTabQuotasPlatform';
import TrialsTab from './tab/TrialsTab';

interface Props {
  platformIdentifier: PlatformIdentifierEnum;
}

const TrialsList: FunctionComponent<Props> = ({ platformIdentifier }) => {
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
