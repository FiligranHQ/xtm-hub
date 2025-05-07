import { Combobox } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';
import * as countryData from './data.json';

interface CountryComboboxProps {
  value?: string;
  onValueChange: (value: string | undefined) => void;
}

export const CountryCombobox: React.FC<CountryComboboxProps> = ({
  value,
  onValueChange,
}) => {
  const t = useTranslations();
  const dataTab = useMemo(() => {
    return countryData.countries.sort((a, b) => a.name.localeCompare(b.name));
  }, [countryData]);

  return (
    <Combobox
      dataTab={dataTab}
      placeholder={t('CountryComboBox.Country')}
      order={t('CountryComboBox.Country')}
      onValueChange={(value) => onValueChange(value?.name)}
      onInputChange={() => {}}
      emptyCommand={t('Utils.NotFound')}
      keyValue={'name'}
      keyLabel={'name'}
      value={{ name: value }}
    />
  );
};
