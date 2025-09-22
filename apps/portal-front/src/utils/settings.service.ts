import serverPortalApiFetch from '@/relay/serverPortalApiFetch';
import { FeatureFlag } from '@/utils/constant';
import SettingsQuery, {
  settingsQuery,
  settingsQuery$data,
} from '@generated/settingsQuery.graphql';

let cachedFeatureFlags: FeatureFlag[];

export interface SettingsResponse {
  data: settingsQuery$data;
}

export async function isFeatureEnabled(
  flagName: FeatureFlag
): Promise<boolean> {
  if (cachedFeatureFlags === undefined) {
    try {
      const response = (await serverPortalApiFetch<
        typeof SettingsQuery,
        settingsQuery
      >(SettingsQuery, {}, { cache: 'force-cache' })) as SettingsResponse;
      cachedFeatureFlags = [
        ...(response.data?.settings?.platform_feature_flags || []),
      ] as FeatureFlag[];
    } catch (error) {
      console.error('Failed to fetch feature flags:', error);
      cachedFeatureFlags = [];
    }
  }

  return !!cachedFeatureFlags?.some((flag) => [flagName, '*'].includes(flag));
}
