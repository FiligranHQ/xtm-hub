'use client';

import { PortalContext } from '@/components/me/AppPortalContext';
import { XtmPlatformTrialBanner } from '@/components/service/trial-instances/banner/xtm-platform-trial/XtmPlatformTrialBanner';
import { deriveXtmPlatformTrialState } from '@/components/service/trial-instances/banner/xtm-platform-trial/xtm-platform-trial-banner.utils';
import { SettingsContext } from '@/components/settings/EnvPortalContext';
import { portalGraphqlClient } from '@/lib/graphql-client';
import { APP_PATH } from '@/utils/path/constant';
import {
  PlatformTrialStatusQueryVariables,
  usePlatformTrialStatusQuery,
} from '@graphql/generated';
import { platformTrialKeys } from '@graphql/trial/trial.keys';
import { useContext } from 'react';

export const PrivateXtmPlatformTrialBanner = () => {
  const { me } = useContext(PortalContext);
  const { settings } = useContext(SettingsContext);
  const organizationId = me?.selected_organization_id ?? '';

  const variables: PlatformTrialStatusQueryVariables = { organizationId };

  const { data, isLoading, isPending, isError } = usePlatformTrialStatusQuery(
    portalGraphqlClient,
    variables,
    {
      enabled: !!organizationId,
      queryKey: platformTrialKeys.platformTrialStatus(variables),
    }
  );

  if (!settings || !organizationId || isLoading || isPending || isError) {
    return null;
  }

  const platformTrialStatus = data?.platformTrialStatus;
  const { state, daysLeft } = deriveXtmPlatformTrialState({
    isBlacklisted: platformTrialStatus?.isBlacklisted ?? false,
    hubStatus: platformTrialStatus?.hub_status,
    endDate: platformTrialStatus?.end_date,
  });

  return (
    <XtmPlatformTrialBanner
      state={state}
      daysLeft={daysLeft}
      learnMoreHref={`${settings.base_url_front}/${APP_PATH}/service/xtm-platform-trial`}
    />
  );
};
