import { userServicesOwned_fragment$data } from '../../../../__generated__/userServicesOwned_fragment.graphql';
import { FunctionComponent } from 'react';
import Link from 'next/link';
import { Button } from 'filigran-ui/servers';
import { LinkIcon } from 'lucide-react';
import { ServiceTypeBadge } from '@/components/ui/service-type-badge';

interface ServicesListProps {
  services: userServicesOwned_fragment$data[];
}

export const OwnedServicesList: FunctionComponent<ServicesListProps> = ({
  services,
}) => {
  return (
    <>
      <h2 className="pb-m txt-title">Your services</h2>
      <ul
        className={'grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-m'}>
        {services.map(({ subscription }) => {
          return (
            <li
              className="border-light flex flex-col bg-white p-s"
              key={subscription?.id}>
              <div className="flex-1 p-m pb-xl">
                <div className="flex items-center justify-between">
                  <h3>{subscription?.service?.name}</h3>{' '}
                  <ServiceTypeBadge
                    type={
                      (subscription?.service?.type as ServiceTypeBadge) ??
                      'Intel'
                    }
                  />
                </div>
                <p className={'pt-s txt-sub-content'}>
                  {subscription?.service?.description}
                </p>
              </div>
              <ul className="flex flex-wrap-reverse justify-end gap-s">
                {subscription?.service?.links?.map((link) => (
                  <li key={link?.name}>
                    <Button
                      className={'h-6 bg-gray-100 p-s txt-sub-content'}
                      variant={'ghost'}>
                      <LinkIcon className="mr-3 h-3 w-2" />{' '}
                      <Link href={link?.url ?? ''}>{link?.name}</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </>
  );
};