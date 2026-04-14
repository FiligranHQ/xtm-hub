import { v4 as uuidv4 } from 'uuid';
import { db } from '../../knexfile';
import RolePortal, {
  RolePortalId,
  RolePortalMutator,
} from '../../src/model/kanel/public/RolePortal';
import User, { UserMutator } from '../../src/model/kanel/public/User';
import UserOrganization, {
  UserOrganizationMutator,
} from '../../src/model/kanel/public/UserOrganization';
import UserOrganizationPending, {
  UserOrganizationPendingMutator,
} from '../../src/model/kanel/public/UserOrganizationPending';
import UserRolePortal, {
  UserRolePortalMutator,
} from '../../src/model/kanel/public/UserRolePortal';
import UserService, {
  UserServiceId,
  UserServiceMutator,
} from '../../src/model/kanel/public/UserService';
import UserServiceCapability, {
  UserServiceCapabilityId,
  UserServiceCapabilityMutator,
} from '../../src/model/kanel/public/UserServiceCapability';

export const TestUserHelper = {
  user_Service: {
    load: async (
      field: UserServiceMutator
    ): Promise<UserService | undefined> => {
      return db<UserService>('User_Service').where(field).select('*').first();
    },
    loadAll: async (field: UserServiceMutator): Promise<UserService[]> => {
      return db<UserService[]>('User_Service').where(field).select('*');
    },
    create: async (
      data?: Partial<UserService>
    ): Promise<UserService | undefined> => {
      const [userService] = await db<UserService>('User_Service')
        .insert({
          id: uuidv4() as UserServiceId,
          ...data,
        })
        .returning('*');
      return userService;
    },
    delete: async (field: UserServiceMutator) => {
      await db<UserService>('User_Service').where(field).del();
    },
  },
  user_ServiceCapability: {
    create: async (
      data?: UserServiceCapabilityMutator
    ): Promise<UserServiceCapability | undefined> => {
      const [userService] = await db<UserServiceCapability>(
        'UserService_Capability'
      )
        .insert({
          id: uuidv4() as UserServiceCapabilityId,
          ...data,
        })
        .returning('*');
      return userService;
    },
    load: async (
      field: UserServiceCapabilityMutator
    ): Promise<UserServiceCapability[]> => {
      return db<UserServiceCapability[]>('UserService_Capability')
        .where(field)
        .first();
    },
    delete: async (field: UserServiceCapabilityMutator) => {
      await db<UserServiceCapability>('UserService_Capability')
        .where(field)
        .del();
    },
  },
  user_RolePortal: {
    delete: async (field: UserRolePortalMutator) => {
      await db<UserRolePortal>('User_RolePortal').where(field).del();
    },
    load: async (field: UserRolePortalMutator): Promise<UserRolePortal> => {
      return db<UserRolePortal>('User_RolePortal').where(field).first();
    },
    loadAll: async (
      field: UserRolePortalMutator
    ): Promise<UserRolePortal[]> => {
      return db<UserRolePortal>('User_RolePortal').where(field);
    },
  },
  user_Organization: {
    delete: async (field: UserOrganizationMutator) => {
      await db<UserOrganization>('User_Organization').where(field).del();
    },
    load: async (field: UserOrganizationMutator): Promise<UserOrganization> => {
      return db<UserOrganization>('User_Organization').where(field).first();
    },
  },
  user_OrganizationPending: {
    create: async (data: UserOrganizationPendingMutator) => {
      db<UserOrganizationPending>('User_Organization_Pending').insert(data);
    },
    delete: async (field: UserOrganizationPendingMutator) => {
      await db<UserOrganizationPending>('User_Organization_Pending')
        .where(field)
        .del();
    },
  },
  user: {
    delete: async (field: UserMutator) => {
      await db<User>('User').where(field).del();
    },
    load: async (field: UserMutator): Promise<User> => {
      return db<User>('User').where(field).first();
    },
    create: async (data: UserMutator) => {
      const [user] = await db<User>('User').insert(data).returning('*');
      return user;
    },
  },
  rolePortal: {
    create: async (data: RolePortalMutator) => {
      const rolePortalId = uuidv4() as unknown as RolePortalId;
      const [userRolePortal] = await db<RolePortal>('RolePortal')
        .insert({
          id: rolePortalId,
          name: `test-admin-${rolePortalId}`,
          ...data,
        })
        .returning('*');
      return userRolePortal;
    },
    load: async (field: RolePortalMutator): Promise<RolePortal> => {
      return db<RolePortal>('RolePortal').where(field).first();
    },
    delete: async (field: RolePortalMutator) => {
      await db<RolePortal>('RolePortal').where(field).del();
    },
  },
};
