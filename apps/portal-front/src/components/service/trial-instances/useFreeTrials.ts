import { PortalContext } from '@/components/me/app-portal-context';
import {
  registerRegisteredPlatformListFragment,
  RegisterRegisteredPlatformsQuery,
} from '@/components/registration/register/register.graphql';
import { SettingsContext } from '@/components/settings/env-portal-context';
import { DeploymentRequestDeploymentTypeEnum } from '@generated/models/DeploymentRequestDeploymentType.enum';
import { registerRegisteredPlatformListFragment$key } from '@generated/registerRegisteredPlatformListFragment.graphql';
import { registerRegisteredPlatformsQuery } from '@generated/registerRegisteredPlatformsQuery.graphql';
import { useContext } from 'react';
import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';

export const useFreeTrial = () => {
  const { me, isPersonalSpace } = useContext(PortalContext);
  const { settings } = useContext(SettingsContext);

  const isBlacklisted =
    settings?.domains_blacklist &&
    settings?.domains_blacklist
      .split(',')
      .some((domain) => me?.email?.includes(domain.trim()));

  const queryData = useLazyLoadQuery<registerRegisteredPlatformsQuery>(
    RegisterRegisteredPlatformsQuery,
    {
      input: {},
    }
  );

  const [data] = useRefetchableFragment<
    registerRegisteredPlatformsQuery,
    registerRegisteredPlatformListFragment$key
  >(registerRegisteredPlatformListFragment, queryData);

  const freeTrials = data.registeredPlatforms.filter(
    (platform) =>
      platform.deployment_request?.type ===
        DeploymentRequestDeploymentTypeEnum.TRIAL &&
      platform.deployment_request.counts_in_orga_quota
  );
  return {
    freeTrials: freeTrials.length > 0 && !isPersonalSpace ? freeTrials : [],
    isBlacklisted,
  };
};
