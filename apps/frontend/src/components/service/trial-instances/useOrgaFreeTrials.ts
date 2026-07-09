import { PortalContext } from '@/components/me/AppPortalContext';
import {
  TrialsForOrga,
  TrialsForOrgaFragment,
} from '@/components/service/trial-instances/trial-instances.graphql';
import { trialInstancesTrialsForOrgaFragment$key } from '@generated/trialInstancesTrialsForOrgaFragment.graphql';
import { trialInstancesTrialsForOrgaQuery } from '@generated/trialInstancesTrialsForOrgaQuery.graphql';
import { PlatformIdentifier } from '@graphql/generated';
import { useContext } from 'react';
import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';

export const useOrgaFreeTrial = () => {
  const { me } = useContext(PortalContext);

  const queryData = useLazyLoadQuery<trialInstancesTrialsForOrgaQuery>(
    TrialsForOrga,
    {
      input: {
        organizationId: me?.selected_organization_id || '',
        platformIdentifiers: [
          PlatformIdentifier.Opencti,
          PlatformIdentifier.Openaev,
        ],
      },
    }
  );

  const [data, refetch] = useRefetchableFragment<
    trialInstancesTrialsForOrgaQuery,
    trialInstancesTrialsForOrgaFragment$key
  >(TrialsForOrgaFragment, queryData);

  const freeTrials = data.trialDeployments;

  return {
    availableTrials: freeTrials.availableTrials,
    isBlacklisted: freeTrials.isBlacklisted,
    refetch,
  };
};
