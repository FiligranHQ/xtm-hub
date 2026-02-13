import { PortalContext } from '@/components/me/app-portal-context';
import {
  registerRegisteredPlatformListFragment,
  RegisterRegisteredPlatformsQuery,
} from '@/components/registration/register/register.graphql';
import { DeploymentRequestDeploymentTypeEnum } from '@generated/models/DeploymentRequestDeploymentType.enum';
import { PlatformContract } from '@generated/registerPlatformMutation.graphql';
import {
  DeploymentRequestDeploymentType,
  ServiceDefinitionIdentifier,
  ServiceInstanceCreationStatus,
} from '@generated/registerRegisteredPlatformFragment.graphql';
import { registerRegisteredPlatformListFragment$key } from '@generated/registerRegisteredPlatformListFragment.graphql';
import { registerRegisteredPlatformsQuery } from '@generated/registerRegisteredPlatformsQuery.graphql';
import { DeploymentRequestHubStatus } from '@generated/trials_fragment.graphql';
import { useContext } from 'react';
import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';

export type DeploymentRequest = {
  activity_sector: string | null | undefined;
  counts_in_orga_quota: boolean;
  hub_status: DeploymentRequestHubStatus;
  id: string;
  job_title: string | null | undefined;
  type: DeploymentRequestDeploymentType;
};
export type FreeTrial = {
  contract: PlatformContract;
  deployment_request: DeploymentRequest | null | undefined;
  id: string;
  identifier: ServiceDefinitionIdentifier;
  illustration_document_id: string | null | undefined;
  platform_id: string;
  subscription:
    | {
        end_date: Date | null | undefined;
        service_instance:
          | {
              creation_status: ServiceInstanceCreationStatus | null | undefined;
              id: string;
              name: string;
            }
          | null
          | undefined;
        start_date: Date | null | undefined;
        status: string | null | undefined;
      }
    | null
    | undefined;
  title: string;
  url: string;
};

export const useFreeTrial = (isActiveOnly: boolean = false) => {
  const { isPersonalSpace } = useContext(PortalContext);
  const queryData = useLazyLoadQuery<registerRegisteredPlatformsQuery>(
    RegisterRegisteredPlatformsQuery,
    {
      input: {
        onlyActive: isActiveOnly,
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
        DeploymentRequestDeploymentTypeEnum.TRIAL &&
      platform.deployment_request.counts_in_orga_quota
  );
  return {
    freeTrials:
      freeTrials.length > 0 && !isPersonalSpace
        ? freeTrials
        : ([] as FreeTrial[]),
  };
};
