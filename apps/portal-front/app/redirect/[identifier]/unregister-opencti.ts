import { NextRequest, NextResponse } from 'next/server';
import { loadBaseUrlFront, loadMeUser } from './utils/load';
import { getLoginRedirectionURL } from './utils/url';

export const redirectToOpenCTIUnregistration = async (request: NextRequest) => {
  const baseUrlFront = await loadBaseUrlFront();
  const redirectionUrl = getLoginRedirectionURL(baseUrlFront, request);
  try {
    const user = await loadMeUser();
    if (!user) {
      return NextResponse.redirect(redirectionUrl);
    }

    const params = request.url.split('?');
    if (params.length !== 2) {
      return NextResponse.redirect('/');
    }

    const registrationUrl = new URL(
      `/unregister/opencti?${params[1]}`,
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
