import serverPortalApiFetch from '@/relay/serverPortalApiFetch';
import MeLoaderQuery, { meLoaderQuery } from '@generated/meLoaderQuery.graphql';
import SettingsQuery, { settingsQuery } from '@generated/settingsQuery.graphql';
import { NextRequest, NextResponse } from 'next/server';
import { getLoginRedirectionURL, MeResponse, SettingsResponse } from './route';

export const redirectToOCTIEnrollment = async (request: NextRequest) => {
  const settingsResponse = (await serverPortalApiFetch<
    typeof SettingsQuery,
    settingsQuery
  >(SettingsQuery)) as SettingsResponse;
  const baseUrlFront = settingsResponse.data.settings.base_url_front;
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

    const enrollmentUrl = new URL(`/enroll/octi`, baseUrlFront);
    return NextResponse.redirect(enrollmentUrl);
  } catch (error) {
    if ((error as Error).message === 'UNAUTHENTICATED') {
      return NextResponse.redirect(redirectionUrl);
    }

    const loginURL = new URL('/login', baseUrlFront);
    return NextResponse.redirect(loginURL);
  }
};
