import {
  organizationFetch,
  organizationsFragment,
} from '@/components/organization/organization.graphql';
import { OrganizationOrderingEnum } from '@generated/models/OrganizationOrdering.enum';
import { organizationList_organizations$key } from '@generated/organizationList_organizations.graphql';
import {
  OrderingMode,
  organizationSelectQuery,
} from '@generated/organizationSelectQuery.graphql';
import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';

interface OrganizationParamsQuery {
  count: number;
  orderBy: OrganizationOrderingEnum;
  orderMode: OrderingMode;
  searchTerm?: string;
}
export const getOrganizations = ({
  searchTerm = '',
  count = 50,
  orderBy = OrganizationOrderingEnum.NAME,
  orderMode = 'asc',
}: Partial<OrganizationParamsQuery> = {}) => {
  const organizationData = useLazyLoadQuery<organizationSelectQuery>(
    organizationFetch,
    {
      searchTerm,
      count,
      orderBy,
      orderMode,
    }
  );
  return useRefetchableFragment<
    organizationSelectQuery,
    organizationList_organizations$key
  >(organizationsFragment, organizationData);
};
