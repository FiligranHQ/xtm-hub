import { loadMeUser } from '@/utils/load-me-user';
import { NextRequest, NextResponse } from 'next/server';
import { loadBaseUrlFront } from './utils/load';
import { getLoginRedirectionURL } from './utils/url';

export const redirectToTransferPersoSpace = async (request: NextRequest) => {
  const baseUrlFront = await loadBaseUrlFront();
  const redirectionUrl = getLoginRedirectionURL(baseUrlFront, request);
  try {
    const user = await loadMeUser();
    if (!user) {
      return NextResponse.redirect(redirectionUrl);
    }

    const params = request.url.split('?');

    const registrationUrl = new URL(
      `/app/profile/transfer-personal-space?${params[1]}`,
      baseUrlFront
    );
    return NextResponse.redirect(registrationUrl);
  } catch (error) {
    if ((error as Error).message === 'UNAUTHENTICATED') {
      return NextResponse.redirect(redirectionUrl);
    }

    const loginURL = new URL('/login', baseUrlFront);
    return NextResponse.redirect(loginURL);
  }
};
