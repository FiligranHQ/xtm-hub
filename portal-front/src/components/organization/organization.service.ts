import { useLazyLoadQuery, useRefetchableFragment } from 'react-relay';
import {
  OrderingMode,
  OrganizationOrdering,
  organizationSelectQuery,
} from '../../../__generated__/organizationSelectQuery.graphql';
import {
  organizationFetch,
  organizationsFragment,
} from '@/components/organization/organization.graphql';
import { organizationList_organizations$key } from '../../../__generated__/organizationList_organizations.graphql';
import { useLocalStorage } from 'usehooks-ts';

export const getOrganizations = () => {
  const [count, setCount] = useLocalStorage('countOrganizationList', 50);
  const [orderMode, setOrderMode] = useLocalStorage<OrderingMode>(
    'orderModeOrganizationList',
    'asc'
  );
  const [orderBy, setOrderBy] = useLocalStorage<OrganizationOrdering>(
    'orderByOrganizationList',
    'name'
  );

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
