import serverPortalApiFetch from '@/relay/serverPortalApiFetch';
import { FeatureFlagEnum } from '@generated/models/FeatureFlag.enum';
import SettingsQuery, {
  settingsQuery,
  settingsQuery$data,
} from '@generated/settingsQuery.graphql';

let cachedFeatureFlags: string[];

export interface SettingsResponse {
  data: settingsQuery$data;
}

export async function isFeatureEnabled(
  flagName: FeatureFlagEnum
): Promise<boolean> {
  if (cachedFeatureFlags === undefined) {
    try {
      const response = (await serverPortalApiFetch<
        typeof SettingsQuery,
        settingsQuery
      >(SettingsQuery, {}, { cache: 'force-cache' })) as SettingsResponse;
      cachedFeatureFlags = [
        ...(response.data?.settings?.platform_feature_flags || []),
      ];
    } catch (error) {
      console.error('Failed to fetch feature flags:', error);
      cachedFeatureFlags = [];
    }
  }

  return !!cachedFeatureFlags?.some((flag) => [flagName as string].includes(flag));
}
