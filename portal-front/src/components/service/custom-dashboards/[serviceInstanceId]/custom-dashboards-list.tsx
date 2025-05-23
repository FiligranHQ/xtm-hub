import { getLabels } from '@/components/admin/label/label.utils';
import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import { SearchInput } from '@/components/ui/search-input';
import useServiceCapability from '@/hooks/useServiceCapability';
import { debounceHandleInput } from '@/utils/debounce';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import {
  customDashboardsItem_fragment$data,
  customDashboardsItem_fragment$key,
} from '@generated/customDashboardsItem_fragment.graphql';
import { customDashboardsList$key } from '@generated/customDashboardsList.graphql';
import { customDashboardsQuery } from '@generated/customDashboardsQuery.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { MultiSelectFormField } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
import {
  PreloadedQuery,
  readInlineData,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';
import {
  customDashboardsFragment,
  customDashboardsItem,
  CustomDashboardsListQuery,
} from '../custom-dashboard.graphql';
import CustomDashboardCard from './custom-dashboard-card';
import CustomDashboardsListButtons from './custom-dashboards-list-buttons';

interface CustomDashboardsListProps {
  queryRef: PreloadedQuery<customDashboardsQuery>;
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
  labels?: string[];
  search: string;
  onSearchChange: (v: string) => void;
  onLabelFilterChange: (v: string[]) => void;
}

const CustomDashboardsList = ({
  queryRef,
  serviceInstance,
  search,
  onSearchChange,
  onLabelFilterChange,
  labels,
}: CustomDashboardsListProps) => {
  const t = useTranslations();
  const queryData = usePreloadedQuery<customDashboardsQuery>(
    CustomDashboardsListQuery,
    queryRef
  );

  const [data] = useRefetchableFragment<
    customDashboardsQuery,
    customDashboardsList$key
  >(customDashboardsFragment, queryData);
  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upload,
    serviceInstance
  );

const [active, nonActive] = useMemo(() => {
  return data?.customDashboards.edges.reduce<
    [
      customDashboardsItem_fragment$data[],
      customDashboardsItem_fragment$data[],
    ]
  >(
    ([activeItems, nonActiveItems], { node }) => {
      const customDashboard =
        readInlineData<customDashboardsItem_fragment$key>(
          customDashboardsItem,
          node
        );

      if (customDashboard.active) {
      return [
        [...activeItems, customDashboard], 
        nonActiveItems
      ];
    } else {
      return [
        activeItems, 
        [...nonActiveItems, customDashboard]
      ];
    },
    [[], []]
  );
}, [data]);

  const firstCustomDashboard = nonActive.length > 0 ? nonActive[0] : active[0];

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
          <CustomDashboardsListButtons
            serviceInstance={serviceInstance}
            subscriptionId={firstCustomDashboard?.subscription?.id ?? ''}
            connectionId={data!.customDashboards!.__id}
          />
        </div>
      </div>
      {userCanUpdate && nonActive.length > 0 && (
        <>
          <div className="txt-category">{t('Service.CsvFeed.NonActive')}:</div>
          <ul
            className={
              'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-l'
            }>
            {nonActive.map((doc) => (
              <CustomDashboardCard
                connectionId={data.customDashboards!.__id}
                key={doc.id}
                customDashboard={doc}
                serviceInstance={serviceInstance}
                detailUrl={`/service/custom_dashboards/${serviceInstance.id}/${doc.id}`}
                shareLinkUrl={`${window.location.origin}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${doc.slug}`}
              />
            ))}
          </ul>
          {active.length > 0 && (
            <div className="txt-category">{t('Service.CsvFeed.Active')}:</div>
          )}
        </>
      )}
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-l">
        {active.map((doc) => (
          <CustomDashboardCard
            connectionId={data.customDashboards!.__id}
            key={doc.id}
            customDashboard={doc}
            serviceInstance={serviceInstance}
            detailUrl={`/service/custom_dashboards/${serviceInstance.id}/${doc.id}`}
            shareLinkUrl={`${window.location.origin}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${doc.slug}`}
          />
        ))}
      </ul>
    </div>
  );
};

export default CustomDashboardsList;
