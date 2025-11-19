'use client';

import { PortalContext } from '@/components/me/app-portal-context';
import { PlatformUpdateSheet } from '@/components/service/components/platform-update-sheet';
import { IconActions, IconActionsItem } from '@/components/ui/icon-actions';
import { cn } from '@/lib/utils';
import {
  APP_PATH,
  PUBLIC_CYBERSECURITY_SOLUTIONS_PATH,
} from '@/utils/path/constant';
import {
  getDisplayDays,
  isExpired,
  isExternalService,
  isRegistrationService,
  isTrialInstance,
} from '@/utils/services';
import { DeploymentRequestStatusEnum } from '@generated/models/DeploymentRequestStatus.enum';
import { DeploymentTypeEnum } from '@generated/models/DeploymentType.enum';
import { OrganizationCapabilityEnum } from '@generated/models/OrganizationCapability.enum';
import { RestrictionEnum } from '@generated/models/Restriction.enum';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import {
  ArrowOutwardIcon,
  LogoFiligranIcon,
  MoreVertIcon,
} from 'filigran-icon';
import { AspectRatio } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode, useContext, useState } from 'react';

export interface ServiceInstanceCardData {
  id: string;
  isDisabled: boolean;
  name: string;
  slug?: string;
  platform_contract?: string;
  platform_id?: string;
  logo_document_id: string | null;
  illustration_document_id: string | null;
  service_definition_identifier: ServiceDefinitionIdentifierEnum;
  card_background?: string | null;
  description?: string;
  url?: string;
  ordering: number;
  status?: string;
  deployment_request_type?: DeploymentTypeEnum;
  deployment_status?: DeploymentRequestStatusEnum;
  service_instance_status?: string;
  start_date?: Date;
  end_date?: Date;
}

interface ServiceInstanceCardProps {
  serviceInstance: ServiceInstanceCardData;
  rightAction?: ReactNode;
  seo?: boolean;
  className?: string;
}

const RegistrationDetails: React.FunctionComponent<{
  serviceInstance: ServiceInstanceCardData;
  serviceHref: string;
}> = () => {
  const t = useTranslations();
  return (
    <p className="txt-sub-content text-muted-foreground">
      {t('Register.Details.Description')}
    </p>
  );

  /* Temporary hidden :

  return (
    <dl className="grid grid-cols-3 gap-s">
      <dt className="txt-sub-content text-muted-foreground">
        {t('Register.Details.PlatformID')}
      </dt>
      <dd className="txt-sub-content col-span-2">
        {serviceInstance.platform_id}
      </dd>
      <dt className="txt-sub-content text-muted-foreground">
        {t('Register.Details.PlatformURL')}
      </dt>
      <dd className="txt-sub-content col-span-2">{serviceHref}</dd>
      <dt className="txt-sub-content text-muted-foreground">
        {t('Register.Details.Contract')}
      </dt>
      <dd className="txt-sub-content col-span-2">
        {t(`Register.Details.Contracts.${serviceInstance.platform_contract}`)}
      </dd>
    </dl>
  );*/
};

const ServiceInstanceCard: React.FunctionComponent<
  ServiceInstanceCardProps
