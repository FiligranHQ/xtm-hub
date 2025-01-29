'use client';

import { portalContext } from '@/components/me/portal-context';
import { SERVICE_DEFINITION_IDENTIFIER } from '@/components/service/service.const';
import { LinkIcon } from 'filigran-icon';
import { Button } from 'filigran-ui';
import Link from 'next/link';
import { Suspense, useContext } from 'react';
import { serviceList_fragment$data } from '../../../../__generated__/serviceList_fragment.graphql';
import { userServicesOwned_fragment$data } from '../../../../__generated__/userServicesOwned_fragment.graphql';
import ServiceInstanceCard from '../service-instance-card';

interface OwnedServicesProps {
  services: userServicesOwned_fragment$data[];
  publicServices: serviceList_fragment$data[];
}

const OwnedServices = ({ services, publicServices }: OwnedServicesProps) => {
  const { isPersonalSpace } = useContext(portalContext);

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
  };

  if (services.length > 0 || publicServices.length > 0)
    return (
      <Suspense>
        <ul
          className={
            'grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-m'
          }>
          {!isPersonalSpace &&
            services.map(({ subscription, id }) => {
              return (
                <ServiceInstanceCard
                  key={id}
                  serviceInstance={
                    subscription!.service_instance as serviceList_fragment$data
                  }
                  bottomLeftAction={
                    <ul className="flex space-x-s">
                      {subscription?.service_instance?.links?.map((link) => (
                        <li key={link?.name}>
                          <Button
                            className={
                              'h-6 bg-gray-100 p-s txt-sub-content dark:bg-gray-800 after:absolute after:inset-0'
                            }
                            asChild
                            variant={'ghost'}>
                            <Link
                              href={`/service/${subscription?.service_instance?.service_definition?.identifier}/${subscription?.service_instance?.id}`}>
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
                  }
                />
              );
            })}
          {publicServices.map((service) => (
            <ServiceInstanceCard
              key={service.id}
              bottomLeftAction={getAction(service)}
              serviceInstance={service}
            />
          ))}
        </ul>
      </Suspense>
    );
};

export default OwnedServices;
