import ServiceCard from '@/components/service/service-card';
import { Button } from 'filigran-ui';
import { LinkIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FunctionComponent } from 'react';
import { serviceList_fragment$data } from '../../../../__generated__/serviceList_fragment.graphql';
import { userServicesOwned_fragment$data } from '../../../../__generated__/userServicesOwned_fragment.graphql';

interface ServicesListProps {
  services: userServicesOwned_fragment$data[];
}

export const OwnedServicesList: FunctionComponent<ServicesListProps> = ({
  services,
}) => {
  const t = useTranslations();
  const router = useRouter();

  return (
    <>
      <h2 className="pb-m">{t('HomePage.YourServices')}</h2>
      <ul
        className={
          'grid grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-m'
        }>
        {services.map(({ subscription, service_capability, id }) => {
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
                          <LinkIcon className="mr-3 h-3 w-3" /> {link?.name}
                        </Link>
                      </Button>
                    </li>
                  ))}
                </ul>
              }
            />
          );
        })}
      </ul>
    </>
  );
};
