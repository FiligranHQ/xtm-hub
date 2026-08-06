import * as React from 'react';

import '@styles/globals.css';

import { getUserLocale } from '@/i18n/locale';
import { serverFetchGraphQL } from '@/relay/server-portal-api-fetch';

import { AdminBanner } from '@/components/admin/AdminBanner';
import { TestEnvBanner } from '@/components/admin/TestEnvBanner';
import HeaderComponent from '@/components/Header';
import { AppShell } from '@/components/layout/AppShell';
import PrivateMenu from '@/components/menu/PrivateMenu';
import { ReactQueryProvider } from '@/components/ReactQueryProvider';
import { TryFiligranProductsBanner } from '@/components/service/trial-instances/banner/TryFiligranProductsBanner';
import { RelayProvider } from '@/relay/relay-provider';
import { loadMeUser } from '@/utils/load-me-user';
import { getMetadataBase } from '@/utils/metadata';
import { APP_PATH } from '@/utils/path/constant';
import { buildSignupRedirect } from '@/utils/redirect';

import SeoServiceInstanceMetadataQuery, {
  SeoServiceInstanceLanguage,
  seoServiceInstanceMetadataQuery,
} from '@generated/seoServiceInstanceMetadataQuery.graphql';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import PageLoader from './page-loader';

export const dynamic = 'force-dynamic';

const regExpUUID =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

const extractServiceInstanceId = (pathname: string): string | null => {
  const decodedPathname = decodeURIComponent(pathname.split('?')[0] ?? '');
  if (!decodedPathname.includes('/service/')) {
    return null;
  }
  const match = decodedPathname.match(regExpUUID);
  return match?.[0] ?? null;
};

export const generateMetadata = async (): Promise<Metadata> => {
  const metadataBase = await getMetadataBase();
  const h = await headers();
  const pathname = h.get('x-pathname') ?? `/${APP_PATH}`;
  const serviceInstanceId = extractServiceInstanceId(pathname);

  if (!serviceInstanceId) {
    return {
      title: 'XTM Hub',
      description: 'XTM Hub application by Filigran',
      metadataBase,
    };
  }

  const locale = await getUserLocale();
  const language: SeoServiceInstanceLanguage =
    locale === 'fr' || locale === 'ja' ? locale : 'en';
  const seoMetadataResponse =
    await serverFetchGraphQL<seoServiceInstanceMetadataQuery>(
      SeoServiceInstanceMetadataQuery,
      {
        service_instance_id: serviceInstanceId,
        language,
      }
    );
  const seoMetadata = seoMetadataResponse.data.seoServiceInstanceMetadata[0];

  return {
    title: seoMetadata?.meta_title || 'XTM Hub',
    description:
      seoMetadata?.meta_description || 'XTM Hub application by Filigran',
    metadataBase,
  };
};

// Component interface
interface RootLayoutProps {
  children: React.ReactNode;
}

// Component
const RootLayout = async ({ children }: RootLayoutProps) => {
  const h = await headers();
  const pathname = h.get('x-pathname') ?? `/${APP_PATH}`;

  const me = await loadMeUser();
  if (!me) {
    redirect(buildSignupRedirect(pathname));
  }

  const banners = (
    <>
      <TestEnvBanner />
      <AdminBanner />
      <TryFiligranProductsBanner />
    </>
  );

  return (
    <RelayProvider>
      <ReactQueryProvider>
        <div className="flex min-h-screen">
          <PageLoader>
            <AppShell
              banners={banners}
              menu={<PrivateMenu />}
              headerContent={<HeaderComponent />}
              contentClassName="p-3 sm:p-6">
              {children}
            </AppShell>
          </PageLoader>
        </div>
      </ReactQueryProvider>
    </RelayProvider>
  );
};

// Component export
export default RootLayout;
