import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  contextSimpleUserSecondOrga,
  requestContextAdminSecondOrga,
  // eslint-disable-next-line no-restricted-imports
  requestContextAdminUser,
  requestContextSimpleUserSecondOrga,
  TEST_ORGANIZATIONS,
} from '../../../../../tests/tests.const';
import {
  OrderingMode,
  UserOrdering,
} from '../../../../__generated__/resolvers-types';
import { requestContext } from '../../../../context/request.context';
import { UserId } from '../../../../model/kanel/public/User';
import { ROLE_ADMIN } from '../../../../portal.const';
import { telemetryApp } from '../../../telemetry/telemetry.app';
import { TelemetrySource } from '../../../telemetry/telemetry.const';
import { UserDomain } from './user.domain';

//Issue with test
describe('users domain', () => {
  afterEach(async () => {
    vi.useRealTimers();
  });

  it('should load user Admin', async () => {
    const response = await UserDomain.loadUserBy({
      'User.id': TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID as UserId,
    });
    expect(response.email).toEqual(
      TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.EMAIL
    );
    expect(response.selected_organization_id).toEqual(
      TEST_ORGANIZATIONS.FILIGRAN.ID
    );
    expect(response.organization_capabilities).toHaveLength(2);
  });

  it('should throw FORBIDDEN_ACCESS when Simple User calls EditUser', async () => {
    try {
      requestContext.set(requestContextSimpleUserSecondOrga);
      await UserDomain.updateUser(
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID,
        {
          email: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.EMAIL,
        }
      );
    } catch (error) {
      expect(error.name).toBe('FORBIDDEN_ACCESS');
    }
  });
  it('should send a login event', async () => {
    vi.useFakeTimers();
    const date = new Date(Date.UTC(2025, 1, 3, 13, 12, 15));
    vi.setSystemTime(date);
    const telemetrySpy = vi
      .spyOn(telemetryApp, 'sendTelemetryEvent')
      .mockResolvedValue();

    await UserDomain.updateUserAtLogin(contextSimpleUserSecondOrga.user);
    expect(telemetrySpy).toHaveBeenCalledExactlyOnceWith({
      '@timestamp': '2025-02-03T13:12:15.000Z',
      event_type: 'login',
      organization_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.ID,
      organization_name: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.NAME,
      organization_type: 'Professional',
      source: TelemetrySource.XTMHUB,
      user_id: TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.ID,
    });
  });
  describe('loadUserConnection', () => {
    const opts = {
      first: 50,
      orderMode: OrderingMode.Asc,
      orderBy: UserOrdering.Email,
      filters: [],
    };

    it('should only return users from the selected organization for non-platform-admin users', async () => {
      requestContext.set(requestContextAdminSecondOrga);

      const result = await UserDomain.loadUserConnection(opts);

      const returnedIds = result.edges.map((e) => e.node!.id);
      expect(returnedIds).toContain(
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID
      );
      expect(returnedIds).toContain(
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.SIMPLE.ID
      );
      expect(returnedIds).not.toContain(
        TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID
      );
    });

    it('should return users from all organizations for admin users', async () => {
      requestContext.set({
        ...requestContextAdminUser,
        user: { ...requestContextAdminUser.user, roles_portal: [ROLE_ADMIN] },
      });

      const result = await UserDomain.loadUserConnection(opts);

      const returnedIds = result.edges.map((e) => e.node!.id);
      expect(returnedIds).toContain(
        TEST_ORGANIZATIONS.SECOND_ORGANIZATION.USERS.ADMIN_ORGA.ID
      );
      expect(returnedIds).toContain(
        TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID
      );
    });
  });
});
