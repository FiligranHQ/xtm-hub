import { Combobox } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';
import * as countryData from './data.json';

interface CountryComboboxProps {
  value?: { name: string } | undefined;
  onValueChange: (value: { name: string } | undefined) => void;
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
      placeholder={t('CountryComboBox.Placeholder')}
      order={t('CountryComboBox.Placeholder')}
      onValueChange={onValueChange}
      onInputChange={() => {}}
      emptyCommand={t('Utils.NotFound')}
      keyValue={'name'}
      keyLabel={'name'}
      value={value}
    />
  );
};
