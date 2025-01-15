'use client';

import { portalContext } from '@/components/portal-context';
import { LinkIcon } from 'filigran-icon';
import { Button } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Suspense, useContext } from 'react';
import { serviceList_fragment$data } from '../../../../__generated__/serviceList_fragment.graphql';
import { userServicesOwned_fragment$data } from '../../../../__generated__/userServicesOwned_fragment.graphql';
import ServiceCard from '../service-card';
import { PublicService } from '../service.const';

interface OwnedServicesProps {
  services: userServicesOwned_fragment$data[];
  publicServices: PublicService[];
}

const OwnedServices = ({ services, publicServices }: OwnedServicesProps) => {
  const t = useTranslations();
  const { isPersonalSpace } = useContext(portalContext);

  const getAction = (service: PublicService) => {
    if (service.type === 'link') {
      const name = service.links?.[0]?.name;
      const url = service.links?.[0]?.url;
      if (name && url)
        return (
          <Button
            className="h-6 bg-gray-100 p-s txt-sub-content dark:bg-gray-800"
            asChild
            variant="ghost">
            <Link href={url}>
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
        <h2 className="pb-m">{t('HomePage.YourServices')}</h2>
        <ul
          className={
            'grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-m'
          }>
          {!isPersonalSpace &&
            services.map(({ subscription, id }) => {
              return (
                <ServiceCard
                  serviceLink={`/service/vault/${subscription?.service?.id}`}
                  key={id}
                  service={
                    subscription?.service as unknown as serviceList_fragment$data
                  }
                  bottomLeftAction={
                    <ul className="flex space-x-s">
                      {subscription?.service?.links?.map((link) => (
                        <li key={link?.name}>
                          <Button
                            className={
                              'h-6 bg-gray-100 p-s txt-sub-content dark:bg-gray-800'
                            }
                            asChild
                            variant={'ghost'}>
                            <Link
                              href={`/service/vault/${subscription?.service?.id}`}>
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
            <ServiceCard
              key={service.id}
              bottomLeftAction={getAction(service)}
              service={service}
              serviceLink={service.links?.[0]?.url}
            />
          ))}
        </ul>
      </Suspense>
    );
};

export default OwnedServices;
