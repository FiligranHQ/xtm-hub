import { getLabels } from '@/components/admin/label/label.utils';
import {
  csvFeedsFragment,
  csvFeedsItem,
  CsvFeedsListQuery,
} from '@/components/service/csv-feeds/csv-feed.graphql';

import { SearchInput } from '@/components/ui/search-input';
import { debounceHandleInput } from '@/utils/debounce';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import {
  csvFeedsItem_fragment$data,
  csvFeedsItem_fragment$key,
} from '@generated/csvFeedsItem_fragment.graphql';
import { MultiSelectFormField } from 'filigran-ui';

import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import CsvFeedCard from '@/components/service/csv-feeds/[serviceInstanceId]/csv-feed-card';
import CsvFeedButtons from '@/components/service/csv-feeds/[serviceInstanceId]/csv-feeds-list-buttons';
import { SettingsContext } from '@/components/settings/env-portal-context';
import useServiceCapability from '@/hooks/useServiceCapability';
import { csvFeedsList$key } from '@generated/csvFeedsList.graphql';
import { csvFeedsQuery } from '@generated/csvFeedsQuery.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { useTranslations } from 'next-intl';
import { useContext, useMemo } from 'react';
import {
  PreloadedQuery,
  readInlineData,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';

interface CsvFeedsListProps {
  queryRef: PreloadedQuery<csvFeedsQuery>;
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
  labels?: string[];
  search: string;
  onSearchChange: (v: string) => void;
  onLabelFilterChange: (v: string[]) => void;
}

const CsvFeedsList = ({
  queryRef,
  serviceInstance,
  search,
  onSearchChange,
  onLabelFilterChange,
  labels,
}: CsvFeedsListProps) => {
  const t = useTranslations();
  const { settings } = useContext(SettingsContext);

  const queryData = usePreloadedQuery<csvFeedsQuery>(
    CsvFeedsListQuery,
    queryRef
  );

  const [data] = useRefetchableFragment<csvFeedsQuery, csvFeedsList$key>(
    csvFeedsFragment,
    queryData
  );
  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upload,
    serviceInstance
  );

  const [active, draft] = useMemo(() => {
    return data?.csvFeeds.edges.reduce<
      [csvFeedsItem_fragment$data[], csvFeedsItem_fragment$data[]]
    >(
      (acc, { node }) => {
        const csvFeed = readInlineData<csvFeedsItem_fragment$key>(
          csvFeedsItem,
          node
        );

        if (csvFeed.active) {
          acc[0].push(csvFeed);
        } else {
          acc[1].push(csvFeed);
        }
        return acc;
      },
      [[], []]
    );
  }, [data]);

  const firstCsvFeed = draft.length > 0 ? draft[0] : active[0];

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
          <CsvFeedButtons
            serviceInstance={serviceInstance}
            firstCsvFeedSubscriptionId={firstCsvFeed?.subscription?.id ?? ''}
            connectionId={data.csvFeeds!.__id}
          />
        </div>
      </div>
      {userCanUpdate && draft.length > 0 && (
        <>
          <div className="txt-category">{t('Service.CsvFeed.NonActive')}:</div>
          <ul
            className={
              'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-l'
            }>
            {draft.map((csvFeed) => (
              <CsvFeedCard
                connectionId={data.csvFeeds!.__id}
                key={csvFeed.id}
                csvFeed={csvFeed}
                serviceInstance={serviceInstance}
                detailUrl={`/app/service/${serviceInstance.service_definition!.identifier}/${serviceInstance.id}/${csvFeed.id}`}
                shareLinkUrl={`${settings!.base_url_front}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${csvFeed.slug}`}
              />
            ))}
          </ul>
          {active.length > 0 && (
            <div className="txt-category">{t('Service.CsvFeed.Active')}:</div>
          )}
        </>
      )}
      <ul
        className={
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-l'
        }>
        {active.map((csvFeed) => (
          <CsvFeedCard
            key={csvFeed.id}
            csvFeed={csvFeed}
            connectionId={data.csvFeeds!.__id}
            serviceInstance={serviceInstance}
            detailUrl={`/app/service/${serviceInstance.service_definition!.identifier}/${serviceInstance.id}/${csvFeed.id}`}
            shareLinkUrl={`${settings!.base_url_front}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${csvFeed.slug}`}
          />
        ))}
      </ul>
    </div>
  );
};

export default CsvFeedsList;
