'use client';
import ConnectorContractCard from '@/components/connectors/connector-contract-card';
import { SearchInput } from '@/components/ui/search-input';
import { isDevelopment } from '@/lib/utils';
import { Contract } from '@/utils/connectors/connector.model';
import { DEBOUNCE_TIME } from '@/utils/constant';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useDebounceCallback } from 'usehooks-ts';

interface ContractDetailsInformationPageProps {
  contracts: Contract[];
}

const ConnectorsList = ({ contracts }: ContractDetailsInformationPageProps) => {
  const t = useTranslations();
  const [filteredContracts, setFilteredContracts] =
    useState<Contract[]>(contracts);

  const handleInputChange = (inputValue: string) => {
    const result = contracts.filter((contract) =>
      contract.title.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredContracts(result);
  };

  const debounceHandleInput = useDebounceCallback(
    (e) => handleInputChange(e.target.value),
    DEBOUNCE_TIME
  );
  const displayOnlyInDev = isDevelopment();
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-l mb-l">
        <div className="md:col-span-1">
          <SearchInput
            containerClass="w-full"
            placeholder={t('Service.Connectors.Search')}
            onChange={debounceHandleInput}
          />
        </div>
        {displayOnlyInDev && (
          <span className="md:col-start-2 lg:col-start-3 self-center md:text-right">
            {t('Service.Connectors.Name')}: {filteredContracts.length}
          </span>
        )}
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-l">
        {filteredContracts.map((contract) => (
          <ConnectorContractCard
            key={contract.slug}
            contract={contract}
          />
        ))}
      </ul>
    </>
  );
};

export default ConnectorsList;
