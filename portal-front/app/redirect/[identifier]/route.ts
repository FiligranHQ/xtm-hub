import { settingsQuery$data } from '@generated/settingsQuery.graphql';
import { NextRequest } from 'next/server';
import { redirectToOCTIEnrollment } from './enroll-octi';
import { redirectToResource } from './resource';

interface RedirectIdentifierGetRouteProps {
  params: Promise<{
    identifier: string;
  }>;
}

export interface SettingsResponse {
  data: settingsQuery$data;
}

export interface MeResponse {
  data: {
    me: {
      id: string;
      selected_organization_id: string;
      organizations: {
        id: string;
        name: string;
        personal_space: boolean;
      }[];
    };
  };
}

export const getLoginRedirectionURL = (
  baseUrlFront: string,
  request: NextRequest
) => {
  const baseURL = new URL(`${baseUrlFront}/login`);
  const redirectURL = new URL(request.url);
  redirectURL.hostname = baseURL.hostname;
  redirectURL.protocol = baseURL.protocol;
  redirectURL.port = baseURL.port;
  baseURL.searchParams.set('redirect', btoa(redirectURL.toString()));
  return baseURL.toString();
};

export async function GET(
  request: NextRequest,
  { params }: RedirectIdentifierGetRouteProps
) {
  const awaitedParams = await params;
  if (awaitedParams.identifier === 'enroll-octi') {
    return redirectToOCTIEnrollment(request);
  }

  return redirectToResource(awaitedParams, request);
}
