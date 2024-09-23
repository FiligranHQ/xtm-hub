import config from 'config';
import {
  parseKeyValueArrayToObject,
  parseKeyValueArrayToObjectReverse,
} from '../utils/utils';

export const extractRole = (roles): string[] => {
  const roleMapping = getRoleMapping();
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
