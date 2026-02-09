import { PortalContext } from '@/components/me/app-portal-context';
import {
  TrialsForOrga,
  TrialsForOrgaFragment,
} from '@/components/service/trial-instances/trial-instances.graphql';
import { SettingsContext } from '@/components/settings/env-portal-context';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { trialInstancesTrialsForOrgaFragment$key } from '@generated/trialInstancesTrialsForOrgaFragment.graphql';
import { trialInstancesTrialsForOrgaQuery } from '@generated/trialInstancesTrialsForOrgaQuery.graphql';
import { useContext } from 'react';
import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';

export const useOrgaFreeTrial = () => {
  const { me } = useContext(PortalContext);
  const { settings } = useContext(SettingsContext);

  const isBlacklisted =
    settings?.domains_blacklist &&
    settings?.domains_blacklist
      .split(',')
      .some((domain) => me?.email?.includes(domain.trim()));

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
    isBlacklisted,
    refetch,
  };
};
