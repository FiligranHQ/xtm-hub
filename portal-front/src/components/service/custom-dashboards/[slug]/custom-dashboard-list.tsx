import { getLabels } from '@/components/admin/label/label.utils';
import { GenericCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import { debounceHandleInput } from '@/utils/debounce';
import {
  documentsList$data,
  documentsList$key,
} from '@generated/documentsList.graphql';
import { documentsQuery } from '@generated/documentsQuery.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { Button, Input, MultiSelectFormField } from 'filigran-ui';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useMemo } from 'react';
import {
  PreloadedQuery,
  usePreloadedQuery,
  useRefetchableFragment,
} from 'react-relay';
import {
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
      [
        documentsList$data['documents']['edges'][0]['node'][],
        documentsList$data['documents']['edges'][0]['node'][],
      ]
    >(
      (acc, { node }) => {
        if (node.active) {
          acc[0].push(node);
        } else {
          acc[1].push(node);
        }
        return acc;
      },
      [[], []]
    );
  }, [data]);

  const labelOptions = getLabels().map(({ name, id }) => ({
    label: name,
    value: id,
  }));

  return (
    <div className="flex flex-col gap-xl">
      <div className="flex justify-between">
        <h1>{serviceInstance.name}</h1>
        {canManageService && (
          <Button
            className="ml-auto mr-s"
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
      {/* TODO: add tabs to show non active dashboards for UPLOAD or BYPASS capas */}
      <div className="flex gap-l">
        <Input
          className="w-[20rem]"
          placeholder={t('GenericActions.Search')}
          onChange={debounceHandleInput(onSearchChange)}
        />
        <div className="w-[20rem]">
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
      <ul
        className={
          'grid grid-cols-1 s:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-xl'
        }>
        {[...active, ..._nonActive].map((node) => (
          <CustomDashboardCard
            serviceInstance={serviceInstance}
            connectionId={data!.documents!.__id}
            key={node.id}
            data={node}
          />
        ))}
      </ul>
    </div>
  );
};

export default CustomDashbordDocumentList;
