import { decodeSafeRedirect } from '@/utils/redirect';
import { NextRequest } from 'next/server';
import { describe, expect, it, vi } from 'vitest';
import { getLoginRedirectionURL } from './url';

vi.mock('@/components/error-frontend-log.graphql', () => ({
  logFrontendError: vi.fn(),
}));

vi.mock('@/relay/environment/registry', () => ({
  getClientEnvironment: vi.fn(() => null),
}));

const BASE_URL = 'http://localhost:3002';

describe('getLoginRedirectionURL', () => {
  it('returns an absolute URL rooted at baseUrlFront', () => {
    const request = new NextRequest(
      `${BASE_URL}/redirect/opencti_custom_dashboards`
    );
    const result = getLoginRedirectionURL(BASE_URL, request);

    expect(result.startsWith(`${BASE_URL}/login`)).toBe(true);
  });

  it('redirect param decodes to the relative path — not an absolute URL', () => {
    const path = '/redirect/opencti_custom_dashboards';
    const request = new NextRequest(`${BASE_URL}${path}`);
    const result = getLoginRedirectionURL(BASE_URL, request);

    const b64 = new URL(result).searchParams.get('redirect');
    const decoded = decodeSafeRedirect(b64);

    // Must be a relative path accepted by decodeSafeRedirect
    expect(decoded).toBe(path);
  });

  it('redirect param includes query string from the original request', () => {
    const request = new NextRequest(
      `${BASE_URL}/redirect/opencti_custom_dashboards?platform_id=abc&service_instance_id=123`
    );
    const result = getLoginRedirectionURL(BASE_URL, request);

    const b64 = new URL(result).searchParams.get('redirect');
    const decoded = decodeSafeRedirect(b64);

    expect(decoded).toBe(
      '/redirect/opencti_custom_dashboards?platform_id=abc&service_instance_id=123'
    );
  });

  it('does not include origin in the encoded redirect — old code included https://host/path', () => {
    const request = new NextRequest(
      `${BASE_URL}/redirect/opencti_custom_dashboards`
    );
    const result = getLoginRedirectionURL(BASE_URL, request);

    const b64 = new URL(result).searchParams.get('redirect');
    const decoded = atob(b64!);

    expect(decoded.startsWith('http')).toBe(false);
    expect(decoded.startsWith('/')).toBe(true);
  });

  it('encodes + in base64 so Express qs parser cannot corrupt it', () => {
    const request = new NextRequest(
      `${BASE_URL}/redirect/opencti_custom_dashboards`
    );
    const result = getLoginRedirectionURL(BASE_URL, request);

    // The raw redirect param in the URL must not contain unencoded +
    const rawSearch = new URL(result).search;
    const redirectParamRaw = rawSearch.split('redirect=')[1];
    expect(redirectParamRaw).not.toContain('+');
  });

  it('round-trips: decodeSafeRedirect recovers the original relative path', () => {
    const path = '/redirect/opencti_custom_dashboards';
    const request = new NextRequest(`${BASE_URL}${path}`);

    const loginUrl = getLoginRedirectionURL(BASE_URL, request);
    const b64 = new URL(loginUrl).searchParams.get('redirect');

    expect(decodeSafeRedirect(b64)).toBe(path);
  });
});
