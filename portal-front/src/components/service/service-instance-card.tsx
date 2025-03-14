import {
  SERVICE_CREATION_STATUS,
  SERVICE_DEFINITION_IDENTIFIER,
} from '@/components/service/service.const';
import { cn } from '@/lib/utils';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { ArrowOutwardIcon, LogoFiligranIcon } from 'filigran-icon';
import Link from 'next/link';
import * as React from 'react';
import { ReactNode } from 'react';

interface ServiceInstanceCardProps {
  serviceInstance: serviceList_fragment$data;
  rightAction?: ReactNode;
  h?: string | null;
  seo?: boolean;
}
const ServiceInstanceCard: React.FunctionComponent<
  ServiceInstanceCardProps
> = ({ serviceInstance, rightAction, h, seo }) => {
  const isLinkService =
    serviceInstance?.service_definition?.identifier ===
    SERVICE_DEFINITION_IDENTIFIER.LINK;
  const isDisabled =
    serviceInstance?.creation_status === SERVICE_CREATION_STATUS.PENDING ||
    rightAction !== undefined;

  const serviceHref =
    isLinkService && serviceInstance.links?.[0]?.url
      ? serviceInstance.links?.[0]?.url
      : `${seo ? `/cybersecurity-solutions/${serviceInstance.slug}` : `/service/${serviceInstance.service_definition?.identifier}/${serviceInstance.id}`}`;

  return (
    <li
      className={cn(
        'relative',
        h === serviceInstance?.service_definition?.identifier
          ? "before:content-[''] before:bg-white before:absolute before:-inset-1 before:bg-gradient-to-r before:from-[#001BDA] before:to-[#0FBCFF] dark:from-[#0FBCFF] dark:to-[#00F1BD] before:blur-lg before:opacity-75 before:-z-1 before:rounded-lg"
          : ''
      )}>
      <div className="relative flex justify-center items-center flex-col gap-s bg-blue-900 h-48 box-border pl-s pr-s z-1">
        <LogoFiligranIcon className="absolute inset-0 text-white opacity-10 z-1 size-64 rotate-45 blur" />

        <div className="mt-s flex items-center h-12 w-full">
          <div
            className="w-full h-12"
            style={{
              backgroundImage: `url(/document/images/${serviceInstance.id}/${serviceInstance.logo_document_id})`,
              backgroundSize: 'contain',
              backgroundPosition: 'left center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        </div>

        <div
          className="h-3/4 w-full"
          style={{
            backgroundImage: `url(/document/images/${serviceInstance.id}/${serviceInstance.illustration_document_id})`,
            backgroundSize: 'cover',
          }}
        />
      </div>
      <div className="relative h-40 border-light flex flex-col border bg-page-background p-l gap-xs z-1">
        <div className="mt-s flex items-center h-12 w-full">
          <h3>
            <Link
              href={isDisabled ? '' : serviceHref}
              target={serviceHref.startsWith('http') ? '_blank' : '_self'}
              className=" after:cursor-pointer after:content-[''] after:absolute after:inset-0 aria-disabled:opacity-60 aria-disabled:after:hidden aria-disabled:cursor-auto"
              aria-disabled={isDisabled}>
              {serviceInstance.name}
            </Link>
          </h3>
          <ArrowOutwardIcon className="ml-auto size-6" />
        </div>
        <p className="txt-sub-content">{serviceInstance.description}</p>
        <div className="flex ml-auto">{rightAction}</div>
      </div>
    </li>
  );
};
export default ServiceInstanceCard;
