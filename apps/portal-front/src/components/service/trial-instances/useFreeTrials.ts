import {
  registerRegisteredPlatformListFragment,
  RegisterRegisteredPlatformsQuery,
} from '@/components/registration/register/register.graphql';
import { DeploymentRequestDeploymentTypeEnum } from '@generated/models/DeploymentRequestDeploymentType.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { registerRegisteredPlatformListFragment$key } from '@generated/registerRegisteredPlatformListFragment.graphql';
import { registerRegisteredPlatformsQuery } from '@generated/registerRegisteredPlatformsQuery.graphql';
import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';

export const useFreeTrial = () => {
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
  };
};
