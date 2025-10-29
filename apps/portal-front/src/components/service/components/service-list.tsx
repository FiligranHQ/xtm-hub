import { getLabels } from '@/components/admin/label/label.utils';

import { SearchInput } from '@/components/ui/search-input';
import { debounceHandleInput } from '@/utils/debounce';
import {
  APP_PATH,
  PUBLIC_CYBERSECURITY_SOLUTIONS_PATH,
} from '@/utils/path/constant';
import { MultiSelectFormField } from 'filigran-ui';

import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import ServiceCard from '@/components/service/components/service-card';
import { useServiceContext } from '@/components/service/components/service-context';
import ServiceButtons from '@/components/service/components/service-list-buttons';
import { SettingsContext } from '@/components/settings/env-portal-context';
import useServiceCapability from '@/hooks/useServiceCapability';
import { SubscribableResource } from '@/utils/shareable-resources/shareable-resources.types';
import { useTranslations } from 'next-intl';
import { useContext } from 'react';

interface ServiceListProps {
  active: SubscribableResource[];
  draft: SubscribableResource[];
  search: string;
  onSearchChange: (v: string) => void;
  labels?: string[];
  onLabelFilterChange: (v: string[]) => void;
}
const ServiceList = ({
  active,
  draft,
  search,
  onSearchChange,
  labels,
  onLabelFilterChange,
}: ServiceListProps) => {
  const t = useTranslations();
  const { settings } = useContext(SettingsContext);
  const { translationKey, serviceInstance } = useServiceContext();

  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upload,
    serviceInstance
  );

  const firstResource = draft.length > 0 ? draft[0] : active[0];

  const labelOptions = getLabels().map(({ name, id }) => ({
    label: name.toUpperCase(),
    value: id,
  }));
  return (
    <div className="flex flex-col gap-xl">
      <h1>{serviceInstance.name}</h1>
      <div className="flex justify-between gap-s flex-wrap">
        <div className="flex gap-s flex-wrap">
          <SearchInput
            containerClass="w-[20rem] flex-1 max-w-[50%]"
            placeholder={t('GenericActions.Search')}
            defaultValue={search}
            onChange={debounceHandleInput(onSearchChange)}
          />
          <div className="w-[20rem] flex-1 max-w-[50%]">
            <MultiSelectFormField
              options={labelOptions}
              defaultValue={labels}
              placeholder={t('GenericActions.FilterLabels')}
              noResultString={t('Utils.NotFound')}
              onValueChange={onLabelFilterChange}
              variant="inverted"
            />
          </div>
        </div>
        <div className="flex gap-s">
          <ServiceButtons
            firstServiceSubscriptionId={firstResource?.subscription?.id ?? ''}
          />
        </div>
      </div>
      {userCanUpdate && draft.length > 0 && (
        <>
          <div className="txt-category">
            {t(`${translationKey}.NonActive`)}:
          </div>
          <ul
            className={
              'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-l'
            }>
            {draft.map((document) => (
              <ServiceCard
                key={document.id}
                document={document}
                detailUrl={`/${APP_PATH}/service/${serviceInstance.service_definition?.identifier}/${serviceInstance.id}/${document.id}`}
                shareLinkUrl={`${settings!.base_url_front}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
              />
            ))}
          </ul>
          {active.length > 0 && (
            <div className="txt-category">{t(`${translationKey}.Active`)}:</div>
          )}
        </>
      )}
      <ul
        className={
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-l'
        }>
        {active.map((document) => (
          <ServiceCard
            key={document.id}
            document={document}
            detailUrl={`/${APP_PATH}/service/${serviceInstance.service_definition?.identifier}/${serviceInstance.id}/${document.id}`}
            shareLinkUrl={`${settings!.base_url_front}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
          />
        ))}
      </ul>
    </div>
  );
};

export default ServiceList;
