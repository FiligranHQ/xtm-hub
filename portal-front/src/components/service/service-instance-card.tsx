import { SERVICE_CREATION_STATUS } from '@/components/service/service.types';
import { cn } from '@/lib/utils';
import { fromGlobalId } from '@/utils/globalId';
import {
  APP_PATH,
  PUBLIC_CYBERSECURITY_SOLUTIONS_PATH,
} from '@/utils/path/constant';
import { isEnrollmentService, isExternalService } from '@/utils/services';
import { ServiceDefinitionIdentifierEnum } from '@generated/models/ServiceDefinitionIdentifier.enum';
import { ArrowOutwardIcon, LogoFiligranIcon } from 'filigran-icon';
import { AspectRatio } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';

export interface ServiceInstanceCardData {
  id: string;
  creation_status: SERVICE_CREATION_STATUS;
  name: string;
  slug?: string;
  contract?: string;
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

const ServiceInstanceCard: React.FunctionComponent<
  ServiceInstanceCardProps
> = ({ serviceInstance, rightAction, className, seo }) => {
  const t = useTranslations();

  const isDisabled =
    serviceInstance.creation_status === SERVICE_CREATION_STATUS.PENDING;

  const serviceHref =
    isExternalService(serviceInstance.service_definition_identifier) &&
    serviceInstance.url
      ? serviceInstance.url
      : `${seo ? `/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}` : `/${APP_PATH}/service/${serviceInstance.service_definition_identifier}/${serviceInstance.id}`}`;

  return (
    <li className={cn('relative border border-light rounded flex', className)}>
      <div className="z-[2] flex-1 overflow-hidden relative group focus-within:ring-2 focus-within:ring-ring rounded flex flex-col">
        <div className="flex relative justify-center items-center flex-col gap-s bg-blue-900 overflow-hidden box-border px-s">
          <LogoFiligranIcon className="absolute text-white opacity-[0.03] z-1 size-80 rotate-45 -translate-x-24 -translate-y-12" />
          <div className="mt-s flex items-center h-12 w-full">
            <div
              className="w-full h-12"
              style={{
                backgroundImage:
                  serviceInstance.logo_document_id !== null
                    ? `url(/document/images/${serviceInstance.id}/${serviceInstance.logo_document_id})`
                    : '',
                backgroundSize: 'contain',
                backgroundPosition: 'left center',
                backgroundRepeat: 'no-repeat',
              }}
            />
          </div>
          <AspectRatio
            ratio={16 / 9}
            className="rounded-t overflow-hidden">
            {serviceInstance.illustration_document_id && (
              <Image
                fill
                src={`/document/images/${serviceInstance.id}/${serviceInstance.illustration_document_id}`}
                objectPosition="top"
                objectFit="cover"
                alt={`Illustration of ${serviceInstance.name}`}
              />
            )}
          </AspectRatio>
        </div>
        <div className="min-h-40 flex flex-col p-l gap-xs flex-1 bg-page-background group-hover:bg-hover">
          <div className="flex items-center h-12 w-full">
            {rightAction ? (
              <h2>{serviceInstance.name}</h2>
            ) : (
              <Link
                href={isDisabled ? '#' : serviceHref}
                target={serviceHref.startsWith('http') ? '_blank' : '_self'}
                className="focus-visible:outline-none after:cursor-pointer after:content-[' '] after:absolute after:inset-0 z-0 aria-disabled:opacity-60 aria-disabled:after:hidden aria-disabled:cursor-auto"
                aria-disabled={isDisabled}>
                <h2>{serviceInstance.name}</h2>
              </Link>
            )}

            {isExternalService(
              serviceInstance.service_definition_identifier
            ) && <ArrowOutwardIcon className="ml-auto size-3 shrink-0" />}
          </div>
          {(isEnrollmentService(serviceInstance) && (
            <div className="grid grid-cols-3 gap-s">
              <div className="txt-sub-content text-muted-foreground">
                {t('Enroll.Details.InstanceID')}
              </div>
              <div className="txt-sub-content col-span-2">
                {fromGlobalId(serviceInstance.id).id}
              </div>
              <div className="txt-sub-content text-muted-foreground">
                {t('Enroll.Details.InstanceURL')}
              </div>
              <div className="txt-sub-content col-span-2">{serviceHref}</div>
              <div className="txt-sub-content text-muted-foreground">
                {t('Enroll.Details.Contract')}
              </div>
              <div className="txt-sub-content col-span-2">
                {t(`Enroll.Details.Contracts.${serviceInstance.contract}`)}
              </div>
            </div>
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
