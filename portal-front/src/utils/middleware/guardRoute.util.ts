import { NextRequest, NextResponse } from 'next/server';
import { context_fragment$data } from '../../../__generated__/context_fragment.graphql';

export const guardRoute = (request: NextRequest) => {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();
  url.pathname = '/';
  const cookie = request.cookies.get('cloud-portal-user');
  const user: context_fragment$data = JSON.parse(<string>cookie?.value);
  const userCapabilities = user.capabilities.map(({ name }) => name);

  if (userCapabilities.includes('BYPASS')) {
    return undefined;
  }
  if (authorizeAdminPath(pathname, userCapabilities)) {
    return NextResponse.redirect(url);
  }
  if (authorizeUserPath(pathname, userCapabilities)) {
    return NextResponse.redirect(url);
  }
  return undefined;
};

const authorizeUserPath = (pathname: string, userCapabilities: string[]) => {
  const userRoutes = ['/about', '/service'];
  return (
    isAuthorizePath(pathname, userRoutes) && !userCapabilities.includes('USER')
  );
};

const authorizeAdminPath = (pathname: string, userCapabilities: string[]) => {
  const userRoutes = ['/admin'];
  return (
    isAuthorizePath(pathname, userRoutes) && !userCapabilities.includes('ADMIN')
  );
};
const isAuthorizePath = (pathname: string, paths: string[]) => {
  return paths.some((path) => pathname.startsWith(path));
};
