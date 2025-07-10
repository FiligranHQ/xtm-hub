import { NextRequest } from 'next/server';
import { redirectToOCTIEnrollment } from './enroll-octi';
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
  if (awaitedParams.identifier === 'enroll-octi') {
    return redirectToOCTIEnrollment(request);
  }

  return redirectToResource(awaitedParams, request);
}
