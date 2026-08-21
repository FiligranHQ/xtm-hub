'use client';

import { PortalContext } from '@/components/me/AppPortalContext';
import {
  XtmPlatformTrialForm,
  xtmPlatformTrialFormSchema,
} from '@/components/service/trial-instances/xtm-platform-trial/XtmPlatformTrialForm';
import { XtmPlatformTrialMessagePanel } from '@/components/service/trial-instances/xtm-platform-trial/XtmPlatformTrialMessagePanel';
import { deriveXtmPlatformTrialPanelState } from '@/components/service/trial-instances/xtm-platform-trial/xtm-platform-trial-panel.utils';
import { useCanRequestPlatformTrial } from '@/hooks/use-can-request-platform-trial';
import { portalGraphqlClient } from '@/lib/graphql-client';
import { toast } from '@filigran/ui/clients';
import {
  DeploymentRequestDeploymentType,
  DeploymentRequestSource,
  PlatformTrialStatusQueryVariables,
  useCreateDeploymentRequestMutation,
  usePlatformTrialStatusQuery,
} from '@graphql/generated';
import { platformTrialKeys } from '@graphql/trial/trial.keys';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useContext } from 'react';
import { z } from 'zod';

export const PrivateXtmPlatformTrialPanel = () => {
  const { me, isPersonalSpace } = useContext(PortalContext);
  const t = useTranslations('Service.Trials.XtmPlatform.Page');
  const tGlobal = useTranslations();
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

  const queryClient = useQueryClient();
  const { mutate } = useCreateDeploymentRequestMutation(portalGraphqlClient, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: platformTrialKeys.platformTrialStatus(variables),
      });
      toast({
        title: tGlobal('Utils.Success'),
        description: tGlobal('Service.Trials.Form.FormRequested'),
      });
    },
  });

  const handleSubmit = (values: z.infer<typeof xtmPlatformTrialFormSchema>) => {
    const { acceptTerms: _, ...rest } = values;
    mutate({
      input: {
        ...rest,
        type: DeploymentRequestDeploymentType.Bundle,
        source: DeploymentRequestSource.Xtmhub,
      },
    });
  };

  if (!organizationId || isLoading || isPending || isError) {
    return null;
  }

  const state = deriveXtmPlatformTrialPanelState({
    isPersonalSpace: isPersonalSpace ?? false,
    isAllowed: canRequestTrial,
    ongoingStandaloneTrials:
      data?.platformTrialStatus?.ongoingStandaloneTrials ?? [],
  });

  if (state === 'personal-space') {
    return (
      <XtmPlatformTrialMessagePanel
        title={t('PersonalSpace.Title')}
        description={tGlobal('Service.Trials.InfoPersonalSpace')}
      />
    );
  }

  if (state === 'not-allowed') {
    return (
      <XtmPlatformTrialMessagePanel
        title={t('NotAdmin.Title')}
        description={t('NotAdmin.Description')}
      />
    );
  }

  return (
    <XtmPlatformTrialForm
      handleSubmit={handleSubmit}
      hasOngoingStandaloneTrials={state === 'request-with-ongoing-trials'}
    />
  );
};