> = ({ serviceInstance, rightAction, className, seo }) => {
  const t = useTranslations();
  const { hasOrganizationCapability, hasCapability } =
    useContext(PortalContext);

  const serviceHref =
    isExternalService(serviceInstance.service_definition_identifier) &&
    serviceInstance.url
      ? serviceInstance.url
      : `${seo ? `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}` : `/${APP_PATH}/service/${serviceInstance.service_definition_identifier}/${serviceInstance.id}`}`;

  let backgroundImage =
    serviceInstance.logo_document_id !== null
      ? `url(/document/images/${serviceInstance.id}/${serviceInstance.logo_document_id})`
      : '';

  if (isRegistrationService(serviceInstance)) {
    backgroundImage = `url(/${serviceInstance.service_definition_identifier}-private-platform-logo.png)`;
  }

  // Check if user can update platform
  const [openPlatformSheet, setOpenPlatformSheet] = useState(false);

  const canUpdatePlatform = () => {
    if (
      !isRegistrationService(serviceInstance) ||
      isTrialInstance(serviceInstance)
    ) {
      return false;
    }

    // Allow BYPASS users to update platforms
    if (hasCapability && hasCapability(RestrictionEnum.BYPASS)) {
      return true;
    }

    // Check standard organization capabilities
    if (!hasOrganizationCapability) {
      return false;
    }

    // Check ADMINISTRATE_ORGANIZATION capability
    const hasAdminCap = hasOrganizationCapability(
      OrganizationCapabilityEnum.ADMINISTRATE_ORGANIZATION
    );

    if (!hasAdminCap) {
      return false;
    }

    return hasOrganizationCapability(
      OrganizationCapabilityEnum.MANAGE_PLATFORM_REGISTRATION
    );
  };

  return (
    <li className={cn('relative border border-light rounded flex', className)}>
      {isExpired(serviceInstance) && (
        <div className="absolute inset-0 bg-black/60 z-10 rounded pointer-events-none" />
      )}
      <div className="z-[2] flex-1 overflow-hidden relative group focus-within:ring-2 focus-within:ring-ring rounded flex flex-col">
        <div
          className={cn(
            'flex relative justify-center items-center flex-col gap-s overflow-hidden box-border px-s',
            serviceInstance.card_background ?? 'bg-blue-900'
          )}>
          <LogoFiligranIcon className="absolute  opacity-[0.03] z-1 size-60 rotate-45 -translate-x-24 -translate-y-12" />
          <div className="mt-s flex items-center h-12 w-full">
            {isRegistrationService(serviceInstance) &&
            isTrialInstance(serviceInstance) ? (
              <span className="p-s ml-auto rounded from-blue to-turquoise-300 bg-gradient-to-r border-none uppercase text-xs text-black">
                {getDisplayDays(serviceInstance)}
              </span>
            ) : (
              <div
                className="w-full h-12"
                style={{
                  backgroundImage,
                  backgroundSize: 'contain',
                  backgroundPosition: 'left center',
                  backgroundRepeat: 'no-repeat',
                }}
              />
            )}
          </div>
          <AspectRatio
            ratio={16 / 9}
            className={cn(
              'rounded-t',
              isRegistrationService(serviceInstance)
                ? 'overflow-visible'
                : 'overflow-hidden'
            )}>
            {(isRegistrationService(serviceInstance) && (
              <>
                <Image
                  width="580"
                  height="281"
                  src={
                    serviceInstance.illustration_document_id
                      ? `/document/visualize/${serviceInstance.id}/${serviceInstance.illustration_document_id}`
                      : `/${serviceInstance.service_definition_identifier}-private-platform-illustration.png`
                  }
                  priority={false}
                  loading="lazy"
                  alt={`Illustration of ${serviceInstance.name}`}
                  className={
                    !serviceInstance.illustration_document_id
                      ? 'absolute bottom-0 right-0 translate-y-1/4 translate-x-1/3 -rotate-45'
                      : ''
                  }
                  unoptimized={!!serviceInstance.illustration_document_id}
                />
                <h3
                  className="text-2xl absolute bottom-0 -translate-y-10 left-0 w-full p-s max-w-[80%]"
                  style={{ textShadow: '1px 1px 1px #000' }}>
                  {serviceInstance.name}
                </h3>
              </>
            )) ||
              (serviceInstance.illustration_document_id && (
                <Image
                  fill
                  src={`/document/images/${serviceInstance.id}/${serviceInstance.illustration_document_id}`}
                  objectPosition="top"
                  objectFit="cover"
                  alt={`Illustration of ${serviceInstance.name}`}
                />
              ))}
          </AspectRatio>
        </div>
        <div className="min-h-40 flex flex-col p-l gap-l flex-1 bg-page-background group-hover:bg-hover">
          <div className="flex items-start min-h-12 w-full text-ellipsis overflow-hidden">
            {rightAction ? (
              <h2>{serviceInstance.name}</h2>
            ) : (
              <Link
                href={serviceInstance.isDisabled ? '#' : serviceHref}
                target={serviceHref.startsWith('http') ? '_blank' : '_self'}
                className="focus-visible:outline-none after:cursor-pointer after:content-[' '] after:absolute after:inset-0 z-0 aria-disabled:opacity-60 aria-disabled:after:hidden aria-disabled:cursor-auto"
                aria-disabled={serviceInstance.isDisabled}>
                <h2>
                  {serviceInstance.name}
                  {isRegistrationService(serviceInstance) && (
                    <> - {t('Register.Details.PrivatePlatform')}</>
                  )}
                </h2>
              </Link>
            )}

            <div className="flex pl-s ml-auto gap-m items-start">
              {isExternalService(
                serviceInstance.service_definition_identifier
              ) &&
                !isTrialInstance(serviceInstance) && (
                  <div className="pt-2">
                    <ArrowOutwardIcon className="size-3 shrink-0" />
                  </div>
                )}
              {canUpdatePlatform() && (
                <div className="relative">
                  <IconActions
                    icon={
                      <>
                        <MoreVertIcon className="h-4 w-4 text-white" />
                        <span className="sr-only">{t('Utils.OpenMenu')}</span>
                      </>
                    }>
                    <IconActionsItem onClick={() => setOpenPlatformSheet(true)}>
                      {t('Platform.Update')}
                    </IconActionsItem>
                  </IconActions>
                </div>
              )}
            </div>
          </div>
          {(isRegistrationService(serviceInstance) && (
            <RegistrationDetails
              serviceInstance={serviceInstance}
              serviceHref={serviceHref}
            />
          )) || (
            <p className="txt-sub-content text-muted-foreground">
              {serviceInstance.description}
            </p>
          )}
          {rightAction && (
            <div
              className="flex pt-s mt-auto ml-auto
          [&>button]:focus-visible:outline-none [&>button]:after:cursor-pointer [&>button]:after:content-[' '] [&>button]:after:absolute [&>button]:after:inset-0">
              {rightAction}
            </div>
          )}
        </div>
      </div>
      {canUpdatePlatform() && (
        <PlatformUpdateSheet
          serviceInstance={serviceInstance}
          open={openPlatformSheet}
          setOpen={setOpenPlatformSheet}
        />
      )}
    </li>
  );
};
export default ServiceInstanceCard;
