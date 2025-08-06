import { NextRequest } from 'next/server';
import { redirectToOCTIRegistration } from './register-octi';
import { redirectToResource } from './resource';
import { redirectToOCTIUnregistration } from './unregister-octi';

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
  if (awaitedParams.identifier === 'register-octi') {
    return redirectToOCTIRegistration(request);
  }

  if (awaitedParams.identifier === 'unregister-octi') {
    return redirectToOCTIUnregistration(request);
  }

  return redirectToResource(awaitedParams, request);
}
