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
  const t = useTranslations();
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
        title: t('Utils.Success'),
        description: t('Service.Trials.Form.FormRequested'),
      });
    },
  });

  const handleSubmit = (values: z.infer<typeof xtmPlatformTrialFormSchema>) => {
    const { acceptTerms: _, use_cases_by_product, ...rest } = values;
    mutate({
      input: {
        ...rest,
        use_cases_by_product: use_cases_by_product.flatMap((entry) =>
          entry.use_case
            ? [
                {
                  platform_identifier: entry.platform_identifier,
                  use_case: entry.use_case,
                },
              ]
            : []
        ),
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
        title={t('Service.Trials.XtmPlatform.Page.PersonalSpace.Title')}
        description={t('Service.Trials.InfoPersonalSpace')}
      />
    );
  }

  if (state === 'not-allowed') {
    return (
      <XtmPlatformTrialMessagePanel
        title={t('Service.Trials.XtmPlatform.Page.NotAdmin.Title')}
        description={t('Service.Trials.XtmPlatform.Page.NotAdmin.Description')}
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
