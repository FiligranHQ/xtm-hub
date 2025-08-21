import {
  AlreadyExistsError,
  StillReferencedError,
  UnknownError,
} from '@xtm-hub/error';
import { logApp } from '@xtm-hub/logger';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../../knexfile';
import { Organization, Resolvers } from '../../__generated__/resolvers-types';
import { dispatch } from '../../pub';
import {
  loadOrganizationBy,
  loadOrganizations,
  loadOrganizationsByUser,
} from './organizations.domain';

const resolvers: Resolvers = {
  Query: {
    organization: async (_, { id }, context) =>
      loadOrganizationBy(context, 'Organization.id', id),
    organizations: async (_, opts, context) => {
      return loadOrganizations(context, opts);
    },
    userOrganizations: async (_, __, context) => {
      return loadOrganizationsByUser(context, context.user.id);
    },
  },
  Mutation: {
    addOrganization: async (_, { input }, context) => {
      // Check if an organization exists with the same name (case insensitive)
      const existingOrganization: Organization | undefined =
        await db<Organization>(context, 'Organization')
          .where('name', 'ILIKE', input.name)
          .first('id');
      if (existingOrganization?.id) {
        throw AlreadyExistsError('ORGANIZATION_SAME_NAME_EXISTS');
      }

      try {
        const [addOrganization] = await db<Organization>(
          context,
          'Organization'
        )
          .insert({ id: uuidv4(), ...input })
          .returning('*');
        return addOrganization;
      } catch (error) {
        if (
          error.message.includes(
            'duplicate key value violates unique constraint "organization_name_unique"'
          )
        ) {
          throw AlreadyExistsError('ORGANIZATION_SAME_NAME_EXISTS');
        }
        logApp.error('ADD_ORGANIZATION_ERROR', error);
        throw UnknownError('ADD_ORGANIZATION_ERROR', { detail: error });
      }
    },
    editOrganization: async (_, { id, input }, context) => {
      try {
        const [updatedOrganization] = await db<Organization>(
          context,
          'Organization'
        )
          .where({ id })
          .update({ ...input })
          .returning('*');
        return updatedOrganization;
      } catch (error) {
        logApp.error('EDIT_ORGANIZATION_ERROR', error);
        throw UnknownError('EDIT_ORGANIZATION_ERROR', { detail: error });
      }
    },
    deleteOrganization: async (_, { id }, context) => {
      try {
        const [deletedOrganization] = await db<Organization>(
          context,
          'Organization'
        )
          .where({ id })
          .delete('*');
        await dispatch('Organization', 'delete', deletedOrganization);
        return deletedOrganization;
      } catch (error) {
        const regexErrorName = /is still referenced from table "([^"]+)"/;
        const match =
          error.detail.match(regexErrorName) ||
          error.message.match(regexErrorName);
        if (match) {
          const tableName = match[1];
          throw StillReferencedError(
            `${tableName.toUpperCase()}_STILL_IN_ORGANIZATION`
          );
        }
        throw UnknownError('DELETE_ORGANIZATION', { detail: error });
      }
    },
  },
};

export default resolvers;
