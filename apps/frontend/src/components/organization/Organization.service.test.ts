import { organizationList_organizations$data } from '@generated/organizationList_organizations.graphql';
import { subscription_fragment$data } from '@generated/subscription_fragment.graphql';
import { describe, expect, it } from 'vitest';
import { getUnsubscribedOrganizations } from './Organization.service';

const makeOrg = (id: string, name: string) => ({ id, name });

const makeOrganizationsData = (
  organizations: Array<{ id: string; name: string }>
): organizationList_organizations$data =>
  ({
    organizations: {
      edges: organizations.map(({ id, name }) => ({
        node: {
          id,
          name,
          personal_space: false,
          domains: [],
        },
      })),
    },
  }) as unknown as organizationList_organizations$data;

const makeSubscription = (
  orgId: string,
  overrides: Partial<subscription_fragment$data> = {}
): subscription_fragment$data =>
  ({
    id: `sub-${orgId}`,
    organization: { id: orgId, name: `Org ${orgId}`, personal_space: false },
    subscription_capability: [],
    service_instance: null,
    start_date: null,
    end_date: null,
    ...overrides,
  }) as unknown as subscription_fragment$data;

describe('getAvailableOrganizations', () => {
  const organizationsData = makeOrganizationsData([
    makeOrg('org-1', 'Org 1'),
    makeOrg('org-2', 'Org 2'),
    makeOrg('org-3', 'Org 3'),
  ]);

  it('should return all organizations when there are no subscriptions', () => {
    const result = getUnsubscribedOrganizations(organizationsData, []);

    expect(result).toHaveLength(3);
    expect(result.map((o) => o.id)).toEqual(['org-1', 'org-2', 'org-3']);
  });

  it('should exclude already-subscribed organizations', () => {
    const subscriptions = [
      makeSubscription('org-1'),
      makeSubscription('org-2'),
    ];
    const result = getUnsubscribedOrganizations(
      organizationsData,
      subscriptions
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 'org-3', name: 'Org 3' });
  });

  it('should keep the edited subscription organization available when editing', () => {
    const subscriptions = [
      makeSubscription('org-1'),
      makeSubscription('org-2'),
    ];
    const subscriptionToEdit = makeSubscription('org-1');
    const result = getUnsubscribedOrganizations(
      organizationsData,
      subscriptions,
      subscriptionToEdit
    );

    expect(result.map((o) => o.id)).toContain('org-1');
    expect(result.map((o) => o.id)).not.toContain('org-2');
  });

  it('should return empty array when all organizations are subscribed and none is being edited', () => {
    const subscriptions = [
      makeSubscription('org-1'),
      makeSubscription('org-2'),
      makeSubscription('org-3'),
    ];
    const result = getUnsubscribedOrganizations(
      organizationsData,
      subscriptions
    );

    expect(result).toHaveLength(0);
  });

  it('should ignore subscriptions with no organization id', () => {
    const subscriptions = [
      {
        ...makeSubscription('org-1'),
        organization: { id: '', name: 'Org 1', personal_space: false },
      } as unknown as subscription_fragment$data,
    ];
    const result = getUnsubscribedOrganizations(
      organizationsData,
      subscriptions
    );

    expect(result).toHaveLength(3);
    expect(result.map((o) => o.id)).toEqual(['org-1', 'org-2', 'org-3']);
  });
});
