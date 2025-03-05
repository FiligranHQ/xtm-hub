import {
  SERVICE_CREATION_STATUS,
  SERVICE_DEFINITION_IDENTIFIER,
} from '@/components/service/service.const';
import useDecodedQuery from '@/hooks/useDecodedQuery';
import { cn } from '@/lib/utils';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { LogoFiligranIcon } from 'filigran-icon';
import * as React from 'react';
import { ReactNode } from 'react';

interface ServiceInstanceCardProps {
  serviceInstance: serviceList_fragment$data;
  rightAction?: ReactNode;
}
const ServiceInstanceCard: React.FunctionComponent<
  ServiceInstanceCardProps
> = ({ serviceInstance, rightAction }) => {
  const { h } = useDecodedQuery();
  const isLinkService =
    serviceInstance?.service_definition?.identifier ===
    SERVICE_DEFINITION_IDENTIFIER.LINK;
  const isDisabled =
    serviceInstance?.creation_status === SERVICE_CREATION_STATUS.PENDING ||
    rightAction !== undefined;

  let serviceHref: string | undefined;
  let serviceTarget: string | undefined;
  if (!isDisabled) {
    serviceHref =
      isLinkService && serviceInstance.links?.[0]?.url
        ? serviceInstance.links?.[0]?.url
        : `/service/${serviceInstance.service_definition?.identifier}/${serviceInstance.id}`;
    serviceTarget = serviceInstance.links?.[0]?.url?.startsWith('http')
      ? '_blank'
      : '_self';
  }

  return (
    <li
      className={cn(
        'relative',
        h === serviceInstance?.service_definition?.identifier
          ? "before:content-[''] before:bg-white before:absolute before:-inset-1 before:bg-gradient-to-r before:from-[#001BDA] before:to-[#0FBCFF] dark:from-[#0FBCFF] dark:to-[#00F1BD] before:blur-lg before:opacity-75 before:-z-1 before:rounded-lg"
          : ''
      )}>
      <div className="relative flex justify-center items-center flex-col gap-l bg-blue-900 h-48 w-full box-border pl-s">
        <LogoFiligranIcon className="absolute inset-0 text-white opacity-10 z-0 size-64 rotate-45 blur" />
        <div className="mt-s flex items-center h-12 w-full">
          <div
            className="w-12 h-12"
            style={{
              backgroundImage: `url(/document/visualize/${serviceInstance.id}/${serviceInstance.logo_document_id})`,
              backgroundSize: 'cover',
            }}
          />
          <h3 className="m-l text-white position-relative z-10">
            <a
              href={serviceHref}
              target={serviceTarget}
              className="after:content-[''] after:absolute after:inset-0 aria-disabled:opacity-60 aria-disabled:after:hidden"
              aria-disabled={isDisabled}>
              {serviceInstance.name}
            </a>
          </h3>
        </div>

        <div
          className="mt-auto h-3/4 w-full self-end relative"
          style={{
            backgroundImage: `url(/document/visualize/${serviceInstance.id}/${serviceInstance.illustration_document_id})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            paddingLeft: '20px',
          }}
        />
      </div>
      <div className="h-40 border-light flex flex-col relative border bg-page-background p-l gap-xs">
        <div className="mt-s flex items-center h-12 w-full">
          <h3 className="">{serviceInstance.name}</h3>
          <div
            className="ml-auto w-12 h-12"
            style={{
              backgroundImage: `url(/document/visualize/${serviceInstance.id}/${serviceInstance.logo_document_id})`,
              backgroundSize: 'cover',
            }}
          />
        </div>
        <p className="txt-sub-content">{serviceInstance.description}</p>
        <div className="flex ml-auto">{rightAction}</div>
      </div>
    </li>
  );
};
export default ServiceInstanceCard;
