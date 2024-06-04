import config from 'config';
import {
  getNestedPropertyValue,
  parseKeyValueArrayToObject,
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

const getUserRoles = (decodedUser) => {
  const rolesPath = config.get('user_management.roles_path') as string;
  console.log(decodedUser['resource_access']['scred-portal-dev']);
  return getNestedPropertyValue(decodedUser, rolesPath);
};
