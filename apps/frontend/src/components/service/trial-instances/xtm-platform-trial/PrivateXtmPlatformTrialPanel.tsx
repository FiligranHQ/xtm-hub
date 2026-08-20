'use client';

import { PortalContext } from '@/components/me/AppPortalContext';
import { XtmPlatformTrialMessagePanel } from '@/components/service/trial-instances/xtm-platform-trial/XtmPlatformTrialMessagePanel';
import { deriveXtmPlatformTrialPanelState } from '@/components/service/trial-instances/xtm-platform-trial/xtm-platform-trial-panel.utils';
import { useCanRequestPlatformTrial } from '@/hooks/use-can-request-platform-trial';
import { portalGraphqlClient } from '@/lib/graphql-client';
import {
  PlatformTrialStatusQueryVariables,
  usePlatformTrialStatusQuery,
} from '@graphql/generated';
import { platformTrialKeys } from '@graphql/trial/trial.keys';
import { useTranslations } from 'next-intl';
import { useContext } from 'react';

export const PrivateXtmPlatformTrialPanel = () => {
  const { me } = useContext(PortalContext);
  const t = useTranslations('Service.Trials.XtmPlatform.Page');
  const organizationId = me?.selected_organization_id ?? '';

  const canRequestTrial = useCanRequestPlatformTrial();

  const variables: PlatformTrialStatusQueryVariables = { organizationId };
  const { data, isLoading, isPending, isError } = usePlatformTrialStatusQuery(
    portalGraphqlClient,
    variables,
    {
      enabled: !!organizationId,
      queryKey: platformTrialKeys.platformTrialStatus(variables),
    }
  );

  if (!organizationId || isLoading || isPending || isError) {
    return null;
  }

  const state = deriveXtmPlatformTrialPanelState({
    isAllowed: canRequestTrial,
    ongoingStandaloneTrials:
      data?.platformTrialStatus?.ongoingStandaloneTrials ?? [],
  });

  if (state === 'not-allowed') {
    return (
      <XtmPlatformTrialMessagePanel
        title={t('NotAdmin.Title')}
        description={t('NotAdmin.Description')}
      />
    );
  }

  return null;
};
