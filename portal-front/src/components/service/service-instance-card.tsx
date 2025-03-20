import {
  SERVICE_CREATION_STATUS,
  SERVICE_DEFINITION_IDENTIFIER,
} from '@/components/service/service.const';
import { cn } from '@/lib/utils';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { ArrowOutwardIcon, LogoFiligranIcon } from 'filigran-icon';
import { AspectRatio } from 'filigran-ui/servers';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import { ReactNode } from 'react';

interface ServiceInstanceCardProps {
  serviceInstance: serviceList_fragment$data;
  rightAction?: ReactNode;
  seo?: boolean;
  className?: string;
}
const ServiceInstanceCard: React.FunctionComponent<
  ServiceInstanceCardProps
> = ({ serviceInstance, rightAction, className, seo }) => {
  const isLinkService =
    serviceInstance?.service_definition?.identifier ===
    SERVICE_DEFINITION_IDENTIFIER.LINK;
  const isDisabled =
    serviceInstance?.creation_status === SERVICE_CREATION_STATUS.PENDING;

  const serviceHref =
    isLinkService && serviceInstance.links?.[0]?.url
      ? serviceInstance.links?.[0]?.url
      : `${seo ? `/cybersecurity-solutions/${serviceInstance.slug}` : `/service/${serviceInstance.service_definition?.identifier}/${serviceInstance.id}`}`;

  return (
    <li className={cn('relative border border-light rounded flex', className)}>
      <div className="z-[2] flex-1 overflow-hidden relative group focus-within:ring-2 focus-within:ring-ring rounded flex flex-col">
        <div className=" flex relative justify-center items-center flex-col gap-s bg-blue-900 overflow-hidden box-border px-s">
          <LogoFiligranIcon className="absolute text-white opacity-10 z-1 size-64 rotate-45 blur" />
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
                className="focus-visible:outline-none none after:cursor-pointer after:content-[' '] after:absolute after:inset-0 aria-disabled:opacity-60 aria-disabled:after:hidden aria-disabled:cursor-auto"
                aria-disabled={isDisabled}>
                <h2>{serviceInstance.name}</h2>
              </Link>
            )}

            {isLinkService && (
              <ArrowOutwardIcon className="ml-auto size-3 shrink-0" />
            )}
          </div>
          <p className="txt-sub-content text-muted-foreground">
            {serviceInstance.description}
          </p>
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
