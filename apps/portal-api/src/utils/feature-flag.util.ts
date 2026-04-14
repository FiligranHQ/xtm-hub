import config from 'config';
import { FeatureFlag } from '../__generated__/resolvers-types'
import { ForbiddenAccess } from './error/error.util';

export const isFeatureEnabled = (requiredFlag: FeatureFlag) => {
  const isEnabled = (config.get<string[]>('enabled_features') ?? []).some(
    (flag) => ['*', requiredFlag].includes(flag)
  );

  if (!isEnabled) {
    throw ForbiddenAccess(`Feature '${requiredFlag}' is not enabled.`);
  }

  return true;
};
