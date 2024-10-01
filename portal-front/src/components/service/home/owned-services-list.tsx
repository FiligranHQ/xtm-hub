import { userServicesOwned_fragment$data } from '../../../../__generated__/userServicesOwned_fragment.graphql';
import { FunctionComponent } from 'react';
import Link from 'next/link';
import { buttonVariants } from 'filigran-ui/servers';
import {Ellipsis} from 'lucide-react';
import * as React from 'react';
import { useTranslations } from 'next-intl';
import {IconActions} from "@/components/ui/icon-actions";
import {cn} from "@/lib/utils";
import useGranted from "@/hooks/useGranted";
import ServiceCard from "@/components/service/service-card";
import {serviceList_fragment$data} from "../../../../__generated__/serviceList_fragment.graphql";

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
              <ServiceCard action={(service_capability?.some(
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

             </IconActions>)
             } service={subscription?.service as unknown as serviceList_fragment$data}/>

          );
        })}
      </ul>
    </>
  );
};
