import {
  PlatformMetadataMapping,
  serviceInstanceTagByPlatformIdentifier,
} from '@/components/registration/platform-identifier-mapping';
import { APP_PATH } from '@/utils/path/constant';
import { DeploymentRequestSourceEnum } from '@generated/models/DeploymentRequestSource.enum';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import React from 'react';
import GuardCapacityComponent from '../../../AdminGuard';
import { BreadcrumbNav } from '../../../ui/BreadcrumbNav';
import { RegistrationLearnMore } from '../../registration/RegistrationLearnMore';
import { ReachSalesButton } from '../reach-sales/ReachSalesButton';
import { SlackSupportButton } from '../SlackSupport';
import { StartTrialButton } from '../StartTrialButton';
import { TrialsHeader } from '../TrialsHeader';
import { TrialsLearnMore } from '../TrialsLearnMore';
import PersonalSpaceInfo from './PersonalSpaceInfo';

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
