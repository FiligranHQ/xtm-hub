import { PlatformIdentifierEnum } from '@generated/models/PlatformIdentifier.enum';
import { NextRequest } from 'next/server';
import { redirectToCreateFreeTrial } from './create-free-trial';
import { redirectToFreeTrial } from './free-trial';
import { redirectToRegistration } from './registration';
import { redirectToResource } from './resource';
import { redirectToTransferPersoSpace } from './transfer-perso-space';

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
  switch (awaitedParams.identifier) {
    case 'register-opencti':
      return redirectToRegistration(
        request,
        'register',
        PlatformIdentifierEnum.OPENCTI
      );
    case 'unregister-opencti':
      return redirectToRegistration(
        request,
        'unregister',
        PlatformIdentifierEnum.OPENCTI
      );
    case 'register-openaev':
      return redirectToRegistration(
        request,
        'register',
        PlatformIdentifierEnum.OPENAEV
      );
    case 'unregister-openaev':
      return redirectToRegistration(
        request,
        'unregister',
        PlatformIdentifierEnum.OPENAEV
      );
    case 'transfer-personal-space':
      return redirectToTransferPersoSpace(request);
    case 'free-trial':
      return redirectToFreeTrial(request);
    case 'create-free-trial':
      return redirectToCreateFreeTrial(request, PlatformIdentifierEnum.OPENCTI);
    case 'create-openaev-free-trial':
      return redirectToCreateFreeTrial(request, PlatformIdentifierEnum.OPENAEV);
  }
  return redirectToResource(awaitedParams, request);
}
