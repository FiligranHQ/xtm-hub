import {
  SERVICE_CREATION_STATUS,
  SERVICE_DEFINITION_IDENTIFIER,
} from '@/components/service/service.const';
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
  const isLinkService =
    serviceInstance?.service_definition?.identifier ===
    SERVICE_DEFINITION_IDENTIFIER.LINK;
  const isPending =
    serviceInstance?.creation_status === SERVICE_CREATION_STATUS.PENDING;

  return (
    <li className="relative">
      <a
        href={
          isLinkService && serviceInstance.links?.[0]?.url
            ? serviceInstance.links?.[0]?.url
            : `/service/${serviceInstance.service_definition?.identifier}/${serviceInstance.id}`
        }
        target={
          serviceInstance.links?.[0]?.url?.startsWith('http')
            ? '_blank'
            : '_self'
        }
        className="flex justify-center items-center flex-col gap-l bg-blue-900 h-48 w-full box-border pl-s cursor-pointer aria-disabled:opacity-60 aria-disabled:cursor-not-allowed"
        aria-disabled={isPending}>
        <LogoFiligranIcon className="absolute inset-0 text-white opacity-10 z-0 size-64 rotate-45 blur" />
        <div className="mt-s flex items-center h-12 w-full">
          <div
            className="w-12 h-12"
            style={{
              backgroundImage: `url(/document/visualize/${serviceInstance.id}/${serviceInstance.logo_document_id})`,
              backgroundSize: 'cover',
            }}
          />
          <h3 className="m-l text-white">{serviceInstance.name}</h3>
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
      </a>
      <div
        className="h-40 border-light flex flex-col relative border bg-page-background p-l gap-xs cursor-pointer aria-disabled:opacity-60 aria-disabled:cursor-not-allowed"
        onClick={() => {
          const url = isLinkService
            ? serviceInstance.links?.[0]?.url
            : `/service/${serviceInstance.service_definition?.identifier}/${serviceInstance.id}`;
          if (url) {
            window.open(url, url.startsWith('http') ? '_blank' : '_self');
          }
        }}
        aria-disabled={isPending}>
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
