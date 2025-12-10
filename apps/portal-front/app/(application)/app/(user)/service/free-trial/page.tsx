import GuardCapacityComponent from '@/components/admin-guard';
import { ContactUsButton } from '@/components/service/trial-instances/contact-us-button';
import {
  StartTrialButton,
  StartTrialButtonVariant,
} from '@/components/service/trial-instances/start-trial-button';
import { TrialDetails } from '@/components/service/trial-instances/trial-details';
import { TrialsHeader } from '@/components/service/trial-instances/trials-header';
import { TrialsLearnMore } from '@/components/service/trial-instances/trials-learn-more';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { serverFetchGraphQL } from '@/relay/serverPortalApiFetch';
import { APP_PATH } from '@/utils/path/constant';
import { DeploymentRequestDeploymentTypeEnum } from '@generated/models/DeploymentRequestDeploymentType.enum';
import { DeploymentRequestHubStatusEnum } from '@generated/models/DeploymentRequestHubStatus.enum';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { trials_fragment$data } from '@generated/trials_fragment.graphql';
import TrialsOrganizationDeploymentRequestQueryGraphql, {
  trialsOrganizationDeploymentRequestQuery,
} from '@generated/trialsOrganizationDeploymentRequestQuery.graphql';
import React from 'react';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const Page: React.FC<Props> = async ({ searchParams }) => {
  const openTrialFormSearchParams = (await searchParams).openForm;
  const openTrialForm =
    !!openTrialFormSearchParams && !Array.isArray(openTrialFormSearchParams);

  const breadcrumbs = [
    {
      label: 'MenuLinks.Home',
      href: `/${APP_PATH}`,
    },
    {
      label: 'OpenCTI Trial platform',
      original: true,
    },
  ];

  const response =
    await serverFetchGraphQL<trialsOrganizationDeploymentRequestQuery>(
      TrialsOrganizationDeploymentRequestQueryGraphql,
      {
        hubStatus: DeploymentRequestHubStatusEnum.QUEUED,
        platformIdentifier: PlatformIdentifierEnum.OPENCTI,
        type: DeploymentRequestDeploymentTypeEnum.TRIAL,
      }
    );

  const trial = response.data.organizationDeploymentRequest as unknown as
    | trials_fragment$data
    | undefined;

  return (
    <>
      <BreadcrumbNav value={breadcrumbs} />

      <TrialsHeader
        actions={
          <>
            <ContactUsButton variant="outline-primary" />
            <GuardCapacityComponent
              shouldNotBePersonalSpace
              capacityRestriction={[
                OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION,
                OrganizationCapabilityEnum.MANAGE_PLATFORM_REGISTRATION,
              ]}>
              <StartTrialButton
                variant={StartTrialButtonVariant.Gradient}
                openForm={openTrialForm}
              />
            </GuardCapacityComponent>
          </>
        }
      />
      {trial && (
        <TrialDetails
          hubStatus={trial.hub_status}
          region={trial.region}
        />
      )}
      <TrialsLearnMore />
    </>
  );
};

export default Page;
