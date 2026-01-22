import { PortalContext } from '@/components/me/app-portal-context';
import { translateServiceDefinitionIdentifier } from '@/components/registration/platform-identifier-mapping';
import { registeredPlatformByServiceInstanceIdFragment } from '@/components/registration/register/register.graphql';
import { PlatformUpdateSheet } from '@/components/service/components/platform-update-sheet';
import { TrialsManageUsersDialog } from '@/components/service/trial-instances/manage-users/trials-manage-users-dialog';
import { TrialCancelSheet } from '@/components/service/trial-instances/trial-cancel-sheet';
import { formatDate } from '@/utils/date';
import { formatTitleCase } from '@/utils/format/case';
import { Button } from '@filigran/ui/servers';
import { DeploymentRequestHubStatusEnum } from '@generated/models/DeploymentRequestHubStatus.enum';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { PlatformContractEnum } from '@generated/models/PlatformContract.enum';
import { RestrictionEnum } from '@generated/models/Restriction.enum';
import { registeredPlatformByServiceInstanceId_fragment$key } from '@generated/registeredPlatformByServiceInstanceId_fragment.graphql';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React, { useContext, useState } from 'react';
import { useFragment } from 'react-relay';

interface Props {
  registeredPlatform: registeredPlatformByServiceInstanceId_fragment$key;
}

export const RegistrationDetails: React.FC<Props> = ({
  registeredPlatform,
}) => {
  const t = useTranslations();
  const [openPlatformSheet, setOpenPlatformSheet] = useState(false);
  const [openCancelSheet, setOpenCancelSheet] = useState(false);

  const { hasOrganizationCapability, hasCapability } =
    useContext(PortalContext);

  const canUpdatePlatform: boolean =
    // Allow BYPASS users to update platforms
    !!hasCapability?.(RestrictionEnum.BYPASS) ||
    // Check standard organization capabilities
    (!!hasOrganizationCapability &&
      hasOrganizationCapability(
        OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION
      ) &&
      hasOrganizationCapability(
        OrganizationCapabilityEnum.MANAGE_PLATFORM_REGISTRATION
      ));

  const platform =
    useFragment<registeredPlatformByServiceInstanceId_fragment$key>(
      registeredPlatformByServiceInstanceIdFragment,
      registeredPlatform
    );

  const isCancellable =
    platform.deployment_request &&
    ![
      DeploymentRequestHubStatusEnum.EXPIRED,
      DeploymentRequestHubStatusEnum.CANCELLED,
    ].includes(
      platform.deployment_request?.hub_status as DeploymentRequestHubStatusEnum
    );

  const isCancellationDefinitive =
    DeploymentRequestHubStatusEnum.ACTIVE ===
    (platform.deployment_request?.hub_status as DeploymentRequestHubStatusEnum);

  const isTrial = platform.contract === PlatformContractEnum.TRIAL;
  const serviceInstanceId = platform.subscription?.service_instance?.id;
  const displayUpdatePlatform =
    canUpdatePlatform && !isTrial && serviceInstanceId;

  const displayedIdentifier = translateServiceDefinitionIdentifier(
    platform.identifier
  );

  const displayAccessPlatformButtonForTrial =
    platform.url &&
    platform.deployment_request?.hub_status ===
      DeploymentRequestHubStatusEnum.ACTIVE;

  return (
    <section className="flex justify-between p-xl border border-solid border-blue rounded">
      <ul className="text-sm flex flex-col gap-l">
        {platform.title && (
          <li>
            <span className="text-gray/60">Platform name:</span>{' '}
            {platform.title}
          </li>
        )}
        {platform.deployment_request?.hub_status && (
          <li>
            <span className="text-gray/60">Status:</span>{' '}
            {formatTitleCase(platform.deployment_request?.hub_status)}
            {isCancellable && (
              <Button
                variant="link-destructive"
                onClick={() => setOpenCancelSheet(true)}>
                {t('Utils.Cancel')}
              </Button>
            )}
          </li>
        )}
        {isTrial ? (
          <>
            <li>
              <span className="text-gray/60">Start date:</span>{' '}
              {platform.subscription?.start_date &&
              platform.subscription.end_date
                ? formatDate(platform.subscription.start_date)
                : '-'}
            </li>
            <li>
              <span className="text-gray/60">End date:</span>{' '}
              {platform.subscription?.end_date
                ? formatDate(platform.subscription?.end_date)
                : '-'}
            </li>
          </>
        ) : (
          <>
            <li>
              <span className="text-gray/60">Registered on:</span>{' '}
              {platform.subscription?.start_date
                ? formatDate(platform.subscription.start_date)
                : '-'}
            </li>
          </>
        )}

        {platform.deployment_request?.region && (
          <li>
            <span className="text-gray/60">Region:</span>{' '}
            {t(`Region.${platform.deployment_request.region.toUpperCase()}`)}
          </li>
        )}
        <li>
          <span className="text-gray/60">License:</span> Enterprise Edition
        </li>
      </ul>

      <div className="flex flex-col gap-m">
        {(displayAccessPlatformButtonForTrial || !isTrial) && (
          <Button>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={platform.url}>
              Access {displayedIdentifier}
            </Link>
          </Button>
        )}

        {displayAccessPlatformButtonForTrial && isTrial && (
          <TrialsManageUsersDialog platform={platform} />
        )}
        {displayUpdatePlatform && (
          <Button
            variant="outline-primary"
            onClick={() => setOpenPlatformSheet(true)}>
            {t('Platform.Update')}
          </Button>
        )}
      </div>

      {displayUpdatePlatform && (
        <PlatformUpdateSheet
          serviceInstanceId={serviceInstanceId}
          serviceInstanceName={platform.title}
          serviceDefinitionIdentifier={platform.identifier}
          open={openPlatformSheet}
          setOpen={setOpenPlatformSheet}
        />
      )}
      {platform.deployment_request && (
        <TrialCancelSheet
          deploymentRequestId={platform.deployment_request.id}
          isCancellationDefinitive={isCancellationDefinitive}
          open={openCancelSheet}
          setOpen={setOpenCancelSheet}
        />
      )}
    </section>
  );
};
