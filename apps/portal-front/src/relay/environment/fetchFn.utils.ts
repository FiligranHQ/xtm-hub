import { Variables } from 'relay-runtime';

export const SENSITIVE_FIELD_KEYS = new Set([
  'password',
  'token',
  'secret',
  'apiKey',
  'api_key',
  'accessToken',
  'refreshToken',
  'access_token',
  'refresh_token',
]);

export function scrubSensitiveVariables(variables: Variables): Variables {
  if (!variables || typeof variables !== 'object') return variables;
  return Object.fromEntries(
    Object.entries(variables).map(([key, value]) => {
      if (SENSITIVE_FIELD_KEYS.has(key)) return [key, '[HIDDEN]'];
      if (value !== null && typeof value === 'object' && !Array.isArray(value))
        return [key, scrubSensitiveVariables(value as Variables)];
      return [key, value];
    })
  );
}

export function buildCookieHeader(
  cookieList?: { name: string; value: string }[]
): string | undefined {
  if (!cookieList?.length) return undefined;
  return cookieList.map((ck) => `${ck.name}=${ck.value}`).join('; ');
}
