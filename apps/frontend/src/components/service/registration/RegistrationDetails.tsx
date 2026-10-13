import { PortalContext } from '@/components/me/AppPortalContext';
import {
  CONTRACT_LABEL_BY_CONTRACT,
  translateServiceDefinitionIdentifier,
} from '@/components/registration/PlatformIdentifierMapping';
import { registeredPlatformByServiceInstanceIdFragment } from '@/components/registration/register/register.graphql';
import { PlatformUpdateSheet } from '@/components/service/components/PlatformUpdateSheet';
import { UnregisterButton } from '@/components/service/registration/UnregisterButton';
import { useTranslate } from '@/hooks/use-translate';
import { isWithinLastMonths, useDateFormatter } from '@/utils/date';
import { Button } from '@filigran/design-system';
import { registeredPlatformByServiceInstanceId_fragment$key } from '@generated/registeredPlatformByServiceInstanceId_fragment.graphql';
import {
  OrganizationCapability,
  PlatformContract,
  PortalCapability,
} from '@graphql/generated';
import Link from 'next/link';
import { useContext, useState } from 'react';
import { useFragment } from 'react-relay';

interface RegistrationDetailsProps {
  registeredPlatform: registeredPlatformByServiceInstanceId_fragment$key;
}

export const RegistrationDetails = ({
  registeredPlatform,
}: RegistrationDetailsProps) => {
  const t = useTranslate();
  const formatDate = useDateFormatter();

  const [openPlatformSheet, setOpenPlatformSheet] = useState(false);

  const { hasOrganizationCapability, hasCapability } =
    useContext(PortalContext);

  const canUpdatePlatform =
    hasCapability?.(PortalCapability.Bypass) ||
    hasOrganizationCapability?.(
      OrganizationCapability.AdministrateOrganization
    ) ||
    hasOrganizationCapability?.(
      OrganizationCapability.ManagePlatformRegistration
    );

  const platform =
    useFragment<registeredPlatformByServiceInstanceId_fragment$key>(
      registeredPlatformByServiceInstanceIdFragment,
      registeredPlatform
    );

  const isTrial = platform.contract === PlatformContract.Trial;
  const serviceInstanceId = platform.subscription?.service_instance?.id;
  const displayUpdatePlatform =
    canUpdatePlatform && !isTrial && serviceInstanceId;

  const displayedIdentifier = translateServiceDefinitionIdentifier(
    platform.identifier
  );

  const isConnectionStatusOk = isWithinLastMonths(
    new Date(platform.last_connectivity_check),
    1
  );

  return (
    <section className="flex justify-between p-xl border border-solid border-blue rounded">
      <ul className="text-sm flex flex-col gap-l">
        {platform.title && (
          <li>
            <span className="mr-xs">{t('Register.Details.ProductName')}:</span>
            {platform.title}
          </li>
        )}
        <li>
          <span className="mr-xs">{t('Register.Details.ProductURL')}:</span>
          <span>{platform.url ? platform.url : '-'}</span>
        </li>
        {isTrial ? (
          <>
            <li>
              <span className="mr-xs">{t('Register.Details.StartDate')}:</span>
              {platform.subscription?.start_date &&
              platform.subscription.end_date
                ? formatDate(platform.subscription.start_date)
                : '-'}
            </li>
            <li>
              <span className="mr-xs">{t('Register.Details.EndDate')}:</span>
              {platform.subscription?.end_date
                ? formatDate(platform.subscription?.end_date)
                : '-'}
            </li>
          </>
        ) : (
          <>
            <li>
              <span className="mr-xs">
                {t('Register.Details.ConnectedOn')}:
              </span>
              {platform.subscription?.start_date
                ? formatDate(platform.subscription.start_date)
                : '-'}
            </li>
          </>
        )}
        <li>
          <span className="mr-xs">{t('Register.Details.License')}:</span>
          {t(CONTRACT_LABEL_BY_CONTRACT[platform.contract])}
        </li>
        {!isTrial && (
          <>
            <li>
              <span className="mr-xs">
                {t('Register.Details.ConnectionStatus.Title')}:
              </span>
              <span
                className={
                  isConnectionStatusOk
                    ? 'text-alert-success-primary'
                    : 'text-destructive'
                }>
                {isConnectionStatusOk ? (
                  t('Register.Details.ConnectionStatus.Connected')
                ) : (
                  <span>
                    {t('Register.Details.ConnectionStatus.NotConnected')}
                    {'. '}
                  </span>
                )}
              </span>
              {!isConnectionStatusOk && (
                <span>
                  {t('Register.Details.ConnectionStatus.NotConnectedDetails')}
                </span>
              )}
            </li>
            <li>
              <span className="mr-xs">
                {t('Register.Details.LastConnectionCheck')}:
              </span>
              {platform.last_connectivity_check
                ? formatDate(platform.last_connectivity_check)
                : '-'}
            </li>
          </>
        )}
      </ul>

      <div className="flex flex-col gap-m">
        {!isTrial && (
          <Button asChild>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href={platform.url}>
              {t('Register.Details.Access')} {displayedIdentifier}
            </Link>
          </Button>
        )}
        {displayUpdatePlatform && (
          <Button
            priority="secondary"
            onClick={() => setOpenPlatformSheet(true)}>
            {t('Platform.Update')}
          </Button>
        )}
        <UnregisterButton platform={platform} />
      </div>

      {displayUpdatePlatform && (
        <PlatformUpdateSheet
          serviceInstanceId={serviceInstanceId}
          serviceInstanceName={platform.title}
          platformUrl={platform.url}
          serviceDefinitionIdentifier={platform.identifier}
          open={openPlatformSheet}
          setOpen={setOpenPlatformSheet}
        />
      )}
    </section>
  );
};
