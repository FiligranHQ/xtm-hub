import { logApp } from './app-logger.util';

export interface DevUser {
  email: string;
  password: string;
  roles?: string[];
  organization?: {
    name: string;
    domains?: string[];
  };
}

export interface DevUserValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates a single dev user configuration
 */
export const validateDevUser = (user: unknown): DevUserValidationResult => {
  const errors: string[] = [];

  // Type guard to ensure user is an object
  if (typeof user !== 'object' || user === null) {
    errors.push('user must be an object');
    return { isValid: false, errors };
  }

  const userObj = user as Record<string, unknown>;

  // Check required fields
  if (!userObj.email || typeof userObj.email !== 'string') {
    errors.push('email is required and must be a string');
  } else if (!isValidEmail(userObj.email)) {
    errors.push('email must be a valid email address');
  }

  if (!userObj.password || typeof userObj.password !== 'string') {
    errors.push('password is required and must be a string');
  } else if (userObj.password.length < 6) {
    errors.push('password must be at least 6 characters long');
  }

  // Check optional fields
  if (userObj.roles !== undefined) {
    if (!Array.isArray(userObj.roles)) {
      errors.push('roles must be an array');
    } else if (
      userObj.roles.some((role: unknown) => typeof role !== 'string')
    ) {
      errors.push('all roles must be strings');
    }
  }

  if (userObj.organization !== undefined) {
    if (
      typeof userObj.organization !== 'object' ||
      userObj.organization === null
    ) {
      errors.push('organization must be an object');
    } else {
      const orgObj = userObj.organization as Record<string, unknown>;
      if (!orgObj.name || typeof orgObj.name !== 'string') {
        errors.push('organization.name is required and must be a string');
      }

      if (orgObj.domains !== undefined) {
        if (!Array.isArray(orgObj.domains)) {
          errors.push('organization.domains must be an array');
        } else if (
          orgObj.domains.some((domain: unknown) => typeof domain !== 'string')
        ) {
          errors.push('all organization.domains must be strings');
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates an array of dev users
 */
export const validateDevUsers = (users: unknown[]): DevUser[] => {
  const validUsers: DevUser[] = [];

  users.forEach((user, index) => {
    const validation = validateDevUser(user);

    if (validation.isValid) {
      validUsers.push(user as DevUser);
    } else {
      logApp.warn(
        `Invalid dev user at index ${index}: ${validation.errors.join(', ')}`
      );
    }
  });

  return validUsers;
};

/**
 * Basic email validation
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Parses and validates DEV_USERS environment variable
 */
export const parseAndValidateDevUsers = (): DevUser[] | undefined => {
  const devUsersEnv = process.env.DEV_USERS;
  if (!devUsersEnv) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(devUsersEnv);

    if (!Array.isArray(parsed)) {
      logApp.warn('DEV_USERS should be an array, ignoring');
      return undefined;
    }

    if (parsed.length === 0) {
      return [];
    }

    const validUsers = validateDevUsers(parsed);

    if (validUsers.length === 0) {
      logApp.warn('No valid dev users found in DEV_USERS configuration');
      return undefined;
    }

    if (validUsers.length < parsed.length) {
      logApp.warn(
        `${parsed.length - validUsers.length} invalid dev users were filtered out`
      );
    }

    logApp.info(`Loaded ${validUsers.length} dev users from configuration`);
    return validUsers;
  } catch (error) {
    logApp.warn(`Failed to parse DEV_USERS JSON: ${error.message}`);
    return undefined;
  }
};
