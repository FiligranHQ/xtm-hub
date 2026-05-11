import { describe, expect, it, vi } from 'vitest';
import { ServiceRestriction } from '../../../__generated__/resolvers-types';
import { requestContext } from '../../../context/request.context';
import { UserServiceId } from '../../../model/kanel/public/UserService';
import { PortalContext } from '../../../model/portal-context';
import { UserLoadUserBy } from '../../../model/user';
import { UserServiceDomain } from '../../user-service/user-service.domain';
import * as ServiceCapaDomain from './service-capability.domain';
import { willManageAccessBeConserved } from './service-capability.helper';

describe('willManageAccessBeConserved', () => {
  it.each`
    capabilities                         | getManageAccessLeft | userId          | shouldThrowError
    ${[]}                                | ${true}             | ${'notTheSame'} | ${false}
    ${[]}                                | ${true}             | ${'notTheSame'} | ${false}
    ${[ServiceRestriction.ManageAccess]} | ${true}             | ${'notTheSame'} | ${false}
    ${[ServiceRestriction.ManageAccess]} | ${true}             | ${'notTheSame'} | ${false}
    ${[ServiceRestriction.ManageAccess]} | ${false}            | ${'notTheSame'} | ${false}
    ${[ServiceRestriction.ManageAccess]} | ${false}            | ${'notTheSame'} | ${false}
    ${[]}                                | ${false}            | ${'notTheSame'} | ${false}
    ${[]}                                | ${false}            | ${'theSame'}    | ${true}
    ${[ServiceRestriction.ManageAccess]} | ${false}            | ${'theSame'}    | ${false}
    ${[]}                                | ${true}             | ${'theSame'}    | ${false}
  `(
    'should return $shouldThrowError if capabilities, $capabilities and manageAccessCount is $manageAccessCount and userId is $userId',
    async ({ capabilities, getManageAccessLeft, userId, shouldThrowError }) => {
      vi.spyOn(ServiceCapaDomain, 'getManageAccessLeft').mockResolvedValueOnce(
        getManageAccessLeft
      );
      vi.spyOn(UserServiceDomain, 'loadUserServiceById').mockResolvedValue({
        id: 'essai',
        user_id: userId,
      });

      const result = async () => {
        requestContext.set({
          user: { id: 'theSame' } as UserLoadUserBy,
          portalContext: { user: { id: 'theSame' } } as PortalContext,
        });
        await willManageAccessBeConserved(
          'userServiceId' as UserServiceId,
          capabilities
        );
      };

      if (shouldThrowError) {
        await expect(result()).rejects.toThrow(
          'EDIT_CAPABILITIES_CANT_REMOVE_LAST_MANAGE_ACCESS'
        );
      } else {
        await expect(result()).resolves.not.toThrow();
      }
    }
  );
});
