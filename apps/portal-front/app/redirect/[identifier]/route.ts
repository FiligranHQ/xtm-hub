import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { NextRequest } from 'next/server';
import { redirectToRegistration } from './registration';
import { redirectToResource } from './resource';

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
  if (awaitedParams.identifier === 'register-opencti') {
    return redirectToRegistration(
      request,
      'register',
      PlatformIdentifierEnum.OPENCTI
    );
  }

  if (awaitedParams.identifier === 'unregister-opencti') {
    return redirectToRegistration(
      request,
      'unregister',
      PlatformIdentifierEnum.OPENCTI
    );
  }

  return redirectToResource(awaitedParams, request);
}
