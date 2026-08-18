import { expect, test } from '../../fixtures/baseFixtures.js';
import LoginPage from '../../model/login.pageModel';
import UserPage from '../../model/user.pageModel';
import { db } from '../../db-utils/db-connection';
import { insertDeploymentRequest } from '../../db-utils/deployment.helper';
import { Page } from '@playwright/test';
import { v4 as uuidv4 } from 'uuid';
import {
  announceCheckpoint,
  announceDbQueryResult,
  announceIntro,
  announceStep,
} from './demo-caption.util';

const TEST_PREFIX = 'cascade-demo-';
const ADMIN_EMAIL = 'admin@filigran.io';
const SHARED_ORG_ID = '681fb117-e2c3-46d3-945a-0e921b5d4b6c';
const FILIGRAN_ORG_ID = 'ba091095-418f-4b4f-b150-6c9295e232c4';
const FILIGRAN_SUBSCRIPTION_ID = '7f17820c-3a36-4023-ae3c-e2c15613b518';
const VAULT_SERVICE_INSTANCE_ID = 'e88e8f80-ba9e-480b-ab27-8613a1565eff';
const SYSTEM_USER_ID = 'f0587688-ef35-466a-9f71-a8807ba460b8';
const MANAGE_ACCESS_CAPABILITY_ID = 'b3275212-6c80-42de-8508-b7b71d5926fc';

const BLOCKED_MESSAGES = {
  transfer:
    'This user cannot be deleted while a personal space transfer request is pending.',
  deployment:
    'This user cannot be deleted because deployment requests are linked to their account.',
  cancellation:
    'This user cannot be deleted because they cancelled a deployment request that is still linked to their account.',
  platformRegistration:
    'This user cannot be deleted because they registered a platform.',
  lastOrganizationMember:
    'This user cannot be deleted because they are the last member of an organization.',
  pendingUsers:
    'This user cannot be deleted while one of their organizations still has users waiting for approval.',
};

const deleteProtectedTablesForUserIds = async (userIds: string[]) => {
  if (!userIds.length) return;

  const userOrgIds = await db('User_Organization')
    .whereIn('user_id', userIds)
    .pluck('id');

  const userServiceIds = await db('User_Service')
    .whereIn('user_id', userIds)
    .pluck('id');

  await db('User_TransferRequest')
    .whereIn('from_user_id', userIds)
    .orWhereIn('to_user_id', userIds)
    .delete();
  await db('DeploymentRequest')
    .whereIn('user_requester_id', userIds)
    .orWhereIn('cancellation_user_id', userIds)
    .delete();
  await db('PlatformConfiguration').whereIn('registerer_id', userIds).delete();
  await db('OneClickDeployment').whereIn('user_id', userIds).delete();
  await db('ServiceGroup_User').whereIn('user_id', userIds).delete();
  await db('Document')
    .whereIn('uploader_id', userIds)
    .orWhereIn('remover_id', userIds)
    .orWhereIn('updater_id', userIds)
    .delete();
  await db('Epic')
    .whereIn('uploader_id', userIds)
    .orWhereIn('updater_id', userIds)
    .delete();

  if (userServiceIds.length) {
    await db('UserService_Capability')
      .whereIn('user_service_id', userServiceIds)
      .delete();
  }

  await db('User_Service').whereIn('user_id', userIds).delete();
  await db('User_RolePortal').whereIn('user_id', userIds).delete();

  if (userOrgIds.length) {
    await db('UserOrganization_Capability')
      .whereIn('user_organization_id', userOrgIds)
      .delete();
  }

  await db('User_Organization_Pending').whereIn('user_id', userIds).delete();
  await db('User_Organization').whereIn('user_id', userIds).delete();
  await db('sessions').whereRaw(
    `(sess #>> '{passport,user}') IN (${userIds.map(() => '?').join(',')})`,
    userIds
  );
  await db('Organization').whereIn('id', userIds).delete();
  await db('User').whereIn('id', userIds).delete();
};

const cleanupDemoUsers = async () => {
  const users = await db('User')
    .where('email', 'like', `${TEST_PREFIX}%`)
    .select('id');
  await deleteProtectedTablesForUserIds(users.map(({ id }) => id));
};

const createDemoUser = async ({
  email,
  selectedOrganizationId = FILIGRAN_ORG_ID,
  addToFiligran = true,
  addPersonalSpace = true,
}: {
  email: string;
  selectedOrganizationId?: string;
  addToFiligran?: boolean;
  addPersonalSpace?: boolean;
}) => {
  const userId = uuidv4();
  const salt = 'fabc28ed1339f8b34c10bc3b5a650c01';
  const password =
    'a0bbec7075b7aca96feb276477a5ab4b8d86c495de9b5eb1e9f44dea11a1fea7b0621437a2e437517ecf222e1c730db96c51211856fd309a6293dba2aa44c24e';

  if (addPersonalSpace) {
    await db('Organization').insert({
      id: userId,
      name: email,
      personal_space: true,
    });
  }

  await db('User').insert({
    id: userId,
    email,
    salt,
    password,
    first_name: 'Demo',
    last_name: 'User',
    selected_organization_id: selectedOrganizationId,
  });

  if (addToFiligran) {
    await db('User_Organization').insert({
      user_id: userId,
      organization_id: FILIGRAN_ORG_ID,
    });
  }

  if (addPersonalSpace) {
    await db('User_Organization').insert({
      user_id: userId,
      organization_id: userId,
    });
  }

  return userId;
};

const deleteUserFromAdmin = async (userPage: UserPage, email: string) => {
  await userPage.deleteUser(email);
};

