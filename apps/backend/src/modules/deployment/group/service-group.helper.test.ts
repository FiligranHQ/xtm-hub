import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { TestHelper } from '../../../../tests/helper/test.helper';
import { TEST_ORGANIZATIONS } from '../../../../tests/tests.const';
import {
  PlatformIdentifier,
  ServiceGroupName,
  UserAccountStatus,
} from '../../../__generated__/resolvers-types';
import { DeploymentRequestId } from '../../../model/kanel/public/DeploymentRequest';
import ServiceGroupModel, {
  ServiceGroupId,
} from '../../../model/kanel/public/ServiceGroup';
import { ServiceInstanceId } from '../../../model/kanel/public/ServiceInstance';
import User, { UserId } from '../../../model/kanel/public/User';
import * as mailService from '../../../server/mail-service';
import { auth0ClientMock } from '../../../thirdparty/auth0/mock';
import { ErrorCode } from '../../../utils/error/error.code';
import { formatName } from '../../../utils/format';
import { UserDomain } from '../../organization-management/user/user-domain/user.domain';
import { ServiceGroupHelper } from './service-group.helper';

describe('serviceGroupHelper', () => {
  const groupId1 = 'g1' as ServiceGroupId;

  describe('toServiceGroupResponse', () => {
    it('should cast the service group name to a ServiceGroupName', () => {
      const serviceGroup: ServiceGroupModel = {
        id: groupId1,
        name: 'Admin',
        service_instance_id: 'si1' as ServiceInstanceId,
      };

      const result = ServiceGroupHelper.toServiceGroupResponse(serviceGroup);

      expect(result).toEqual({
        id: groupId1,
        name: ServiceGroupName.Admin,
        service_instance_id: 'si1',
      });
    });
  });

  describe('uniqueRolesByProduct', () => {
    it('should keep the first assignment of each product and preserve order', () => {
      const roles = [
        { product: PlatformIdentifier.Xtmone, role: ServiceGroupName.User },
        { product: PlatformIdentifier.Opencti, role: ServiceGroupName.Admin },
        { product: PlatformIdentifier.Opencti, role: ServiceGroupName.Reader },
        { product: PlatformIdentifier.Xtmone, role: ServiceGroupName.Admin },
      ];

      expect(ServiceGroupHelper.uniqueRolesByProduct(roles)).toEqual([
        { product: PlatformIdentifier.Xtmone, role: ServiceGroupName.User },
        { product: PlatformIdentifier.Opencti, role: ServiceGroupName.Admin },
      ]);
    });
  });

  describe('matchRolesToChildren', () => {
    const bundleIds: DeploymentRequestId[] = [];

    afterEach(async () => {
      for (const bundleId of bundleIds) {
        await TestHelper.deploymentRequest.deleteBundle(bundleId);
      }
      bundleIds.length = 0;
    });

    it('should match each role to its corresponding child by platform identifier', async () => {
      const { bundle, children } =
        await TestHelper.deploymentRequest.createBundle({
          children: [
            { platform_identifier: PlatformIdentifier.Opencti },
            { platform_identifier: PlatformIdentifier.Openaev },
          ],
        });
      bundleIds.push(bundle.id);
      const [openctiChild, openaevChild] = children;

      const result = ServiceGroupHelper.matchRolesToChildren(children, [
        { product: PlatformIdentifier.Opencti, role: ServiceGroupName.Admin },
        {
          product: PlatformIdentifier.Openaev,
          role: ServiceGroupName.Observer,
        },
      ]);

      expect(result).toEqual([
        { child: openctiChild, role: ServiceGroupName.Admin },
        { child: openaevChild, role: ServiceGroupName.Observer },
      ]);
    });

    it('should skip roles whose product has no matching child in the bundle', async () => {
      const { bundle, children } =
        await TestHelper.deploymentRequest.createBundle({
          children: [{ platform_identifier: PlatformIdentifier.Opencti }],
        });
      bundleIds.push(bundle.id);

      const result = ServiceGroupHelper.matchRolesToChildren(children, [
        { product: PlatformIdentifier.Xtmone, role: ServiceGroupName.User },
      ]);

      expect(result).toEqual([]);
    });

    it('should default a missing role to null', async () => {
      const { bundle, children } =
        await TestHelper.deploymentRequest.createBundle({
          children: [{ platform_identifier: PlatformIdentifier.Opencti }],
        });
      bundleIds.push(bundle.id);
      const [openctiChild] = children;

      const result = ServiceGroupHelper.matchRolesToChildren(children, [
        { product: PlatformIdentifier.Opencti, role: null },
      ]);

      expect(result).toEqual([{ child: openctiChild, role: null }]);
    });
  });

  describe('loadEmailByUserId', () => {
    it('should return the users and a map of their emails', async () => {
      const result = await ServiceGroupHelper.loadEmailByUserId([
        TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID,
      ]);

      expect(result.users.map((user) => user.id)).toEqual([
        TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID,
      ]);
      expect(
        result.emailByUserId.get(TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID)
      ).toBe(TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.EMAIL);
    });

    it('should return an empty map when no user matches', async () => {
      const result = await ServiceGroupHelper.loadEmailByUserId([
        uuidv4() as UserId,
      ]);

      expect(result.users).toEqual([]);
      expect(result.emailByUserId.size).toBe(0);
    });
  });

  describe('syncAuth0GroupsForChildren', () => {
    const bundleIds: DeploymentRequestId[] = [];

    afterEach(async () => {
      for (const bundleId of bundleIds) {
        await TestHelper.deploymentRequest.deleteBundle(bundleId);
      }
      bundleIds.length = 0;
    });

    it('should call auth0 once per user with the groups of children that have a platform_id', async () => {
      const openctiPlatformId = uuidv4();
      const { bundle, children } =
        await TestHelper.deploymentRequest.createBundle({
          children: [
            {
              platform_identifier: PlatformIdentifier.Opencti,
              platform_id: openctiPlatformId,
            },
            { platform_identifier: PlatformIdentifier.Openaev },
          ],
        });
      bundleIds.push(bundle.id);
      const [openctiChild, openaevChild] = children;

      const auth0Spy = vi
        .spyOn(auth0ClientMock, 'updateUserRBACInstance')
        .mockResolvedValue(undefined);

      await ServiceGroupHelper.syncAuth0GroupsForChildren(
        [
          { child: openctiChild!, groupNames: [ServiceGroupName.Admin] },
          { child: openaevChild!, groupNames: [ServiceGroupName.Observer] },
        ],
        [TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID],
        new Map([
          [
            TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID,
            TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.EMAIL,
          ],
        ])
      );

      expect(auth0Spy).toHaveBeenCalledTimes(1);
      expect(auth0Spy).toHaveBeenCalledWith(
        TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.EMAIL,
        {
          [openctiPlatformId]: { groups: [ServiceGroupName.Admin] },
        },
        undefined
      );
    });

    it('should not call auth0 when none of the children have a platform_id', async () => {
      const { bundle, children } =
        await TestHelper.deploymentRequest.createBundle({
          children: [{ platform_identifier: PlatformIdentifier.Opencti }],
        });
      bundleIds.push(bundle.id);

      const auth0Spy = vi
        .spyOn(auth0ClientMock, 'updateUserRBACInstance')
        .mockResolvedValue(undefined);

      await ServiceGroupHelper.syncAuth0GroupsForChildren(
        [{ child: children[0]!, groupNames: [ServiceGroupName.Admin] }],
        [TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID],
        new Map([
          [
            TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID,
            TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.EMAIL,
          ],
        ])
      );

      expect(auth0Spy).not.toHaveBeenCalled();
    });

    it('should skip a user whose email could not be resolved', async () => {
      const openctiPlatformId = uuidv4();
      const { bundle, children } =
        await TestHelper.deploymentRequest.createBundle({
          children: [
            {
              platform_identifier: PlatformIdentifier.Opencti,
              platform_id: openctiPlatformId,
            },
          ],
        });
      bundleIds.push(bundle.id);

      const auth0Spy = vi
        .spyOn(auth0ClientMock, 'updateUserRBACInstance')
        .mockResolvedValue(undefined);

      await ServiceGroupHelper.syncAuth0GroupsForChildren(
        [{ child: children[0]!, groupNames: [ServiceGroupName.Admin] }],
        [uuidv4() as UserId],
        new Map()
      );

      expect(auth0Spy).not.toHaveBeenCalled();
    });
  });

  describe('sendFreeTrialBundleWelcomeEmails', () => {
    let simple2User: User;
    let bypassUser: User;

    beforeAll(async () => {
      const users = await UserDomain.loadUsers([
        TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID,
        TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID,
      ]);
      simple2User = users.find(
        (user) => user.id === TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID
      )!;
      bypassUser = users.find(
        (user) => user.id === TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.ID
      )!;
    });

    afterEach(() => {
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it('should send a single free_trial_bundle_user_added email to each newly added user', async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-09-16T10:00:00.000Z'));
      const endDate = new Date('2026-10-01T10:00:00.000Z');
      const adminEmail = 'admin@filigran.io';

      const sendMailSpy = vi
        .spyOn(mailService, 'sendMail')
        .mockResolvedValue(undefined);

      await ServiceGroupHelper.sendFreeTrialBundleWelcomeEmails({
        endDate,
        products: [PlatformIdentifier.Xtmone, PlatformIdentifier.Opencti],
        newlyAddedUsers: [simple2User, bypassUser],
        adminEmail,
      });

      const expectedParams = {
        adminEmail,
        productNames: 'OpenCTI and XTM One',
        products: [PlatformIdentifier.Opencti, PlatformIdentifier.Xtmone],
        daysLeft: 15,
        platformUrl: mailService.buildXtmPlatformTrialLink(),
      };
      expect(sendMailSpy).toHaveBeenCalledTimes(2);
      expect(sendMailSpy).toHaveBeenCalledWith({
        to: TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.EMAIL,
        template: 'free_trial_bundle_user_added',
        params: {
          firstName: formatName(
            TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.FIRST_NAME
          ),
          ...expectedParams,
        },
      });
      expect(sendMailSpy).toHaveBeenCalledWith({
        to: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.EMAIL,
        template: 'free_trial_bundle_user_added',
        params: {
          firstName: formatName(
            TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.FIRST_NAME
          ),
          ...expectedParams,
        },
      });
    });

    it.each([
      ['there is no end date', null, [PlatformIdentifier.Opencti], true],
      ['there are no products', new Date(), [], true],
      [
        'there are no newly added users',
        new Date(),
        [PlatformIdentifier.Opencti],
        false,
      ],
    ])(
      'should do nothing when %s',
      async (_description, endDate, products, withUsers) => {
        const sendMailSpy = vi
          .spyOn(mailService, 'sendMail')
          .mockResolvedValue(undefined);

        await ServiceGroupHelper.sendFreeTrialBundleWelcomeEmails({
          endDate,
          products,
          newlyAddedUsers: withUsers ? [simple2User] : [],
          adminEmail: 'admin@filigran.io',
        });

        expect(sendMailSpy).not.toHaveBeenCalled();
      }
    );

    it('should swallow errors raised while sending emails', async () => {
      vi.spyOn(mailService, 'sendMail').mockRejectedValue(
        new Error('smtp down')
      );

      await expect(
        ServiceGroupHelper.sendFreeTrialBundleWelcomeEmails({
          endDate: new Date(),
          products: [PlatformIdentifier.Opencti],
          newlyAddedUsers: [simple2User],
          adminEmail: 'admin@filigran.io',
        })
      ).resolves.toBeUndefined();
    });
  });

  describe('sendBundleWelcomeEmailsForGrant', () => {
    const bundleIds: DeploymentRequestId[] = [];
    const endDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    let simple2User: User;

    beforeAll(async () => {
      [simple2User] = await UserDomain.loadUsers([
        TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID,
      ]);
    });

    afterEach(async () => {
      vi.restoreAllMocks();
      for (const bundleId of bundleIds) {
        await TestHelper.deploymentRequest.deleteBundle(bundleId);
      }
      bundleIds.length = 0;
    });

    it('should send one welcome email grouping all products of the same bundle', async () => {
      const { bundle, children } =
        await TestHelper.deploymentRequest.createBundle({
          bundle: { end_date: endDate },
          children: [
            { platform_identifier: PlatformIdentifier.Opencti },
            { platform_identifier: PlatformIdentifier.Xtmone },
          ],
        });
      bundleIds.push(bundle.id);
      const [openctiChild, xtmoneChild] = children;
      const deploymentRequestsWithGroupName = [
        { ...openctiChild!, group_name: ServiceGroupName.Admin },
        { ...xtmoneChild!, group_name: ServiceGroupName.User },
      ];
      const sendMailSpy = vi
        .spyOn(mailService, 'sendMail')
        .mockResolvedValue(undefined);

      await ServiceGroupHelper.sendBundleWelcomeEmailsForGrant(
        deploymentRequestsWithGroupName,
        simple2User
      );

      expect(sendMailSpy).toHaveBeenCalledTimes(1);
      expect(sendMailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: simple2User.email,
          template: 'free_trial_bundle_user_added',
          params: expect.objectContaining({
            adminEmail: TEST_ORGANIZATIONS.FILIGRAN.USERS.BYPASS.EMAIL,
            products: expect.arrayContaining([
              PlatformIdentifier.Opencti,
              PlatformIdentifier.Xtmone,
            ]),
          }),
        })
      );
    });

    it('should send one welcome email per bundle when the user has grants in several bundles', async () => {
      const firstBundle = await TestHelper.deploymentRequest.createBundle({
        bundle: { end_date: endDate },
        children: [{ platform_identifier: PlatformIdentifier.Opencti }],
      });
      const secondBundle = await TestHelper.deploymentRequest.createBundle({
        bundle: { end_date: endDate },
        children: [{ platform_identifier: PlatformIdentifier.Xtmone }],
      });
      bundleIds.push(firstBundle.bundle.id, secondBundle.bundle.id);
      const deploymentRequestsWithGroupName = [
        { ...firstBundle.children[0]!, group_name: ServiceGroupName.Admin },
        { ...secondBundle.children[0]!, group_name: ServiceGroupName.Admin },
      ];
      const sendMailSpy = vi
        .spyOn(mailService, 'sendMail')
        .mockResolvedValue(undefined);

      await ServiceGroupHelper.sendBundleWelcomeEmailsForGrant(
        deploymentRequestsWithGroupName,
        simple2User
      );

      expect(sendMailSpy).toHaveBeenCalledTimes(2);
    });

    it('should ignore deployment requests without a parent bundle or a platform identifier', async () => {
      const { bundle, children } =
        await TestHelper.deploymentRequest.createBundle({
          bundle: { end_date: endDate },
          children: [{ platform_identifier: PlatformIdentifier.Opencti }],
        });
      bundleIds.push(bundle.id);
      const [openctiChild] = children;
      const deploymentRequestsWithGroupName = [
        { ...openctiChild!, group_name: ServiceGroupName.Admin },
        {
          ...openctiChild!,
          parent_id: null,
          group_name: ServiceGroupName.Admin,
        },
        {
          ...openctiChild!,
          platform_identifier: null,
          group_name: ServiceGroupName.Admin,
        },
      ];
      const sendMailSpy = vi
        .spyOn(mailService, 'sendMail')
        .mockResolvedValue(undefined);

      await ServiceGroupHelper.sendBundleWelcomeEmailsForGrant(
        deploymentRequestsWithGroupName,
        simple2User
      );

      expect(sendMailSpy).toHaveBeenCalledTimes(1);
    });

    it('should do nothing when given an empty list', async () => {
      const sendMailSpy = vi
        .spyOn(mailService, 'sendMail')
        .mockResolvedValue(undefined);

      await ServiceGroupHelper.sendBundleWelcomeEmailsForGrant([], simple2User);

      expect(sendMailSpy).not.toHaveBeenCalled();
    });
  });

  describe('removeAuth0Groups', () => {
    const insertedUserIds: UserId[] = [];

    afterEach(async () => {
      for (const id of insertedUserIds) {
        await TestHelper.user.delete({ id });
      }
      insertedUserIds.length = 0;
      vi.restoreAllMocks();
    });

    it('should throw InvalidPlatformId when no platform id is given', async () => {
      // When
      const call = ServiceGroupHelper.removeAuth0Groups(
        [TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID],
        null
      );

      // Then
      await expect(call).rejects.toThrow(ErrorCode.InvalidPlatformId);
    });

    it.each([UserAccountStatus.Waiting, UserAccountStatus.Expired])(
      'should not send a %s user to Auth0 when removing the platform groups',
      async (status) => {
        // Given
        const platformId = uuidv4();
        const userWithoutAuth0Account = await TestHelper.user.insert({
          email: `user-${uuidv4()}@filigran.io`,
          status,
        });
        insertedUserIds.push(userWithoutAuth0Account.id);
        const auth0Spy = vi
          .spyOn(auth0ClientMock, 'updateUserRBACInstance')
          .mockResolvedValue(undefined);

        // When
        await ServiceGroupHelper.removeAuth0Groups(
          [
            userWithoutAuth0Account.id,
            TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.ID,
          ],
          platformId
        );

        // Then
        expect(auth0Spy).toHaveBeenCalledExactlyOnceWith(
          TEST_ORGANIZATIONS.FILIGRAN.USERS.SIMPLE2.EMAIL,
          { [platformId]: { groups: [] } }
        );
      }
    );
  });
});
