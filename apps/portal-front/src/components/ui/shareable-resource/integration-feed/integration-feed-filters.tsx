import { ServiceListFilterContainer } from '@/components/service/components/service-list-filter-container';
import { IntegrationFeedTypeEnum } from '@generated/models/IntegrationFeedType.enum';
import { MultiSelectFormField } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import React, { useMemo } from 'react';

interface Props {
  onIntegrationFeedTypeChange: (v: IntegrationFeedTypeEnum[]) => void;
}

export const IntegrationFeedFilters: React.FC<Props> = ({
  onIntegrationFeedTypeChange,
}) => {
  const t = useTranslations();
  const options = useMemo(() => {
    return Object.values(IntegrationFeedTypeEnum)
      .map((opt) => ({
        label: t(`Service.OpenctiIntegrationFeeds.Filter.Type.${opt}`),
        value: opt,
        disabled: true,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [IntegrationFeedTypeEnum]);

  return (
    <>
      <ServiceListFilterContainer>
        <MultiSelectFormField
          options={options}
          placeholder={t(
            'Service.OpenctiIntegrationFeeds.Filter.Type.Placeholder'
          )}
          noResultString={t('Utils.NotFound')}
          onValueChange={(values) =>
            onIntegrationFeedTypeChange(values as IntegrationFeedTypeEnum[])
          }
          variant="inverted"
        />
      </ServiceListFilterContainer>
    </>
  );
};
