import {
  SaasPlatformData,
  SaasPlatformMetadata,
} from '../../__generated__/resolvers-types';
import { ServiceInstanceId } from '../../model/kanel/public/ServiceInstance';
import { SaasManagerClient } from '../../thirdparty/saasmanager/client';
import { logApp } from '../../utils/app-logger.util';
import { RegistrationDomain } from '../registration/registration.domain';

// Hostname, plan, dates and region rarely change: a short cache keeps page refreshes from reaching the SaaS Manager.
const SAAS_PLATFORM_DATA_CACHE_TTL_MS = 60_000;

interface CachedSaasPlatformData {
  data: Promise<SaasPlatformData | null>;
  expiresAt: number;
}

const saasPlatformDataCache = new Map<string, CachedSaasPlatformData>();

const readMetadataString = (
  body: Record<string, unknown>,
  key: keyof SaasPlatformMetadata
): string | null => {
  const value = body[key];
  return typeof value === 'string' && value !== '' ? value : null;
};

const readMetadataDate = (
  body: Record<string, unknown>,
  key: 'start_date' | 'end_date'
): string | null => {
  const value = readMetadataString(body, key);
  if (value === null) {
    return null;
  }
  const time = Date.parse(value);
  if (Number.isNaN(time)) {
    logApp.warn('The SaaS Manager returned an unparseable platform date', {
      field: key,
    });
    return null;
  }
  return new Date(time).toISOString();
};

const parseSaasPlatformData = (body: unknown): SaasPlatformData => {
  const fields: Record<string, unknown> =
    typeof body === 'object' && body !== null ? { ...body } : {};

  return {
    metadata: {
      hostname: readMetadataString(fields, 'hostname'),
      plan: readMetadataString(fields, 'plan'),
      start_date: readMetadataDate(fields, 'start_date'),
      end_date: readMetadataDate(fields, 'end_date'),
      region: readMetadataString(fields, 'region'),
    },
  };
};

const fetchSaasPlatformData = async (
  serviceInstanceId: ServiceInstanceId,
  platformId: string
): Promise<SaasPlatformData | null> => {
  try {
    const response = await SaasManagerClient.callInstanceApi({
      platform_id: platformId,
    });

    if (response.status !== 200) {
      logApp.error('Unable to load the platform data from the SaaS Manager', {
        serviceInstanceId,
        platformId,
        status: response.status,
      });
      return null;
    }
    return parseSaasPlatformData(await response.json());
  } catch (error) {
    logApp.error('Unable to load the platform data from the SaaS Manager', {
      serviceInstanceId,
      platformId,
      error,
    });
    return null;
  }
};

/**
 * Concurrent callers share the same in-flight request. Only an answer is kept: a failure is dropped at once, so the
 * next view asks again instead of showing the platform as unavailable for the whole TTL.
 */
const loadCachedSaasPlatformData = (
  serviceInstanceId: ServiceInstanceId,
  platformId: string
): Promise<SaasPlatformData | null> => {
  const now = Date.now();
  const cached = saasPlatformDataCache.get(platformId);
  if (cached && now < cached.expiresAt) {
    return cached.data;
  }

  for (const [cachedPlatformId, entry] of saasPlatformDataCache) {
    if (entry.expiresAt <= now) {
      saasPlatformDataCache.delete(cachedPlatformId);
    }
  }

  const entry: CachedSaasPlatformData = {
    data: fetchSaasPlatformData(serviceInstanceId, platformId).then((data) => {
      if (data === null && saasPlatformDataCache.get(platformId) === entry) {
        saasPlatformDataCache.delete(platformId);
      }
      return data;
    }),
    expiresAt: now + SAAS_PLATFORM_DATA_CACHE_TTL_MS,
  };
  saasPlatformDataCache.set(platformId, entry);
  return entry.data;
};

export const ProductInformationApp = {
  loadRegisteredSaasPlatformData: async (
    serviceInstanceId: ServiceInstanceId
  ): Promise<SaasPlatformData | null> => {
    // Resolve the platform through the organization-scoped query first, so that
    // the SaaS Manager is only ever called for a platform the user can access,
    // and with the platform_id stored in the Hub, never a client-supplied one.
    const [platform] =
      await RegistrationDomain.loadRegisteredPlatform(serviceInstanceId);
    if (!platform) {
      return null;
    }

    return loadCachedSaasPlatformData(serviceInstanceId, platform.platform_id);
  },
};
