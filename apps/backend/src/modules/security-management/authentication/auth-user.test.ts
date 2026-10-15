import { v4 as uuidv4 } from 'uuid';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UserAccountStatus } from '../../../__generated__/resolvers-types';
import portalConfig from '../../../config';
import { UserId } from '../../../model/kanel/public/User';
import {
  ProviderUserInfo,
  UserInfo,
  UserLoadUserBy,
} from '../../../model/user';
import { ForbiddenErrorCode } from '../../../utils/error/error.code';
import { ServiceGroupApp } from '../../deployment/group/service-group.app';
import { UserDomain } from '../../organization-management/user/user-domain/user.domain';
import { UserProvisioningApp } from '../../organization-management/user/user-provisioning/user-provisioning.app';
import { UserHelper } from '../../organization-management/user/user.helper';
import {
  authenticateUser,
  isSessionUserActive,
  loginFromProvider,
} from './auth-user';

vi.mock('../../deployment/group/service-group.app', () => ({
  ServiceGroupApp: {
    grantAccessAtLogin: vi.fn(),
  },
}));

const asSessionUser = (id: string) => ({ id }) as UserLoadUserBy;

const createTestUser = async () => {
  const email = `auth-user-session-${uuidv4()}@filigran.io`;
  await UserProvisioningApp.autoProvisionNewUser({ email });
  const user = (await UserDomain.loadUserBy({ email }))!;
  return { email, user };
};

const buildRequest = () =>
  ({ session: { save: vi.fn() } }) as unknown as Parameters<
    typeof authenticateUser
  >[0];
const buildResponse = () =>
  ({ cookie: vi.fn() }) as unknown as Parameters<typeof authenticateUser>[1];
const asUserInfo = (email: string): UserInfo => ({
  email,
  first_name: 'Test',
  last_name: 'User',
  roles: [],
});
const asProviderUserInfo = (
  email: string,
  idpSubject: string
): ProviderUserInfo => ({ ...asUserInfo(email), idp_subject: idpSubject });
const newEmail = () => `auth-user-login-${uuidv4()}@filigran.io`;
const newIdpSubject = () => `auth0|${uuidv4()}`;
const loadIdpSubject = async (email: string) => {
  const [user] = await UserDomain.loadUser({ email });
  return user?.idp_subject;
};

const UNVERIFIED_IDP_SUBJECT = 'auth0|unverified-user';
const REGENERATE_ERROR = 'session store unavailable';

describe('isSessionUserActive', () => {
  describe('with a session that carries no usable identity', () => {
    it.each`
      sessionUser          | description
      ${undefined}         | ${'no user at all'}
      ${{}}                | ${'user without an id'}
      ${{ id: undefined }} | ${'user with an undefined id'}
      ${{ id: '' }}        | ${'user with an empty id'}
    `('should return false for $description', async ({ sessionUser }) => {
      await expect(isSessionUserActive(sessionUser)).resolves.toBe(false);
    });
  });

  describe('against the database', () => {
    let email: string | undefined;

    afterEach(async () => {
      if (email) {
        await UserHelper.removeUser({ email });
        email = undefined;
      }
    });

    it('should return true for an existing active user', async () => {
      const testUser = await createTestUser();
      email = testUser.email;

      await expect(
        isSessionUserActive(asSessionUser(testUser.user.id))
      ).resolves.toBe(true);
    });

    it('should return false once the account has been disabled', async () => {
      const testUser = await createTestUser();
      email = testUser.email;
      await UserDomain.updateUser(testUser.user.id, { disabled: true });

      await expect(
        isSessionUserActive(asSessionUser(testUser.user.id))
      ).resolves.toBe(false);
    });

    it('should return false once the account has been deleted', async () => {
      const { email: userEmail, user } = await createTestUser();
      await UserHelper.removeUser({ email: userEmail });

      await expect(isSessionUserActive(asSessionUser(user.id))).resolves.toBe(
        false
      );
    });

    it('should return false for an id that never existed', async () => {
      await expect(
        isSessionUserActive(asSessionUser(uuidv4() as UserId))
      ).resolves.toBe(false);
    });
  });
});

describe('authenticateUser', () => {
  let email: string | undefined;

  afterEach(async () => {
    vi.clearAllMocks();
    if (email) {
      await UserHelper.removeUser({ email });
      email = undefined;
    }
  });

  it('should update the session then delegate the access grant to ServiceGroupApp', async () => {
    const testUser = await createTestUser();
    email = testUser.email;
    await UserDomain.updateUser(testUser.user.id, {
      status: UserAccountStatus.Waiting,
    });

    const req = buildRequest();
    await authenticateUser(req, buildResponse(), asUserInfo(email));

    expect(req.session.user?.id).toBe(testUser.user.id);
    expect(ServiceGroupApp.grantAccessAtLogin).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        id: testUser.user.id,
        status: UserAccountStatus.Waiting,
      })
    );
  });

  it('should reject and not touch the session for a disabled user', async () => {
    const testUser = await createTestUser();
    email = testUser.email;
    await UserDomain.updateUser(testUser.user.id, { disabled: true });

    const req = buildRequest();
    await expect(
      authenticateUser(req, buildResponse(), asUserInfo(email))
    ).rejects.toThrow();

    expect(req.session.user).toBeUndefined();
    expect(ServiceGroupApp.grantAccessAtLogin).not.toHaveBeenCalled();
  });
});

