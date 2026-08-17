import countryData from '@/components/ui/country/data.json';
import { Combobox } from '@filigran/ui';
import { useTranslate } from '@tolgee/react';
import { useMemo } from 'react';
interface CountryComboboxProps {
  value?: { name: string } | undefined;
  onValueChange: (value: { name: string } | undefined) => void;
}

export const CountryCombobox = ({
  value,
  onValueChange,
}: CountryComboboxProps) => {
  const { t } = useTranslate();
  const { countries } = countryData;
  const dataTab = useMemo(() => {
    return countries.sort((a, b) => a.name.localeCompare(b.name));
  }, [countries]);

  return (
    <Combobox
      dataTab={dataTab}
      placeholder={t('CountryComboBox_Placeholder')}
      order={t('CountryComboBox_Placeholder')}
      onValueChange={onValueChange}
      onInputChange={() => {}}
      emptyCommand={t('Utils_NotFound')}
      keyValue={'name'}
      keyLabel={'name'}
      value={value}
    />
  );
};
