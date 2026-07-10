import serverPortalApiFetch from '@/relay/server-portal-api-fetch';
import SettingsQuery, {
  settingsQuery,
  settingsQuery$data,
} from '@generated/settingsQuery.graphql';
import { FeatureFlag } from '@graphql/generated';

let cachedFeatureFlags: string[];
let cachedProviders: ReadonlyArray<{ provider: string }>;

export interface SettingsResponse {
  data: settingsQuery$data;
}

async function fetchSettings(): Promise<void> {
  if (cachedFeatureFlags !== undefined) return;
  try {
    const response = (await serverPortalApiFetch<
      typeof SettingsQuery,
      settingsQuery
    >(SettingsQuery, {}, { cache: 'force-cache' })) as SettingsResponse;
    cachedFeatureFlags = [
      ...(response.data?.settings?.platform_feature_flags || []),
    ];
    cachedProviders = response.data?.settings?.platform_providers ?? [];
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    cachedFeatureFlags = [];
    cachedProviders = [];
  }
}

export async function isFeatureEnabled(
  flagName: FeatureFlag
): Promise<boolean> {
  await fetchSettings();
  return cachedFeatureFlags?.some((flag) =>
    [flagName as string].includes(flag)
  );
}

export async function hasLocalProvider(): Promise<boolean> {
  await fetchSettings();
  return cachedProviders.some((p) => p.provider === 'local');
}
