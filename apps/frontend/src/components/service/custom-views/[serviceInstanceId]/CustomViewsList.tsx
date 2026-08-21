import { ServiceListFilterEntityType } from '@/components/service/components/header/filter/ServiceListFilterEntityType';
import {
  ServiceListFilterKey,
  ServiceListFilterMap,
} from '@/components/service/components/header/ServiceListHeader';
import ShareableResourceServiceList from '@/components/service/components/ShareableResourceServiceList';
import {
  ServiceListLocalStorageKey,
  useServiceListLocalStorage,
} from '@/hooks/use-service-list-local-storage';
import { ShareableResourceType } from '@/utils/shareable-resources/shareable-resources.types';
import { documentsQuery } from '@generated/documentsQuery.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import { PreloadedQuery } from 'react-relay';

interface CustomViewsListProps {
  queryRef: PreloadedQuery<documentsQuery>;
  serviceInstance: serviceInstance_fragment$data;
  search: string;
  onSearchChange: (v: string) => void;
}

const CustomViewsList = ({
  queryRef,
  serviceInstance,
  search,
  onSearchChange,
}: CustomViewsListProps) => {
  const { removeEntityTypes } = useServiceListLocalStorage(
    ServiceListLocalStorageKey.OpenCTICustomViews
  );

  const additionalFilters: ServiceListFilterMap = {
    [ServiceListFilterKey.EntityType]: {
      node: <ServiceListFilterEntityType />,
      reset: removeEntityTypes,
    },
  };

  return (
    <ShareableResourceServiceList
      queryRef={queryRef}
      serviceInstance={serviceInstance}
      search={search}
      onSearchChange={onSearchChange}
      type={ShareableResourceType.OPENCTI_CUSTOM_VIEW}
      localStorageKey={ServiceListLocalStorageKey.OpenCTICustomViews}
      additionalFilters={additionalFilters}
    />
  );
};

export default CustomViewsList;
