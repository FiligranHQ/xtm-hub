import {
  organizationFetch,
  organizationItemFragment,
  organizationQuery,
  organizationsFragment,
} from '@/components/organization/organization.graphql';
import { OrganizationOrderingEnum } from '@generated/models/OrganizationOrdering.enum';
import { organizationItem_fragment$key } from '@generated/organizationItem_fragment.graphql';
import {
  organizationList_organizations$data,
  organizationList_organizations$key,
} from '@generated/organizationList_organizations.graphql';
import { organizationQuery as organizationQueryGraphql } from '@generated/organizationQuery.graphql';
import {
  OrderingMode,
  organizationSelectQuery,
} from '@generated/organizationSelectQuery.graphql';
import { subscription_fragment$data } from '@generated/subscription_fragment.graphql';
import {
  useFragment,
  useLazyLoadQuery,
  useRefetchableFragment,
} from 'react-relay';

interface OrganizationParamsQuery {
  count: number;
  orderBy: OrganizationOrderingEnum;
  orderMode: OrderingMode;
  searchTerm?: string;
}

export const getOrganization = (organizationId: string) => {
  const organizationData = useLazyLoadQuery<organizationQueryGraphql>(
    organizationQuery,
    { id: organizationId }
  );

  return useFragment<organizationItem_fragment$key>(
    organizationItemFragment,
    organizationData.organization
  );
};

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

interface AvailableOrganization {
  readonly domains: ReadonlyArray<string> | null | undefined;
  readonly id: string;
  readonly name: string;
  readonly personal_space: boolean;
}

/**
 * Returns the list of organizations that are not yet subscribed to the service.
 * When editing an existing subscription, the subscribed organization of that subscription
 * is excluded from filtering so it remains selectable.
 */
export const getAvailableOrganizations = (
  organizationsData: organizationList_organizations$data,
  subscriptions: subscription_fragment$data[],
  subscriptionToEdit?: subscription_fragment$data
): AvailableOrganization[] => {
  const subscribedOrganizationIds = new Set(
    subscriptions
      .map((subscription) => subscription.organization?.id)
      .filter((id): id is string => Boolean(id))
  );

  if (subscriptionToEdit?.organization?.id) {
    subscribedOrganizationIds.delete(subscriptionToEdit.organization.id);
  }

  return organizationsData.organizations.edges
    .map(({ node }) => node)
    .filter(({ id }) => !subscribedOrganizationIds.has(id));
};
