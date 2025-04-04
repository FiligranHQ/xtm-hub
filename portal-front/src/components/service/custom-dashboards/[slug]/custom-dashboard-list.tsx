import { getLabels } from '@/components/admin/label/label.utils';
import { GenericCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import { SearchInput } from '@/components/ui/search-input';
import { debounceHandleInput } from '@/utils/debounce';
import {
  documentItem_fragment$data,
  documentItem_fragment$key,
} from '@generated/documentItem_fragment.graphql';
import { documentsList$key } from '@generated/documentsList.graphql';
import { documentsQuery } from '@generated/documentsQuery.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { Button, MultiSelectFormField } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useMemo } from 'react';
import {
  PreloadedQuery,
  readInlineData,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';
import {
  documentItem,
  documentsFragment,
  DocumentsListQuery,
} from '../../document/document.graphql';
import CustomDashboardCard from '../custom-dashboard-card';
import { CustomDashboardSheet } from '../custom-dashboard-sheet';

interface CustomDashbordDocumentListProps {
  queryRef: PreloadedQuery<documentsQuery>;
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
  labels?: string[];
  onSearchChange: (v: string) => void;
  onLabelFilterChange: (v: string[]) => void;
}

const CustomDashbordDocumentList = ({
  queryRef,
  serviceInstance,
  onSearchChange,
  onLabelFilterChange,
  labels,
}: CustomDashbordDocumentListProps) => {
  const t = useTranslations();
  const queryData = usePreloadedQuery<documentsQuery>(
    DocumentsListQuery,
    queryRef
  );

  const [data] = useRefetchableFragment<documentsQuery, documentsList$key>(
    documentsFragment,
    queryData
  );

  const canManageService = serviceInstance.capabilities.includes(
    GenericCapabilityName.ManageAccess
  );

  const [active, _nonActive] = useMemo(() => {
    return data?.documents.edges.reduce<
      [documentItem_fragment$data[], documentItem_fragment$data[]]
    >(
      (acc, { node }) => {
        const customDashboard = readInlineData<documentItem_fragment$key>(
          documentItem,
          node
        );

        if (customDashboard.active) {
          acc[0].push(customDashboard);
        } else {
          acc[1].push(customDashboard);
        }
        return acc;
      },
      [[], []]
    );
  }, [data]);

  const labelOptions = getLabels().map(({ name, id }) => ({
    label: name.toUpperCase(),
    value: id,
  }));
  return (
    <div className="flex flex-col gap-xl">
      <h1>{serviceInstance.name}</h1>
      {/* TODO: add tabs to show non active dashboards for UPLOAD or BYPASS capas */}
      <div className="flex justify-between gap-s flex-wrap">
        <div className="flex gap-s flex-wrap">
          <SearchInput
            containerClass="w-[20rem] flex-1 max-w-[50%]"
            placeholder={t('GenericActions.Search')}
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
          {canManageService && (
            <Button
              asChild
              variant="outline">
              <Link href={`/manage/service/${serviceInstance.id}`}>
                {t('Service.Capabilities.ManageAccessName')}
              </Link>
            </Button>
          )}
          <CustomDashboardSheet
            serviceInstance={serviceInstance}
            serviceInstanceId={serviceInstance.id}
            connectionId={data!.documents!.__id}
          />
        </div>
      </div>
      <ul
        className={
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-l'
        }>
        {[...active, ..._nonActive].map((node) => (
          <CustomDashboardCard
            serviceInstance={serviceInstance}
            connectionId={data!.documents!.__id}
            key={node.id}
            customDashboard={node}
            detailUrl={`/service/custom_dashboards/${serviceInstance.id}/${node.id}`}
          />
        ))}
      </ul>
    </div>
  );
};

export default CustomDashbordDocumentList;
