import { getLabels } from '@/components/admin/label/label.utils';
import {
  csvFeedItem,
  csvFeedsFragment,
  CsvFeedsListQuery,
} from '@/components/service/csv_feed/[serviceInstanceId]/csv-feed.graphql';

import { SearchInput } from '@/components/ui/search-input';
import ShareableResourceCard from '@/components/ui/shareable-resource-card';
import { debounceHandleInput } from '@/utils/debounce';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import {
  csvFeedItem_fragment$data,
  csvFeedItem_fragment$key,
} from '@generated/csvFeedItem_fragment.graphql';
import { MultiSelectFormField } from 'filigran-ui';

import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import CsvFeedButtons from '@/components/service/csv_feed/[serviceInstanceId]/csv-feeds-list-buttons';
import DocumentBento from '@/components/ui/document-bento';
import useServiceCapability from '@/hooks/useServiceCapability';
import { csvFeedsList$key } from '@generated/csvFeedsList.graphql';
import { csvFeedsQuery } from '@generated/csvFeedsQuery.graphql';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';
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

  const [active, _nonActive] = useMemo(() => {
    return data?.csvFeeds.edges.reduce<
      [csvFeedItem_fragment$data[], csvFeedItem_fragment$data[]]
    >(
      (acc, { node }) => {
        const csvFeed = readInlineData<csvFeedItem_fragment$key>(
          csvFeedItem,
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

  const firstCsvFeed = _nonActive.length > 0 ? _nonActive[0] : active[0];

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
            connectionId={data!.csvFeeds!.__id}
          />
        </div>
      </div>
      {userCanUpdate && (
        <>
          <div className="txt-category">{t('Service.CsvFeed.NonActive')}:</div>
          <ul
            className={
              'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-l'
            }>
            {_nonActive.map((csvFeed) => (
              <ShareableResourceCard
                key={csvFeed.id}
                document={csvFeed as unknown as documentItem_fragment$data}
                detailUrl={`/service/custom_dashboards/${serviceInstance.id}/${csvFeed.id}`} // Both will be modified
                shareLinkUrl={`${window.location.origin}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${csvFeed.slug}`}>
                <DocumentBento
                  document={csvFeed}
                  serviceInstanceId={serviceInstance.id}
                />
              </ShareableResourceCard>
            ))}
          </ul>
          <div className="txt-category">{t('Service.CsvFeed.Active')}:</div>
        </>
      )}
      <ul
        className={
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-l'
        }>
        {active.map((csvFeed) => (
          <ShareableResourceCard
            key={csvFeed.id}
            document={csvFeed as unknown as documentItem_fragment$data}
            detailUrl={`/service/custom_dashboards/${serviceInstance.id}/${csvFeed.id}`}
            shareLinkUrl={`${window.location.origin}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${csvFeed.slug}`}>
            <DocumentBento
              document={csvFeed}
              serviceInstanceId={serviceInstance.id}
            />
          </ShareableResourceCard>
        ))}
      </ul>
    </div>
  );
};

export default CsvFeedsList;
