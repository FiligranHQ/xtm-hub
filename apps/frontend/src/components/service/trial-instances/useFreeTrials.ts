import { PortalContext } from '@/components/me/AppPortalContext';
import {
  registerRegisteredPlatformListFragment,
  RegisterRegisteredPlatformsQuery,
} from '@/components/registration/register/register.graphql';
import { registerRegisteredPlatformFragment$data } from '@generated/registerRegisteredPlatformFragment.graphql';
import { registerRegisteredPlatformListFragment$key } from '@generated/registerRegisteredPlatformListFragment.graphql';
import { registerRegisteredPlatformsQuery } from '@generated/registerRegisteredPlatformsQuery.graphql';
import { useContext } from 'react';
import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';

export const useFreeTrial = (isActiveOnly: boolean = false) => {
  const { isPersonalSpace } = useContext(PortalContext);
  const queryData = useLazyLoadQuery<registerRegisteredPlatformsQuery>(
    RegisterRegisteredPlatformsQuery,
    {
      input: {
        onlyActive: isActiveOnly,
        onlyTrial: true,
      },
    }
  );

  const [data] = useRefetchableFragment<
    registerRegisteredPlatformsQuery,
    registerRegisteredPlatformListFragment$key
  >(registerRegisteredPlatformListFragment, queryData);

  return {
    freeTrials:
      data.registeredPlatforms.length > 0 && !isPersonalSpace
        ? (data.registeredPlatforms as registerRegisteredPlatformFragment$data[])
        : ([] as registerRegisteredPlatformFragment$data[]),
  };
};
