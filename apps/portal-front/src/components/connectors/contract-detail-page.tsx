import { getBadgesValues } from '@/components/connectors/connector.utils';
import ContractDetailsInformationPage from '@/components/connectors/contract-details';
import BadgeOverflowCounter from '@/components/ui/badge-overflow-counter';
import { BreadcrumbNav } from '@/components/ui/breadcrumb-nav';
import { Contract } from '@/utils/connectors/connector.model';
import { VerifiedIcon } from 'filigran-icon';
import { useTranslations } from 'next-intl';
import React from 'react';

interface ContractDetailPageProps {
  contract: Contract;
}

const ContractDetailPage: React.FC<ContractDetailPageProps> = ({
  contract,
}) => {
  const t = useTranslations();

  const breadcrumbValue = [
    {
      label: 'MenuLinks.Home',
      href: '/',
    },
    {
      label: t('MenuLinks.Connectors'),
      href: `/opencti-connectors`,
      original: true,
    },
    {
      label: `${contract.title}`,
      original: true,
    },
  ];
  return (
    <>
      <BreadcrumbNav value={breadcrumbValue} />
      <div className="w-full">
        <div className="flex flex-row gap-s">
          <div className="w-24 flex-shrink-0 rounded overflow-hidden">
            <img
              src={contract.logo}
              alt={`${contract.title} logo`}
              className="w-full h-full object-contain rounded"
            />
          </div>

          <div className="flex flex-col flex-1 justify-center">
            <div className="flex items-center gap-s">
              <h1 className="text-xl font-semibold">{contract.title}</h1>
              {contract.verified && (
                <div className="flex items-center gap-s py-xs px-l font-semibold bg-green-100 dark:bg-turquoise-900 rounded-lg">
                  <VerifiedIcon className="h-5 w-5 shrink-0 text-green-500" />
                  <div className="text-green-500">{t('Utils.Verified')}</div>
                </div>
              )}
            </div>

            <div className="w-full mt-s mb-xs">
              <BadgeOverflowCounter
                badges={getBadgesValues(contract)}
                className="z-[2]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse lg:flex-row w-full gap-xl mt-l ">
        <div className="flex-[3_3_0%]">
          <h2 className="py-s txt-container-title truncate text-muted-foreground">
            {t('Service.ShareableResources.Details.Overview')}
          </h2>
          <section className="p-l border rounded border-border-light bg-page-background">
            {contract.description}
          </section>
        </div>
        <div className="flex-1">
          <h2 className="py-s txt-container-title truncate text-ellipsis text-muted-foreground">
            {t('Service.ShareableResources.Details.BasicInformation')}
          </h2>
          <section className="flex flex-col space-y-xl p-l border rounded border-border-light bg-page-background ">
            <ContractDetailsInformationPage contract={contract} />
          </section>
        </div>
      </div>
    </>
  );
};

export default ContractDetailPage;
