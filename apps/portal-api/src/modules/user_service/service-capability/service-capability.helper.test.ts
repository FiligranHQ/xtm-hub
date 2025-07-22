import { describe, expect, it, vi } from 'vitest';
import { UserServiceId } from '../../../model/kanel/public/UserService';
import { PortalContext } from '../../../model/portal-context';
import * as UserServiceDomain from '../../user_service/user_service.domain';
import { GenericServiceCapabilityName } from './generic_service_capability.const';
import * as ServiceCapaDomain from './service-capability.domain';
import { willManageAccessBeConserved } from './service_capability.helper';

describe('willManageAccessBeConserved', () => {
  it.each`
    capabilities                                    | getManageAccessLeft | userId          | shouldThrowError
    ${[]}                                           | ${true}             | ${'notTheSame'} | ${false}
    ${[]}                                           | ${true}             | ${'notTheSame'} | ${false}
    ${[GenericServiceCapabilityName.MANAGE_ACCESS]} | ${true}             | ${'notTheSame'} | ${false}
    ${[GenericServiceCapabilityName.MANAGE_ACCESS]} | ${true}             | ${'notTheSame'} | ${false}
    ${[GenericServiceCapabilityName.MANAGE_ACCESS]} | ${false}            | ${'notTheSame'} | ${false}
    ${[GenericServiceCapabilityName.MANAGE_ACCESS]} | ${false}            | ${'notTheSame'} | ${false}
    ${[]}                                           | ${false}            | ${'notTheSame'} | ${false}
    ${[]}                                           | ${false}            | ${'theSame'}    | ${true}
    ${[GenericServiceCapabilityName.MANAGE_ACCESS]} | ${false}            | ${'theSame'}    | ${false}
    ${[]}                                           | ${true}             | ${'theSame'}    | ${false}
  `(
    'Should return $shouldThrowError if capabilities, $capabilities and manageAccessCount is $manageAccessCount and userId is $userId',
    async ({ capabilities, getManageAccessLeft, userId, shouldThrowError }) => {
      vi.spyOn(ServiceCapaDomain, 'getManageAccessLeft').mockResolvedValueOnce(
        getManageAccessLeft
      );
      vi.spyOn(UserServiceDomain, 'loadUserServiceById').mockReturnValue({
        id: 'essai',
        user_id: userId,
      });

      const result = () =>
        willManageAccessBeConserved(
          { user: { id: 'theSame' } } as PortalContext,
          'userServiceId' as UserServiceId,
          capabilities
        );

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
