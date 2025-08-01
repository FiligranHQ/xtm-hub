import { cn } from '@/lib/utils';
import {
  APP_PATH,
  PUBLIC_CYBERSECURITY_SOLUTIONS_PATH,
} from '@/utils/path/constant';
import { isEnrollmentService, isExternalService } from '@/utils/services';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { ServiceInstanceCreationStatusEnum } from '@generated/models/ServiceInstanceCreationStatus.enum';
import { ArrowOutwardIcon, LogoFiligranIcon } from 'filigran-icon';
import { AspectRatio } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

export interface ServiceInstanceCardData {
  id: string;
  creation_status: ServiceInstanceCreationStatusEnum;
  name: string;
  slug?: string;
  platform_contract?: string;
  platform_id?: string;
  logo_document_id: string | null;
  illustration_document_id: string | null;
  service_definition_identifier: ServiceDefinitionIdentifierEnum;
  description?: string;
  url?: string;
  ordering: number;
}

interface ServiceInstanceCardProps {
  serviceInstance: ServiceInstanceCardData;
  rightAction?: ReactNode;
  seo?: boolean;
  className?: string;
}

const EnrollmentDetails: React.FunctionComponent<{
  serviceInstance: ServiceInstanceCardData;
  serviceHref: string;
}> = () => {
  const t = useTranslations();
  return (
    <p className="txt-sub-content text-muted-foreground">
      {t('Enroll.Details.Description')}
    </p>
  );

  /* Temporary hidden :

  return (
    <dl className="grid grid-cols-3 gap-s">
      <dt className="txt-sub-content text-muted-foreground">
        {t('Enroll.Details.PlatformID')}
      </dt>
      <dd className="txt-sub-content col-span-2">
        {serviceInstance.platform_id}
      </dd>
      <dt className="txt-sub-content text-muted-foreground">
        {t('Enroll.Details.PlatformURL')}
      </dt>
      <dd className="txt-sub-content col-span-2">{serviceHref}</dd>
      <dt className="txt-sub-content text-muted-foreground">
        {t('Enroll.Details.Contract')}
      </dt>
      <dd className="txt-sub-content col-span-2">
        {t(`Enroll.Details.Contracts.${serviceInstance.platform_contract}`)}
      </dd>
    </dl>
  );*/
};

const ServiceInstanceCard: React.FunctionComponent<
  ServiceInstanceCardProps
> = ({ serviceInstance, rightAction, className, seo }) => {
  const t = useTranslations();
  const isDisabled =
    serviceInstance.creation_status ===
    ServiceInstanceCreationStatusEnum.PENDING;

  const serviceHref =
    isExternalService(serviceInstance.service_definition_identifier) &&
    serviceInstance.url
      ? serviceInstance.url
      : `${seo ? `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}` : `/${APP_PATH}/service/${serviceInstance.service_definition_identifier}/${serviceInstance.id}`}`;

  let backgroundImage =
    serviceInstance.logo_document_id !== null
      ? `url(/document/images/${serviceInstance.id}/${serviceInstance.logo_document_id})`
      : '';

  if (isEnrollmentService(serviceInstance)) {
    backgroundImage = 'url(/octi-private-platform-logo.png)';
  }

  return (
    <li className={cn('relative border border-light rounded flex', className)}>
      <div className="z-[2] flex-1 overflow-hidden relative group focus-within:ring-2 focus-within:ring-ring rounded flex flex-col">
        <div
          className={cn(
            'flex relative justify-center items-center flex-col gap-s overflow-hidden box-border px-s',
            isEnrollmentService(serviceInstance)
              ? 'bg-darkblue-800'
              : 'bg-blue-900'
          )}>
          <LogoFiligranIcon className="absolute text-white opacity-[0.03] z-1 size-60 rotate-45 -translate-x-24 -translate-y-12" />
          <div className="mt-s flex items-center h-12 w-full">
            <div
              className="w-full h-12"
              style={{
                backgroundImage,
                backgroundSize: 'contain',
                backgroundPosition: 'left center',
                backgroundRepeat: 'no-repeat',
              }}
            />
          </div>
          <AspectRatio
            ratio={16 / 9}
            className={cn(
              'rounded-t',
              isEnrollmentService(serviceInstance)
                ? 'overflow-visible'
                : 'overflow-hidden'
            )}>
            {serviceInstance.illustration_document_id && (
              <Image
                fill
                src={`/document/images/${serviceInstance.id}/${serviceInstance.illustration_document_id}`}
                objectPosition="top"
                objectFit="cover"
                alt={`Illustration of ${serviceInstance.name}`}
              />
            )}
            {isEnrollmentService(serviceInstance) && (
              <>
                <Image
                  width="580"
                  height="281"
                  src="/octi-private-platform-illustration.png"
                  priority={false}
                  loading="lazy"
                  alt={`Illustration of ${serviceInstance.name}`}
                  className="absolute bottom-0 right-0 translate-y-1/4 translate-x-1/3 -rotate-45"
                />
                <h3
                  className="text-2xl absolute bottom-0 -translate-y-10 left-0 w-full p-s max-w-[80%]"
                  style={{ textShadow: '1px 1px 1px #000' }}>
                  {serviceInstance.name}
                </h3>
              </>
            )}
          </AspectRatio>
        </div>
        <div className="min-h-40 flex flex-col p-l gap-xs flex-1 bg-page-background group-hover:bg-hover">
          <div className="flex items-start h-12 w-full">
            {rightAction ? (
              <h2>{serviceInstance.name}</h2>
            ) : (
              <Link
                href={isDisabled ? '#' : serviceHref}
                target={serviceHref.startsWith('http') ? '_blank' : '_self'}
                className="focus-visible:outline-none after:cursor-pointer after:content-[' '] after:absolute after:inset-0 z-0 aria-disabled:opacity-60 aria-disabled:after:hidden aria-disabled:cursor-auto"
                aria-disabled={isDisabled}>
                <h2>
                  {serviceInstance.name}
                  {isEnrollmentService(serviceInstance) && (
                    <> - {t('Enroll.Details.PrivatePlatform')}</>
                  )}
                </h2>
              </Link>
            )}

            {isExternalService(
              serviceInstance.service_definition_identifier
            ) && <ArrowOutwardIcon className="ml-auto size-3 shrink-0" />}
          </div>
          {(isEnrollmentService(serviceInstance) && (
            <EnrollmentDetails
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
    </li>
  );
};
export default ServiceInstanceCard;
