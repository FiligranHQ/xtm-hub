'use client';

import { SERVICE_DEFINITION_IDENTIFIER } from '@/components/service/service.const';
import { serviceList_fragment$data } from '@generated/serviceList_fragment.graphql';
import { userServicesOwned_fragment$data } from '@generated/userServicesOwned_fragment.graphql';
import { LinkIcon } from 'filigran-icon';
import { Button } from 'filigran-ui';
import Link from 'next/link';
import { Suspense } from 'react';
import ServiceInstanceCard from '../service-instance-card';

interface OwnedServicesProps {
  services: userServicesOwned_fragment$data[];
  publicServices: serviceList_fragment$data[];
}

const OwnedServices = ({ services, publicServices }: OwnedServicesProps) => {
  const getAction = (service: serviceList_fragment$data) => {
    if (
      service.service_definition?.identifier ===
      SERVICE_DEFINITION_IDENTIFIER.LINK
    ) {
      const name = service.links?.[0]?.name;
      const url = service.links?.[0]?.url;
      if (name && url)
        return (
          <Button
            className={
              "h-6 bg-gray-100 p-s txt-sub-content dark:bg-gray-800 after:content-[''] after:absolute after:inset-0"
            }
            asChild
            variant="ghost">
            <Link
              href={url}
              target={url.startsWith('http') ? '_blank' : '_self'}>
              <LinkIcon
                aria-hidden={true}
                focusable={false}
                className="mr-3 h-3 w-3"
              />
              {name}
            </Link>
          </Button>
        );
    }

    return (
      <ul className="flex space-x-s">
        {service.links?.map((link) => (
          <li key={link?.name}>
            <Button
              className={
                'h-6 bg-gray-100 p-s txt-sub-content dark:bg-gray-800 after:absolute after:inset-0'
              }
              asChild
              variant={'ghost'}>
              <Link
                href={`/service/${service.service_definition?.identifier}/${service.id}`}>
                <LinkIcon
                  aria-hidden={true}
                  focusable={false}
                  className="mr-3 h-3 w-3"
                />
                {link?.name}
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    );
  };

  if (services.length > 0 || publicServices.length > 0)
    return (
      <Suspense>
        <ul
          className={
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-m'
          }>
          {services.map(({ subscription, id }) => {
            return (
              <ServiceInstanceCard
                key={id}
                serviceInstance={
                  subscription!.service_instance as serviceList_fragment$data
                }
                rightLeftAction={getAction(
                  subscription!.service_instance as serviceList_fragment$data
                )}
              />
            );
          })}
          {publicServices.map((service) => (
            <ServiceInstanceCard
              key={service.id}
              rightLeftAction={getAction(service)}
              serviceInstance={service}
            />
          ))}
        </ul>
      </Suspense>
    );
};

export default OwnedServices;
