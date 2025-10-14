import config from 'config';
import { ForbiddenAccess } from './error/error.util';

export const isFeatureEnabled = (requiredFlag: string) => {
  const isEnabled = (config.get<string[]>('enabled_features') ?? []).some(
    (flag) => ['*', requiredFlag].includes(flag)
  );

  if (!isEnabled) {
    throw ForbiddenAccess(`Feature '${requiredFlag}' is not enabled.`);
  }

  return true;
};
