import { userServicesOwned_fragment$data } from '../../../../__generated__/userServicesOwned_fragment.graphql';
import { FunctionComponent } from 'react';
import Link from 'next/link';
import { Button, buttonVariants } from 'filigran-ui/servers';
import {Ellipsis, LinkIcon} from 'lucide-react';
import { ServiceTypeBadge } from '@/components/ui/service-type-badge';
import * as React from 'react';
import { useTranslations } from 'next-intl';
import {IconActions} from "@/components/ui/icon-actions";
import {cn} from "@/lib/utils";
import useGranted from "@/hooks/useGranted";

interface ServicesListProps {
  services: userServicesOwned_fragment$data[];
}

export const OwnedServicesList: FunctionComponent<ServicesListProps> = ({
  services,
}) => {
    const t = useTranslations();
  return (
    <>

      <h2 className="pb-m">{t('HomePage.YourServices')}</h2>
      <ul
        className={'grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-m'}>
        {services.map(({ subscription, service_capability }) => {
          return (
            <li
              className="border-light flex flex-col rounded border bg-page-background p-s"
              key={subscription?.id}>
              <div className="flex-1 p-m pb-xl flex justify-between items-center gap-s">
                  <h3>{subscription?.service?.name}</h3>{' '}

                  {(service_capability?.some(
                              (capa) => capa?.service_capability_name === 'MANAGE_ACCESS'
                          ) ||
                          useGranted('BYPASS')) && (<IconActions
                      icon={
                          <>
                              <Ellipsis className="h-4 w-4 text-primary rotate-90" />
                              <span className="sr-only">{t('HomePage.OpenManagement')}</span>
                          </>
                      }>
                      <Link className={cn(
                          buttonVariants({
                              variant: 'ghost',
                              className: cn(
                                  'h-9 w-full justify-start rounded-none border-none',

                              ),
                          }))} href={`/admin/service/${subscription?.service?.id}`}>
                          {t('HomePage.Manage')}
                      </Link>

                  </IconActions>)}


              </div>
                <p className={'p-m pb-xl pt-s txt-sub-content'}>
                    {subscription?.service?.description}
                </p>
                <ul className="flex justify-between items-center p-s gap-s flex-row">
                    <li>
                        <ServiceTypeBadge
                            type={(subscription?.service?.type as ServiceTypeBadge) ?? 'Intel'}
                        />
                    </li>
                    {subscription?.service?.links?.map((link) => (
                        <li key={link?.name}>
                            <Button
                                className={
                                    'h-6 bg-gray-100 p-s txt-sub-content dark:bg-gray-800'
                                }
                                variant={'ghost'}>
                                <LinkIcon className="mr-3 h-3 w-2" />
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