describe('loginFromProvider', () => {
  let emails: string[] = [];

  afterEach(async () => {
    for (const email of emails) {
      await UserHelper.removeUser({ email });
    }
    emails = [];
  });

  it('should refuse the sign-in when the IdP gives no subject', async () => {
    // Given
    const email = newEmail();

    // When
    const signingIn = loginFromProvider(asProviderUserInfo(email, ''));

    // Then
    await expect(signingIn).rejects.toThrow(
      ForbiddenErrorCode.IdpSubjectNotProvided
    );
  });

  it('should bind the subject to a new account on its first sign-in', async () => {
    // Given
    const email = newEmail();
    const idpSubject = newIdpSubject();
    emails.push(email);

    // When
    await loginFromProvider(asProviderUserInfo(email, idpSubject));

    // Then
    expect(await loadIdpSubject(email)).toBe(idpSubject);
  });

  it('should bind the subject to an existing account that has none yet', async () => {
    // Given
    const { email } = await createTestUser();
    const idpSubject = newIdpSubject();
    emails.push(email);

    // When
    await loginFromProvider(asProviderUserInfo(email, idpSubject));

    // Then
    expect(await loadIdpSubject(email)).toBe(idpSubject);
  });

  it('should sign in when the bound subject comes back', async () => {
    // Given
    const { email, user } = await createTestUser();
    const idpSubject = newIdpSubject();
    emails.push(email);
    await loginFromProvider(asProviderUserInfo(email, idpSubject));

    // When
    const signedIn = await loginFromProvider(
      asProviderUserInfo(email, idpSubject)
    );

    // Then
    expect(signedIn).toMatchObject({ id: user.id, idp_subject: idpSubject });
  });

  describe('while mismatches are only logged', () => {
    it('should still sign in when another subject claims a bound email', async () => {
      // Given
      const { email, user } = await createTestUser();
      emails.push(email);
      await loginFromProvider(asProviderUserInfo(email, newIdpSubject()));

      // When
      const signedIn = await loginFromProvider(
        asProviderUserInfo(email, newIdpSubject())
      );

      // Then
      expect(signedIn).toMatchObject({ id: user.id });
    });

    it('should keep the first subject when another subject claims a bound email', async () => {
      // Given
      const { email } = await createTestUser();
      const firstIdpSubject = newIdpSubject();
      emails.push(email);
      await loginFromProvider(asProviderUserInfo(email, firstIdpSubject));

      // When
      await loginFromProvider(asProviderUserInfo(email, newIdpSubject()));

      // Then
      expect(await loadIdpSubject(email)).toBe(firstIdpSubject);
    });

    it('should not bind a subject that is already bound to another account', async () => {
      // Given
      const idpSubject = newIdpSubject();
      const boundEmail = newEmail();
      const otherEmail = newEmail();
      emails.push(boundEmail, otherEmail);
      await loginFromProvider(asProviderUserInfo(boundEmail, idpSubject));

      // When
      await loginFromProvider(asProviderUserInfo(otherEmail, idpSubject));

      // Then
      expect(await loadIdpSubject(otherEmail)).toBeNull();
    });
  });

  describe('when mismatches are enforced', () => {
    beforeEach(() => {
      portalConfig.user_management.enforce_idp_subject = true;
    });

    afterEach(() => {
      portalConfig.user_management.enforce_idp_subject = false;
    });

    it('should refuse the sign-in when another subject claims a bound email', async () => {
      // Given
      const { email } = await createTestUser();
      emails.push(email);
      await loginFromProvider(asProviderUserInfo(email, newIdpSubject()));

      // When
      const signingIn = loginFromProvider(
        asProviderUserInfo(email, newIdpSubject())
      );

      // Then
      await expect(signingIn).rejects.toThrow(
        ForbiddenErrorCode.IdpSubjectMismatch
      );
    });

    it('should refuse the sign-in without creating an account when a bound subject claims another email', async () => {
      // Given
      const idpSubject = newIdpSubject();
      const boundEmail = newEmail();
      const otherEmail = newEmail();
      emails.push(boundEmail);
      await loginFromProvider(asProviderUserInfo(boundEmail, idpSubject));

      // When
      const signingIn = loginFromProvider(
        asProviderUserInfo(otherEmail, idpSubject)
      );

      // Then
      await expect(signingIn).rejects.toThrow(
        ForbiddenErrorCode.IdpSubjectMismatch
      );
      expect(await UserDomain.loadUser({ email: otherEmail })).toEqual([]);
    });
  });
});
