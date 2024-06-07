import config from 'config';
import {
  getNestedPropertyValue,
  parseKeyValueArrayToObject,
  parseKeyValueArrayToObjectReverse,
} from '../utils/utils';

export const extractRole = (decodedUser) => {
  const roleMapping = getRoleMapping();
  const roles = getUserRoles(decodedUser);
  return roles.map((role) => roleMapping[role]).filter((role) => !!role);
};

const getRoleMapping = () => {
  const roleMappingConfig: string[] = config.get(
    'user_management.role_mappings'
  );
  return parseKeyValueArrayToObject(roleMappingConfig);
};

export const getRoleMappingReverse = () => {
  const roleMappingConfig: string[] = config.get(
    'user_management.role_mappings'
  );
  return parseKeyValueArrayToObjectReverse(roleMappingConfig);
};

const getUserRoles = (decodedUser) => {
  const rolesPath = config.get('user_management.roles_path') as string;
  return getNestedPropertyValue(decodedUser, rolesPath);
};
