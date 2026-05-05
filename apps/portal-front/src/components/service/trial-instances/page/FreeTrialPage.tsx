import GuardCapacityComponent from '@/components/AdminGuard';
import {
  PlatformMetadataMapping,
  serviceInstanceTagByPlatformIdentifier,
} from '@/components/registration/platform-identifier-mapping';
import { RegistrationLearnMore } from '@/components/service/registration/RegistrationLearnMore';
import PersonalSpaceInfo from '@/components/service/trial-instances/page/PersonalSpaceInfo';
import { ReachSalesButton } from '@/components/service/trial-instances/reach-sales/ReachSalesButton';
import { SlackSupportButton } from '@/components/service/trial-instances/SlackSupport';
import { StartTrialButton } from '@/components/service/trial-instances/StartTrialButton';
import { TrialsHeader } from '@/components/service/trial-instances/TrialsHeader';
import { TrialsLearnMore } from '@/components/service/trial-instances/TrialsLearnMore';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { APP_PATH } from '@/utils/path/constant';
import { DeploymentRequestSourceEnum } from '@generated/models/DeploymentRequestSource.enum';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';

interface FreeTrialPageProps {
  platformIdentifier: PlatformIdentifierEnum;
  openTrialForm: boolean;
  source: DeploymentRequestSourceEnum;
}

const FreeTrialPage = ({
  platformIdentifier,
  openTrialForm,
  source,
}: FreeTrialPageProps) => {
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
