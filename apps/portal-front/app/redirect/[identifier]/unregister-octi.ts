import serverPortalApiFetch from '@/relay/serverPortalApiFetch';
import { FeatureFlag } from '@/utils/constant';
import MeLoaderQuery, { meLoaderQuery } from '@generated/meLoaderQuery.graphql';
import SettingsQuery, { settingsQuery } from '@generated/settingsQuery.graphql';
import { NextRequest, NextResponse } from 'next/server';
import { MeResponse, SettingsResponse } from './response';
import { getLoginRedirectionURL } from './url';

export const redirectToOCTIUnenrollment = async (request: NextRequest) => {
  const settingsResponse = (await serverPortalApiFetch<
    typeof SettingsQuery,
    settingsQuery
  >(SettingsQuery)) as SettingsResponse;

  const isFeatureEnabled =
    settingsResponse.data.settings.platform_feature_flags.includes(
      FeatureFlag.OCTI_ENROLLMENT
    ) || settingsResponse.data.settings.platform_feature_flags.includes('*');

  const baseUrlFront = settingsResponse.data.settings.base_url_front;
  if (!isFeatureEnabled) {
    const notFoundUrl = new URL('/not-found', baseUrlFront);
    return NextResponse.redirect(notFoundUrl);
  }

  const redirectionUrl = getLoginRedirectionURL(baseUrlFront, request);
  try {
    const meResponse = (await serverPortalApiFetch<
      typeof MeLoaderQuery,
      meLoaderQuery
    >(MeLoaderQuery)) as MeResponse;

    const user = meResponse.data.me;
    if (!user) {
      return NextResponse.redirect(redirectionUrl);
    }

    const params = request.url.split('?');
    if (params.length !== 2) {
      return NextResponse.redirect('/');
    }

    const enrollmentUrl = new URL(`/unenroll/octi?${params[1]}`, baseUrlFront);
    return NextResponse.redirect(enrollmentUrl);
  } catch (error) {
    if ((error as Error).message === 'UNAUTHENTICATED') {
      return NextResponse.redirect(redirectionUrl);
    }

    const loginURL = new URL('/login', baseUrlFront);
    return NextResponse.redirect(loginURL);
  }
};
