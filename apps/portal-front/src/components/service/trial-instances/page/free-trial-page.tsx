import GuardCapacityComponent from '@/components/admin-guard';
import {
  PlatformMetadataMapping,
  serviceInstanceTagByPlatformIdentifier,
} from '@/components/registration/platform-identifier-mapping';
import { RegistrationLearnMore } from '@/components/service/registration/registration-learn-more';
import PersonalSpaceInfo from '@/components/service/trial-instances/page/personal-space-info';
import { ReachSalesButton } from '@/components/service/trial-instances/reach-sales/reach-sales-button';
import { SlackSupportButton } from '@/components/service/trial-instances/slack-support';
import { StartTrialButton } from '@/components/service/trial-instances/start-trial-button';
import { TrialsHeader } from '@/components/service/trial-instances/trials-header';
import { TrialsLearnMore } from '@/components/service/trial-instances/trials-learn-more';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { APP_PATH } from '@/utils/path/constant';
import { DeploymentRequestSourceEnum } from '@generated/models/DeploymentRequestSource.enum';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import React from 'react';

interface Props {
  platformIdentifier: PlatformIdentifierEnum;
  openTrialForm: boolean;
  source: DeploymentRequestSourceEnum;
}

const FreeTrialPage: React.FC<Props> = ({
  platformIdentifier,
  openTrialForm,
  source,
}) => {
  const platformName = PlatformMetadataMapping[platformIdentifier].name;
  const serviceInstanceTag =
    serviceInstanceTagByPlatformIdentifier[platformIdentifier];

  const breadcrumbs = [
    {
      label: 'MenuLinks.Home',
      href: `/${APP_PATH}`,
    },
    {
      label: `${platformName} Trial platform`,
      original: true,
    },
  ];

  return (
    <>
      <BreadcrumbNav value={breadcrumbs} />
      <TrialsHeader
        platformIdentifier={platformIdentifier}
        actions={
          <>
            <SlackSupportButton />
            <ReachSalesButton
              variant="outline-primary"
              platformIdentifier={platformIdentifier}
            />
            <GuardCapacityComponent
              shouldNotBePersonalSpace
              capacityRestriction={[
                OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION,
                OrganizationCapabilityEnum.MANAGE_PLATFORM_REGISTRATION,
              ]}>
              <StartTrialButton
                openForm={openTrialForm}
                platformIdentifier={platformIdentifier}
                source={source}
              />
            </GuardCapacityComponent>
          </>
        }
      />
      <PersonalSpaceInfo />
      <TrialsLearnMore platformIdentifier={platformIdentifier} />
      <RegistrationLearnMore serviceInstanceTag={serviceInstanceTag} />
    </>
  );
};

export default FreeTrialPage;
