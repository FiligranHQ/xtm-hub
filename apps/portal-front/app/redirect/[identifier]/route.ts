import { NextRequest } from 'next/server';
import { redirectToOpenCTIRegistration } from './register-opencti';
import { redirectToResource } from './resource';
import { redirectToOpenCTIUnregistration } from './unregister-opencti';

interface RedirectIdentifierGetRouteProps {
  params: Promise<{
    identifier: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RedirectIdentifierGetRouteProps
) {
  const awaitedParams = await params;
  if (
    awaitedParams.identifier === 'enroll-octi' ||
    awaitedParams.identifier === 'register-opencti'
  ) {
    return redirectToOpenCTIRegistration(request);
  }

  if (
    awaitedParams.identifier === 'unenroll-octi' ||
    awaitedParams.identifier === 'unregister-opencti'
  ) {
    return redirectToOpenCTIUnregistration(request);
  }

  return redirectToResource(awaitedParams, request);
}
