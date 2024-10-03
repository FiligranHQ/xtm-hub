import { userServicesOwned_fragment$data } from '../../../../__generated__/userServicesOwned_fragment.graphql';
import { FunctionComponent } from 'react';
import Link from 'next/link';
import {Button, buttonVariants} from 'filigran-ui/servers';
import {Ellipsis, LinkIcon, MoreVertical} from 'lucide-react';
import * as React from 'react';
import { useTranslations } from 'next-intl';
import {IconActions} from "@/components/ui/icon-actions";
import {cn} from "@/lib/utils";
import useGranted from "@/hooks/useGranted";
import ServiceCard from "@/components/service/service-card";
import {serviceList_fragment$data} from "../../../../__generated__/serviceList_fragment.graphql";
import {MoreVertIcon} from "filigran-icon";

interface ServicesListProps {
  services: userServicesOwned_fragment$data[];
}

export const OwnedServicesList: FunctionComponent<ServicesListProps> = ({
  services,
}) => {
    const t = useTranslations();

    console.log("services", services)
  return (
    <>
      <h2 className="pb-m">{t('HomePage.YourServices')}</h2>
      <ul
        className={'grid grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-m'}>
        {services.map(({ subscription, service_capability }) => {
          return (
              <ServiceCard topRightAction={(service_capability?.some(
                     (capa) => capa?.service_capability_name === 'MANAGE_ACCESS'
                 ) ||
                 useGranted('BYPASS')) && (<IconActions
                 icon={
                     <>
                         <MoreVertIcon className="h-4 w-4 text-primary" />
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

             </IconActions>)
              } service={subscription?.service as unknown as serviceList_fragment$data} bottomLeftAction={<ul className="flex space-x-s"> {subscription?.service?.links?.map((link) => (
                  <li key={link?.name}>
                      <Button
                          className={
                              'h-6 bg-gray-100 p-s txt-sub-content dark:bg-gray-800'
                          }
                          variant={'ghost'}>
                          <LinkIcon className="mr-3 h-3 w-2" />{' '}
                          <Link href={link?.url ?? ''}>{link?.name}</Link>
                      </Button>
                  </li>))}
              </ul>
              }/>

          );
        })}
      </ul>
    </>
  );
};