const showDbCheck = async (
  page: Page,
  title: string,
  query: string,
  result: unknown
) => announceDbQueryResult(page, title, query, result);

const showBeforeAfterDbCheck = async (
  page: Page,
  title: string,
  query: string,
  beforeDelete: unknown,
  afterDelete: unknown
) => showDbCheck(page, title, query, { beforeDelete, afterDelete });

const announceInitialData = async (
  page: Page,
  scenarioTitle: string,
  data: string[]
) => {
  await announceIntro(
    page,
    scenarioTitle,
    `Initial data for this test:\n${data.map((entry) => `- ${entry}`).join('\n')}`
  );
};

const expectDeleteBlocked = async (
  page,
  email: string,
  expectedMessage: string
) => {
  await expect(page.getByText(expectedMessage)).toBeVisible();

  await page.waitForTimeout(1500);
  const closeButton = page.getByRole('button', { name: /close/i });
  if ((await closeButton.count()) > 0 && (await closeButton.first().isVisible())) {
    await closeButton.first().click();
    await page.waitForTimeout(300);
  }

  await expect(
    page.getByRole('cell', { name: email, exact: true })
  ).toBeVisible();
};

test.describe('Cascade delete demos: scenarios 1 to 20', () => {
  let loginPage: LoginPage;
  let userPage: UserPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    userPage = new UserPage(page);
    await cleanupDemoUsers();
  });

  test.afterEach(async () => {
    await cleanupDemoUsers();
  });

  test('scenario 1 - User_Organization.user_id cascades', async ({ page }) => {
    const email = `${TEST_PREFIX}scenario-1@second-orga.com`;
    const userId = await createDemoUser({
      email,
      selectedOrganizationId: SHARED_ORG_ID,
      addToFiligran: false,
    });
    await db('User_Organization').insert({
      user_id: userId,
      organization_id: SHARED_ORG_ID,
    });
    const beforeDelete = await db('User_Organization')
      .where({ user_id: userId })
      .select('id', 'organization_id');

    await loginPage.navigateTo();
    await announceInitialData(page, 'Scenario 1 - User_Organization CASCADE', [
      `test user: ${email}`,
      `membership created in shared organization ${SHARED_ORG_ID}`,
      'expected behavior: deleting user removes User_Organization rows',
    ]);
    await loginPage.login(ADMIN_EMAIL);
    await userPage.navigateToUserListAdmin();
    await announceStep(page, `Deleting shared-organization member ${email}`);
    await deleteUserFromAdmin(userPage, email);
    await expect(
      page.getByRole('cell', { name: email, exact: true })
    ).not.toBeVisible();
    await announceCheckpoint(page, 'Check: user row is gone in Admin > Users');

    const afterDelete = await db('User_Organization')
      .where({ user_id: userId })
      .select('id', 'organization_id');
    await showDbCheck(
      page,
      'Scenario 1 DB verification',
      `SELECT id, organization_id FROM "User_Organization" WHERE user_id = '${userId}';`,
      { beforeDelete, afterDelete }
    );
  });

  test('scenario 2 - UserOrganization_Capability cascades through User_Organization', async ({
    page,
  }) => {
    const email = `${TEST_PREFIX}scenario-2@second-orga.com`;
    const userId = await createDemoUser({
      email,
      selectedOrganizationId: SHARED_ORG_ID,
      addToFiligran: false,
    });
    await db('User_Organization').insert({
      user_id: userId,
      organization_id: SHARED_ORG_ID,
    });
    const [userOrganizationId] = await db('User_Organization')
      .where({ user_id: userId, organization_id: SHARED_ORG_ID })
      .pluck('id');
    await db('UserOrganization_Capability').insert({
      user_organization_id: userOrganizationId,
      name: 'MANAGE_ACCESS',
    });
    const beforeDelete = await db('UserOrganization_Capability')
      .join(
        'User_Organization',
        'User_Organization.id',
        'UserOrganization_Capability.user_organization_id'
      )
      .where('User_Organization.user_id', userId)
      .select('UserOrganization_Capability.id', 'UserOrganization_Capability.name');

    await loginPage.navigateTo();
    await announceInitialData(
      page,
      'Scenario 2 - UserOrganization_Capability CASCADE',
      [
        `test user: ${email}`,
        'User_Organization row exists in shared org',
        'UserOrganization_Capability row MANAGE_ACCESS exists for that membership',
        'expected behavior: deletion removes capability via User_Organization cascade',
      ]
    );
    await loginPage.login(ADMIN_EMAIL);
    await userPage.navigateToUserListAdmin();
    await announceStep(page, `Deleting ${email}`);
    await deleteUserFromAdmin(userPage, email);
    await expect(
      page.getByRole('cell', { name: email, exact: true })
    ).not.toBeVisible();
    await announceCheckpoint(page, 'Check: user row is gone in Admin > Users');

    const afterDelete = await db('UserOrganization_Capability')
      .join(
        'User_Organization',
        'User_Organization.id',
        'UserOrganization_Capability.user_organization_id'
      )
      .where('User_Organization.user_id', userId)
      .select('UserOrganization_Capability.id', 'UserOrganization_Capability.name');
    await showBeforeAfterDbCheck(
      page,
      'Scenario 2 DB verification',
      `SELECT uoc.id, uoc.name FROM "UserOrganization_Capability" uoc JOIN "User_Organization" uo ON uo.id = uoc.user_organization_id WHERE uo.user_id = '${userId}';`,
      beforeDelete,
      afterDelete
    );
  });

  test('scenario 3 - User_Organization_Pending.user_id cascades', async ({
    page,
  }) => {
    const email = `${TEST_PREFIX}scenario-3@filigran.io`;
    const userId = await createDemoUser({ email });
    await db('User_Organization_Pending').insert({
      user_id: userId,
      organization_id: SHARED_ORG_ID,
    });
    const beforeDelete = await db('User_Organization_Pending')
      .where({ user_id: userId })
      .select('id', 'organization_id');

    await loginPage.navigateTo();
    await announceInitialData(
      page,
      'Scenario 3 - User_Organization_Pending CASCADE',
      [
        `test user: ${email}`,
        `pending membership request exists toward organization ${SHARED_ORG_ID}`,
        'expected behavior: deleting user removes pending row',
      ]
    );
    await loginPage.login(ADMIN_EMAIL);
    await userPage.navigateToUserListAdmin();
    await announceStep(page, `Deleting pending-join user ${email}`);
    await deleteUserFromAdmin(userPage, email);
    await expect(
      page.getByRole('cell', { name: email, exact: true })
    ).not.toBeVisible();
    await announceCheckpoint(page, 'Check: user deletion succeeds');
    const afterDelete = await db('User_Organization_Pending')
      .where({ user_id: userId })
      .select('id', 'organization_id');
    await showBeforeAfterDbCheck(
      page,
      'Scenario 3 DB verification',
      `SELECT id, organization_id FROM "User_Organization_Pending" WHERE user_id = '${userId}';`,
      beforeDelete,
      afterDelete
    );
  });

  test('scenario 4 - User_RolePortal.user_id cascades', async ({ page }) => {
    const email = `${TEST_PREFIX}scenario-4@filigran.io`;
    const userId = await createDemoUser({ email });
    const roleId = uuidv4();
    await db('RolePortal').insert({
      id: roleId,
      name: `DEMO_ROLE_${uuidv4()}`,
    });
    await db('User_RolePortal').insert({
      user_id: userId,
      role_portal_id: roleId,
    });
    const beforeDelete = await db('User_RolePortal')
      .where({ user_id: userId })
      .select('id', 'role_portal_id');

    await loginPage.navigateTo();
    await announceInitialData(page, 'Scenario 4 - User_RolePortal CASCADE', [
      `test user: ${email}`,
      'custom RolePortal + User_RolePortal assignment inserted',
      'expected behavior: deleting user removes User_RolePortal assignment',
    ]);
    await loginPage.login(ADMIN_EMAIL);
    await userPage.navigateToUserListAdmin();
    await announceStep(page, `Deleting role-linked user ${email}`);
    await deleteUserFromAdmin(userPage, email);
    await expect(
      page.getByRole('cell', { name: email, exact: true })
    ).not.toBeVisible();
    await announceCheckpoint(page, 'Check: user deletion succeeds');
    const afterDelete = await db('User_RolePortal')
      .where({ user_id: userId })
      .select('id', 'role_portal_id');
    await showBeforeAfterDbCheck(
      page,
      'Scenario 4 DB verification',
      `SELECT id, role_portal_id FROM "User_RolePortal" WHERE user_id = '${userId}';`,
      beforeDelete,
      afterDelete
    );
  });

  test('scenario 5 - User_Service.user_id cascades', async ({ page }) => {
    const email = `${TEST_PREFIX}scenario-5@filigran.io`;
    const userId = await createDemoUser({ email });
    await db('User_Service').insert({
      id: uuidv4(),
      user_id: userId,
      subscription_id: FILIGRAN_SUBSCRIPTION_ID,
      service_personal_data: null,
    });
    const beforeDelete = await db('User_Service')
      .where({ user_id: userId })
      .select('id', 'subscription_id');

    await loginPage.navigateTo();
    await announceInitialData(page, 'Scenario 5 - User_Service CASCADE', [
      `test user: ${email}`,
      `User_Service row linked to subscription ${FILIGRAN_SUBSCRIPTION_ID}`,
      'expected behavior: deleting user removes User_Service row',
    ]);
    await loginPage.login(ADMIN_EMAIL);
    await userPage.navigateToUserListAdmin();
    await announceStep(page, `Deleting subscription-linked user ${email}`);
    await deleteUserFromAdmin(userPage, email);
    await expect(
      page.getByRole('cell', { name: email, exact: true })
    ).not.toBeVisible();
    await announceCheckpoint(page, 'Check: user deletion succeeds');
    const afterDelete = await db('User_Service')
      .where({ user_id: userId })
      .select('id', 'subscription_id');
    await showBeforeAfterDbCheck(
      page,
      'Scenario 5 DB verification',
      `SELECT id, subscription_id FROM "User_Service" WHERE user_id = '${userId}';`,
      beforeDelete,
      afterDelete
    );
  });

  test('scenario 6 - UserService_Capability cascades through User_Service', async ({
    page,
  }) => {
    const email = `${TEST_PREFIX}scenario-6@filigran.io`;
    const userId = await createDemoUser({ email });
    const userServiceId = uuidv4();
    await db('User_Service').insert({
      id: userServiceId,
      user_id: userId,
      subscription_id: FILIGRAN_SUBSCRIPTION_ID,
      service_personal_data: null,
    });
    await db('UserService_Capability').insert({
      id: uuidv4(),
      user_service_id: userServiceId,
      generic_service_capability_id: MANAGE_ACCESS_CAPABILITY_ID,
    });
    const beforeDelete = await db('UserService_Capability')
      .where({ user_service_id: userServiceId })
      .select('id', 'generic_service_capability_id');

    await loginPage.navigateTo();
    await announceInitialData(
      page,
      'Scenario 6 - UserService_Capability CASCADE',
      [
        `test user: ${email}`,
        'User_Service row + UserService_Capability MANAGE_ACCESS inserted',
        'expected behavior: deleting user removes capability row through user_service cascade',
      ]
    );
    await loginPage.login(ADMIN_EMAIL);
    await userPage.navigateToUserListAdmin();
    await announceStep(
      page,
      `Deleting service-capability-linked user ${email}`
    );
    await deleteUserFromAdmin(userPage, email);
    await expect(
      page.getByRole('cell', { name: email, exact: true })
    ).not.toBeVisible();
    await announceCheckpoint(page, 'Check: user deletion succeeds');
    const afterDelete = await db('UserService_Capability')
      .where({ user_service_id: userServiceId })
      .select('id', 'generic_service_capability_id');
    await showBeforeAfterDbCheck(
      page,
      'Scenario 6 DB verification',
      `SELECT id, generic_service_capability_id FROM "UserService_Capability" WHERE user_service_id = '${userServiceId}';`,
      beforeDelete,
      afterDelete
    );
  });

  test('scenario 7 - ServiceGroup_User.user_id cascades', async ({ page }) => {
    const email = `${TEST_PREFIX}scenario-7@filigran.io`;
    const userId = await createDemoUser({ email });
    const groupId = uuidv4();
    await db('ServiceGroup').insert({
      id: groupId,
      name: `demo-group-${uuidv4()}`,
      service_instance_id: VAULT_SERVICE_INSTANCE_ID,
    });
    await db('ServiceGroup_User').insert({
      group_id: groupId,
      user_id: userId,
    });
    const beforeDelete = await db('ServiceGroup_User')
      .where({ user_id: userId })
      .select('group_id', 'user_id');

    await loginPage.navigateTo();
    await announceInitialData(page, 'Scenario 7 - ServiceGroup_User CASCADE', [
      `test user: ${email}`,
      `ServiceGroup_User row exists for service instance ${VAULT_SERVICE_INSTANCE_ID}`,
      'expected behavior: deleting user removes group membership row',
    ]);
    await loginPage.login(ADMIN_EMAIL);
    await userPage.navigateToUserListAdmin();
    await announceStep(page, `Deleting grouped user ${email}`);
    await deleteUserFromAdmin(userPage, email);
    await expect(
      page.getByRole('cell', { name: email, exact: true })
    ).not.toBeVisible();
    await announceCheckpoint(page, 'Check: user deletion succeeds');
    const afterDelete = await db('ServiceGroup_User')
      .where({ user_id: userId })
      .select('group_id', 'user_id');
    await showBeforeAfterDbCheck(
      page,
      'Scenario 7 DB verification',
      `SELECT group_id, user_id FROM "ServiceGroup_User" WHERE user_id = '${userId}';`,
      beforeDelete,
      afterDelete
    );
  });

  test('scenario 8 - User_TransferRequest blocks deletion', async ({
    page,
  }) => {
    const fromEmail = `${TEST_PREFIX}scenario-8-from@filigran.io`;
    const toEmail = `${TEST_PREFIX}scenario-8-to@filigran.io`;
    const fromUserId = await createDemoUser({ email: fromEmail });
    const toUserId = await createDemoUser({ email: toEmail });
    await db('User_TransferRequest').insert({
      id: uuidv4(),
      from_user_id: fromUserId,
      to_user_id: toUserId,
    });
    const beforeDelete = await db('User_TransferRequest')
      .where({ from_user_id: fromUserId, to_user_id: toUserId })
      .select('id', 'from_user_id', 'to_user_id');

    await loginPage.navigateTo();
    await announceInitialData(
      page,
      'Scenario 8 - User_TransferRequest BLOCKED',
      [
        `from user: ${fromEmail}`,
        `to user: ${toEmail}`,
        'pending User_TransferRequest exists',
        'expected behavior: user deletion is blocked with transfer warning',
      ]
    );
    await loginPage.login(ADMIN_EMAIL);
    await userPage.navigateToUserListAdmin();
    await announceStep(
      page,
      `Trying to delete ${fromEmail} while transfer is pending`
    );
    await deleteUserFromAdmin(userPage, fromEmail);
    await expectDeleteBlocked(page, fromEmail, BLOCKED_MESSAGES.transfer);
    await announceCheckpoint(
      page,
      'Check: deletion is blocked with transfer warning'
    );
    const afterDelete = await db('User_TransferRequest')
      .where({ from_user_id: fromUserId, to_user_id: toUserId })
      .select('id', 'from_user_id', 'to_user_id');
    await showBeforeAfterDbCheck(
      page,
      'Scenario 8 DB verification',
      `SELECT id, from_user_id, to_user_id FROM "User_TransferRequest" WHERE from_user_id = '${fromUserId}' AND to_user_id = '${toUserId}';`,
      beforeDelete,
      afterDelete
    );
  });

  test('scenario 9 - DeploymentRequest.user_requester_id blocks deletion', async ({
    page,
  }) => {
    const statuses = [
      'queued',
      'pending',
      'provisioning',
      'active',
      'expired',
      'failed',
      'cancelled',
    ];
    const email = `${TEST_PREFIX}scenario-9@filigran.io`;
    const userId = await createDemoUser({ email });

    for (const hubStatus of statuses) {
      await insertDeploymentRequest({
        id: uuidv4(),
        user_requester_id: userId,
        organization_requester_id: FILIGRAN_ORG_ID,
        type: 'trial',
        request_date: new Date(),
        start_date: new Date(),
        end_date: new Date(),
        platform_identifier: `demo-${hubStatus}`,
        hub_status: hubStatus,
        target_state: 'active',
        actual_state: 'provisioned',
        ordering: 1,
        counts_in_orga_quota: true,
        region: 'eu-west',
        platform_token: uuidv4(),
      });
    }
    const beforeDelete = await db('DeploymentRequest')
      .where({ user_requester_id: userId })
      .select('id', 'hub_status', 'user_requester_id');

    await loginPage.navigateTo();
    await announceInitialData(
      page,
      'Scenario 9 - DeploymentRequest requester BLOCKED',
      [
        `test user: ${email}`,
        'deployment requests inserted across statuses: queued, pending, provisioning, active, expired, failed, cancelled',
        'expected behavior: deletion is blocked at all stages',
      ]
    );
    await loginPage.login(ADMIN_EMAIL);
    await userPage.navigateToUserListAdmin();
    await announceStep(
      page,
      `Trying to delete deployment-request owner ${email}`
    );
    await deleteUserFromAdmin(userPage, email);
    await expectDeleteBlocked(page, email, BLOCKED_MESSAGES.deployment);
    await announceCheckpoint(
      page,
      'Check: deletion is blocked for deployment-linked user'
    );
    const afterDelete = await db('DeploymentRequest')
      .where({ user_requester_id: userId })
      .select('id', 'hub_status', 'user_requester_id');
    await showBeforeAfterDbCheck(
      page,
      'Scenario 9 DB verification',
      `SELECT id, hub_status, user_requester_id FROM "DeploymentRequest" WHERE user_requester_id = '${userId}';`,
      beforeDelete,
      afterDelete
    );
  });

  test('scenario 10 - DeploymentRequest.cancellation_user_id blocks deletion', async ({
    page,
  }) => {
    const requesterEmail = `${TEST_PREFIX}scenario-10-requester@filigran.io`;
    const cancellerEmail = `${TEST_PREFIX}scenario-10-canceller@filigran.io`;
    const requesterId = await createDemoUser({ email: requesterEmail });
    const cancellerId = await createDemoUser({ email: cancellerEmail });

    await insertDeploymentRequest({
      id: uuidv4(),
      user_requester_id: requesterId,
      organization_requester_id: FILIGRAN_ORG_ID,
      type: 'trial',
      request_date: new Date(),
      start_date: new Date(),
      end_date: new Date(),
      platform_identifier: 'demo-cancelled',
      hub_status: 'cancelled',
      target_state: 'inactive',
      actual_state: 'cancelled',
      ordering: 1,
      counts_in_orga_quota: true,
      region: 'eu-west',
      platform_token: uuidv4(),
      cancellation_user_id: cancellerId,
    });
    const beforeDelete = await db('DeploymentRequest')
      .where({ cancellation_user_id: cancellerId })
      .select('id', 'hub_status', 'cancellation_user_id');

    await loginPage.navigateTo();
    await announceInitialData(
      page,
      'Scenario 10 - DeploymentRequest cancellation actor BLOCKED',
      [
        `requester user: ${requesterEmail}`,
        `cancellation user: ${cancellerEmail}`,
        'cancelled DeploymentRequest links cancellation_user_id to target user',
        'expected behavior: deletion of cancellation actor is blocked',
      ]
    );
    await loginPage.login(ADMIN_EMAIL);
    await userPage.navigateToUserListAdmin();
    await announceStep(
      page,
      `Trying to delete cancellation actor ${cancellerEmail}`
    );
    await deleteUserFromAdmin(userPage, cancellerEmail);
    await expectDeleteBlocked(
      page,
      cancellerEmail,
      BLOCKED_MESSAGES.cancellation
    );
    await announceCheckpoint(
      page,
      'Check: deletion is blocked with cancellation warning'
    );
    const afterDelete = await db('DeploymentRequest')
      .where({ cancellation_user_id: cancellerId })
      .select('id', 'hub_status', 'cancellation_user_id');
    await showBeforeAfterDbCheck(
      page,
      'Scenario 10 DB verification',
      `SELECT id, hub_status, cancellation_user_id FROM "DeploymentRequest" WHERE cancellation_user_id = '${cancellerId}';`,
      beforeDelete,
      afterDelete
    );
  });

  test('scenario 11 - Document.uploader_id is reassigned to system user', async ({
    page,
  }) => {
    const email = `${TEST_PREFIX}scenario-11@filigran.io`;
    const userId = await createDemoUser({ email });
    const documentId = uuidv4();
    await db('Document').insert({
      id: documentId,
      type: 'image',
      uploader_id: userId,
      uploader_organization_id: userId,
      file_name: `demo-s11-${uuidv4()}.txt`,
      minio_name: `demo-s11-${uuidv4()}`,
      active: true,
      created_at: new Date(),
    });
    const beforeDelete = await db('Document')
      .where({ id: documentId })
      .select('id', 'uploader_id', 'uploader_organization_id');

    await loginPage.navigateTo();
    await announceInitialData(
      page,
      'Scenario 11 - Document uploader reassigned',
      [
        `test user: ${email}`,
        'document row exists with uploader_id = test user',
        'expected behavior: deletion succeeds and uploader_id becomes system user',
      ]
    );
    await loginPage.login(ADMIN_EMAIL);
    await userPage.navigateToUserListAdmin();
    await announceStep(page, `Deleting document-uploader user ${email}`);
    await deleteUserFromAdmin(userPage, email);
    await expect(
      page.getByRole('cell', { name: email, exact: true })
    ).not.toBeVisible();

    await expect
      .poll(
        async () =>
          (await db('Document').where({ id: documentId }).first()).uploader_id
      )
      .toBe(SYSTEM_USER_ID);
    await announceCheckpoint(
      page,
      'Check: deletion succeeds; DB verification confirms uploader reassignment'
    );
    const afterDelete = await db('Document')
      .where({ id: documentId })
      .select('id', 'uploader_id', 'uploader_organization_id');
    await showBeforeAfterDbCheck(
      page,
      'Scenario 11 DB verification',
      `SELECT id, uploader_id, uploader_organization_id FROM "Document" WHERE id = '${documentId}';`,
      beforeDelete,
      afterDelete
    );
  });

  test('scenario 12 - Document.remover_id/updater_id are reassigned', async ({
    page,
  }) => {
    const email = `${TEST_PREFIX}scenario-12@filigran.io`;
    const userId = await createDemoUser({ email });
    const documentId = uuidv4();
    await db('Document').insert({
      id: documentId,
      type: 'image',
      uploader_id: 'ba091095-418f-4b4f-b150-6c9295e232c3',
      uploader_organization_id: FILIGRAN_ORG_ID,
      remover_id: userId,
      updater_id: userId,
      file_name: `demo-s12-${uuidv4()}.txt`,
      minio_name: `demo-s12-${uuidv4()}`,
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
      name: 'demo-s12',
    });
    const beforeDelete = await db('Document')
      .where({ id: documentId })
      .select('id', 'remover_id', 'updater_id');

    await loginPage.navigateTo();
    await announceInitialData(
      page,
      'Scenario 12 - Document remover/updater reassigned',
      [
        `test user: ${email}`,
        'document row exists with remover_id and updater_id = test user',
        'expected behavior: deletion succeeds and both fields become system user',
      ]
    );
    await loginPage.login(ADMIN_EMAIL);
    await userPage.navigateToUserListAdmin();
    await announceStep(page, `Deleting document-editor user ${email}`);
    await deleteUserFromAdmin(userPage, email);
    await expect(
      page.getByRole('cell', { name: email, exact: true })
    ).not.toBeVisible();

    await expect
      .poll(async () => {
        const row = await db('Document').where({ id: documentId }).first();
        return `${row.remover_id}:${row.updater_id}`;
      })
      .toBe(`${SYSTEM_USER_ID}:${SYSTEM_USER_ID}`);
    await announceCheckpoint(
      page,
      'Check: deletion succeeds; DB verification confirms remover/updater reassignment'
    );
    const afterDelete = await db('Document')
      .where({ id: documentId })
      .select('id', 'remover_id', 'updater_id');
    await showBeforeAfterDbCheck(
      page,
      'Scenario 12 DB verification',
      `SELECT id, remover_id, updater_id FROM "Document" WHERE id = '${documentId}';`,
      beforeDelete,
      afterDelete
    );
  });

  test('scenario 13 - Epic.uploader_id/updater_id are reassigned', async ({
    page,
  }) => {
    const email = `${TEST_PREFIX}scenario-13@filigran.io`;
    const userId = await createDemoUser({ email });
    const epicId = uuidv4();
    await db('Epic').insert({
      id: epicId,
      title: 'Demo Epic',
      active: true,
      short_description: 'short',
      description: 'description',
      product: 'opencti',
      timeline: 'now',
      epic_type: 'other',
      uploader_id: userId,
      updater_id: userId,
      edition_type: 'community_edition',
      created_at: new Date(),
    });
    const beforeDelete = await db('Epic')
      .where({ id: epicId })
      .select('id', 'uploader_id', 'updater_id');

    await loginPage.navigateTo();
    await announceInitialData(page, 'Scenario 13 - Epic fields reassigned', [
      `test user: ${email}`,
      'epic row exists with uploader_id and updater_id = test user',
      'expected behavior: deletion succeeds and both fields become system user',
    ]);
    await loginPage.login(ADMIN_EMAIL);
    await userPage.navigateToUserListAdmin();
    await announceStep(page, `Deleting roadmap-contributor user ${email}`);
    await deleteUserFromAdmin(userPage, email);
    await expect(
      page.getByRole('cell', { name: email, exact: true })
    ).not.toBeVisible();

    await expect
      .poll(async () => {
        const row = await db('Epic').where({ id: epicId }).first();
        return `${row.uploader_id}:${row.updater_id}`;
      })
      .toBe(`${SYSTEM_USER_ID}:${SYSTEM_USER_ID}`);
    await announceCheckpoint(
      page,
      'Check: deletion succeeds; DB verification confirms epic attribution reassignment'
    );
    const afterDelete = await db('Epic')
      .where({ id: epicId })
      .select('id', 'uploader_id', 'updater_id');
    await showBeforeAfterDbCheck(
      page,
      'Scenario 13 DB verification',
      `SELECT id, uploader_id, updater_id FROM "Epic" WHERE id = '${epicId}';`,
      beforeDelete,
      afterDelete
    );
  });

  test('scenario 14 - PlatformConfiguration.registerer_id blocks deletion', async ({
    page,
  }) => {
    const email = `${TEST_PREFIX}scenario-14@filigran.io`;
    const userId = await createDemoUser({ email });

    for (const status of ['active', 'inactive']) {
      const serviceInstanceId = uuidv4();
      await db('ServiceInstance').insert({
        id: serviceInstanceId,
        name: `demo-s14-${status}-${uuidv4()}`,
        description: 'demo',
        creation_status: 'READY',
        public: false,
        tags: ['demo'],
        service_definition_id: '2634d52b-f061-4ebc-bed2-c6cc94297ad1',
      });
      await db('PlatformConfiguration').insert({
        service_instance_id: serviceInstanceId,
        registerer_id: userId,
        platform_id: uuidv4(),
        tenant_id: null,
        tenant_name: null,
        platform_url: 'https://demo.platform.local',
        platform_title: `demo-${status}`,
        platform_version: '1.0.0',
        platform_contract: '{}',
        token: uuidv4(),
        status,
      });
    }
    const beforeDelete = await db('PlatformConfiguration')
      .where({ registerer_id: userId })
      .select('service_instance_id', 'status', 'registerer_id');

    await loginPage.navigateTo();
    await announceInitialData(
      page,
      'Scenario 14 - PlatformConfiguration registerer BLOCKED',
      [
        `test user: ${email}`,
        'two platform registrations exist for user (active and inactive)',
        'expected behavior: deletion is blocked in both cases',
      ]
    );
    await loginPage.login(ADMIN_EMAIL);
    await userPage.navigateToUserListAdmin();
    await announceStep(
      page,
      `Trying to delete platform-registerer user ${email}`
    );
    await deleteUserFromAdmin(userPage, email);
    await expectDeleteBlocked(
      page,
      email,
      BLOCKED_MESSAGES.platformRegistration
    );
    await announceCheckpoint(
      page,
      'Check: deletion is blocked for both active and inactive platform registrations'
    );
    const afterDelete = await db('PlatformConfiguration')
      .where({ registerer_id: userId })
      .select('service_instance_id', 'status', 'registerer_id');
    await showBeforeAfterDbCheck(
      page,
      'Scenario 14 DB verification',
      `SELECT service_instance_id, status, registerer_id FROM "PlatformConfiguration" WHERE registerer_id = '${userId}';`,
      beforeDelete,
      afterDelete
    );
  });

  test('scenario 15 - OneClickDeployment.user_id is set to null', async ({
    page,
  }) => {
    const email = `${TEST_PREFIX}scenario-15@filigran.io`;
    const userId = await createDemoUser({ email });
    const deploymentId = uuidv4();
    const resourceId = uuidv4();
    await db('OneClickDeployment').insert({
      id: deploymentId,
      resource_id: resourceId,
      platform_id: uuidv4(),
      tenant_id: null,
      user_id: userId,
      deployed_at: new Date(),
    });
    const beforeDelete = await db('OneClickDeployment')
      .where({ id: deploymentId })
      .select('id', 'resource_id', 'user_id');

    await loginPage.navigateTo();
    await announceInitialData(
      page,
      'Scenario 15 - OneClickDeployment user_id set to null',
      [
        `test user: ${email}`,
        'OneClickDeployment row exists with user_id = test user',
        'expected behavior: deleting the user preserves the deployment row and sets user_id to null',
      ]
    );
    await loginPage.login(ADMIN_EMAIL);
    await userPage.navigateToUserListAdmin();
    await announceStep(page, `Deleting one-click-deployment user ${email}`);
    await deleteUserFromAdmin(userPage, email);
    await expect(
      page.getByRole('cell', { name: email, exact: true })
    ).not.toBeVisible();

    await expect
      .poll(
        async () =>
          (await db('OneClickDeployment').where({ id: deploymentId }).first())
            ?.user_id
      )
      .toBeNull();
    await announceCheckpoint(
      page,
      'Check: deletion succeeds; deployment row is preserved with user_id = null'
    );
    const afterDelete = await db('OneClickDeployment')
      .where({ id: deploymentId })
      .select('id', 'resource_id', 'user_id');
    expect(afterDelete).toHaveLength(1);
    expect(afterDelete[0]).toMatchObject({
      id: deploymentId,
      resource_id: resourceId,
      user_id: null,
    });
    await showBeforeAfterDbCheck(
      page,
      'Scenario 15 DB verification',
      `SELECT id, resource_id, user_id FROM "OneClickDeployment" WHERE id = '${deploymentId}';`,
      beforeDelete,
      afterDelete
    );
  });

  test.skip('scenario 16 - Document.uploader_organization_id -> Organization (out of scope)', async () => {
    // Intentionally skipped: this scenario is explicitly out of scope.
  });

  test('scenario 17 - User.selected_organization_id ordering safety', async ({
    page,
  }) => {
    const email = `${TEST_PREFIX}scenario-17@filigran.io`;
    await createDemoUser({ email });
    const beforeDelete = await db('User')
      .where({ email })
      .select('id', 'selected_organization_id');

    await loginPage.navigateTo();
    await announceInitialData(
      page,
      'Scenario 17 - selected_organization_id ordering',
      [
        `test user: ${email}`,
        'user has personal space + selected organization set',
        'expected behavior: deletion succeeds without generic FK/order error',
      ]
    );
    await loginPage.login(ADMIN_EMAIL);
    await userPage.navigateToUserListAdmin();
    await announceStep(page, `Deleting regular user ${email}`);
    await deleteUserFromAdmin(userPage, email);
    await expect(
      page.getByRole('cell', { name: email, exact: true })
    ).not.toBeVisible();
    await announceCheckpoint(
      page,
      'Check: deletion completes without generic error (ordering constraint respected)'
    );
    const afterDelete = await db('User')
      .where({ email })
      .select('id', 'selected_organization_id');
    await showBeforeAfterDbCheck(
      page,
      'Scenario 17 DB verification',
      `SELECT id, selected_organization_id FROM "User" WHERE email = '${email}';`,
      beforeDelete,
      afterDelete
    );
  });

  test('scenario 18 - session cleanup logs out deleted user', async ({
    browser,
    page,
  }) => {
    const email = `${TEST_PREFIX}scenario-18@filigran.io`;
    const userId = await createDemoUser({ email });

    const userContext = await browser.newContext({
      baseURL: 'http://localhost:3002',
    });
    const userPageSession = await userContext.newPage();
    const userLogin = new LoginPage(userPageSession);
    await userLogin.navigateToAndLogin(email);
    await expect(
      userPageSession.getByRole('button', { name: 'Open menu user' })
    ).toBeVisible();
    const beforeDelete = await db('sessions')
      .whereRaw(`sess #>> '{passport,user}' = ?`, [userId])
      .select('sid');

    await loginPage.navigateTo();
    await announceInitialData(page, 'Scenario 18 - sessions cleanup', [
      `test user: ${email}`,
      'user is logged in in a second browser context (active session)',
      'expected behavior: deleting user invalidates session and logs user out on refresh',
    ]);
    await loginPage.login(ADMIN_EMAIL);
    await userPage.navigateToUserListAdmin();
    await announceStep(page, `Deleting active-session user ${email}`);
    await deleteUserFromAdmin(userPage, email);
    await expect(
      page.getByRole('cell', { name: email, exact: true })
    ).not.toBeVisible();

    await userPageSession.reload();
    await expect(
      userPageSession.getByRole('button', { name: 'Sign in' })
    ).toBeVisible();
    await announceCheckpoint(
      page,
      'Check: deleted user is logged out on refresh (session destroyed)'
    );
    const afterDelete = await db('sessions')
      .whereRaw(`sess #>> '{passport,user}' = ?`, [userId])
      .select('sid');
    await showBeforeAfterDbCheck(
      page,
      'Scenario 18 DB verification',
      `SELECT sid FROM "sessions" WHERE sess #>> '{passport,user}' = '${userId}';`,
      beforeDelete,
      afterDelete
    );
    await userContext.close();
  });

  test('scenario 19 - last-organization-member guard blocks deletion', async ({
    page,
  }) => {
    const email = `${TEST_PREFIX}scenario-19@filigran.io`;
    const userId = await createDemoUser({ email });
    const organizationId = uuidv4();
    await db('Organization').insert({
      id: organizationId,
      name: `demo-last-member-${uuidv4()}`,
      personal_space: false,
    });
    await db('User_Organization').insert({
      user_id: userId,
      organization_id: organizationId,
    });
    const beforeDelete = await db('User_Organization')
      .where({ organization_id: organizationId })
      .select('user_id', 'organization_id');

    await loginPage.navigateTo();
    await announceInitialData(
      page,
      'Scenario 19 - last organization member BLOCKED',
      [
        `test user: ${email}`,
        'user is sole member of a non-personal organization',
        'expected behavior: deletion is blocked as last organization member',
      ]
    );
    await loginPage.login(ADMIN_EMAIL);
    await userPage.navigateToUserListAdmin();
    await announceStep(page, `Trying to delete last-member user ${email}`);
    await deleteUserFromAdmin(userPage, email);
    await expectDeleteBlocked(
      page,
      email,
      BLOCKED_MESSAGES.lastOrganizationMember
    );
    await announceCheckpoint(
      page,
      'Check: deletion is blocked for last organization member'
    );
    const afterDelete = await db('User_Organization')
      .where({ organization_id: organizationId })
      .select('user_id', 'organization_id');
    await showBeforeAfterDbCheck(
      page,
      'Scenario 19 DB verification',
      `SELECT user_id, organization_id FROM "User_Organization" WHERE organization_id = '${organizationId}';`,
      beforeDelete,
      afterDelete
    );
  });

  test('scenario 20 - personal-space pending-users guard blocks deletion', async ({
    page,
  }) => {
    const ownerEmail = `${TEST_PREFIX}scenario-20-owner@filigran.io`;
    const pendingEmail = `${TEST_PREFIX}scenario-20-pending@filigran.io`;
    const ownerId = await createDemoUser({ email: ownerEmail });
    const pendingId = await createDemoUser({ email: pendingEmail });

    await db('User_Organization_Pending').insert({
      user_id: pendingId,
      organization_id: ownerId,
    });
    const beforeDelete = await db('User_Organization_Pending')
      .where({ organization_id: ownerId })
      .select('user_id', 'organization_id');

    await loginPage.navigateTo();
    await announceInitialData(
      page,
      'Scenario 20 - personal space pending users BLOCKED',
      [
        `owner user: ${ownerEmail}`,
        `pending user: ${pendingEmail}`,
        'pending join request points to owner personal space organization',
        'expected behavior: owner deletion is blocked by pending users guard',
      ]
    );
    await loginPage.login(ADMIN_EMAIL);
    await userPage.navigateToUserListAdmin();
    await announceStep(
      page,
      `Trying to delete personal-space owner ${ownerEmail}`
    );
    await deleteUserFromAdmin(userPage, ownerEmail);
    await expectDeleteBlocked(page, ownerEmail, BLOCKED_MESSAGES.pendingUsers);
    await announceCheckpoint(
      page,
      'Check: deletion is blocked by pending users guard'
    );
    const afterDelete = await db('User_Organization_Pending')
      .where({ organization_id: ownerId })
      .select('user_id', 'organization_id');
    await showBeforeAfterDbCheck(
      page,
      'Scenario 20 DB verification',
      `SELECT user_id, organization_id FROM "User_Organization_Pending" WHERE organization_id = '${ownerId}';`,
      beforeDelete,
      afterDelete
    );
  });
});
