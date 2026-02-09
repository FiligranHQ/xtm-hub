import {
  TrialsForOrga,
  TrialsForOrgaFragment,
} from '@/components/service/trial-instances/trial-instances.graphql';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { trialInstancesTrialsForOrgaFragment$key } from '@generated/trialInstancesTrialsForOrgaFragment.graphql';
import { trialInstancesTrialsForOrgaQuery } from '@generated/trialInstancesTrialsForOrgaQuery.graphql';
import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';

export const useOrgaFreeTrial = () => {
  const queryData = useLazyLoadQuery<trialInstancesTrialsForOrgaQuery>(
    TrialsForOrga,
    {
      input: {
        platformIdentifiers: [
          PlatformIdentifierEnum.OPENCTI,
          PlatformIdentifierEnum.OPENAEV,
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
