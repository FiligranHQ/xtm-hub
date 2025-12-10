import { PortalContext } from '@/components/me/app-portal-context';
import {
  registerRegisteredPlatformListFragment,
  RegisterRegisteredPlatformsQuery,
} from '@/components/registration/register/register.graphql';
import { SettingsContext } from '@/components/settings/env-portal-context';
import { DeploymentRequestDeploymentTypeEnum } from '@generated/models/DeploymentRequestDeploymentType.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { registerRegisteredPlatformListFragment$key } from '@generated/registerRegisteredPlatformListFragment.graphql';
import { registerRegisteredPlatformsQuery } from '@generated/registerRegisteredPlatformsQuery.graphql';
import { useContext } from 'react';
import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';

export const useFreeTrial = () => {
  const { me } = useContext(PortalContext);
  const { settings } = useContext(SettingsContext);

  const isBlacklisted = (settings?.domains_blacklist ?? '')
    .split(',')
    .map((domain) => domain.trim())
    .some((domain) => me?.email?.includes(domain));

  const queryData = useLazyLoadQuery<registerRegisteredPlatformsQuery>(
    RegisterRegisteredPlatformsQuery,
    {
      input: {
        identifier: PlatformIdentifierEnum.OPENCTI,
      },
    }
  );

  const [data] = useRefetchableFragment<
    registerRegisteredPlatformsQuery,
    registerRegisteredPlatformListFragment$key
  >(registerRegisteredPlatformListFragment, queryData);

  const freeTrials = data.registeredPlatforms.filter(
    (platform) =>
      platform.deployment_request?.type ===
      DeploymentRequestDeploymentTypeEnum.TRIAL
  );

  return {
    freeTrial: freeTrials.length > 0 ? freeTrials[0] : null,
    isBlacklisted,
  };
};
