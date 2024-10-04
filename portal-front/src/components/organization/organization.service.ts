import {
  organizationFetch,
  organizationsFragment,
} from '@/components/organization/organization.graphql';
import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';
import { organizationList_organizations$key } from '../../../__generated__/organizationList_organizations.graphql';
import {
  OrderingMode,
  OrganizationOrdering,
  organizationSelectQuery,
} from '../../../__generated__/organizationSelectQuery.graphql';

interface OrganizationParamsQuery {
  count: number;
  orderBy: OrganizationOrdering;
  orderMode: OrderingMode;
}
export const getOrganizations = ({
  count = 50,
  orderBy = 'name',
  orderMode = 'asc',
}: Partial<OrganizationParamsQuery> = {}) => {
  const organizationData = useLazyLoadQuery<organizationSelectQuery>(
    organizationFetch,
    {
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
