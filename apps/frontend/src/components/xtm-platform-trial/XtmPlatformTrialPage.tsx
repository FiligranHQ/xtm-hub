'use client';

import { PortalContext } from '@/components/me/AppPortalContext';
import { ReachSalesButton } from '@/components/service/trial-instances/reach-sales/ReachSalesButton';
import { SlackSupportButton } from '@/components/service/trial-instances/SlackSupport';
import { BundleGuideCard } from '@/components/xtm-platform-trial/BundleGuideCard';
import { BundleInfoCard } from '@/components/xtm-platform-trial/BundleInfoCard';
import { BundleProductCard } from '@/components/xtm-platform-trial/BundleProductCard';
import { TrialLimitationsCard } from '@/components/xtm-platform-trial/TrialLimitationsCard';
import { useXtmoneIntegrationStatus } from '@/components/xtm-platform-trial/useXtmoneIntegrationStatus';
import { portalGraphqlClient } from '@/lib/graphql-client';
import {
  OrganizationCapability,
  PlatformIdentifier,
  PortalCapability,
  useActiveXtmPlatformBundleQuery,
} from '@graphql/generated';
import { xtmPlatformBundleKeys } from '@graphql/xtm-platform-bundle/xtm-platform-bundle.keys';
import { useTranslations } from 'next-intl';
import { useContext } from 'react';

export const XtmPlatformTrialPage = () => {
  const tBundle = useTranslations('XtmPlatformTrial');
  const { me, hasCapability, hasOrganizationCapability } =
    useContext(PortalContext);

  const canManage =
    hasCapability?.(PortalCapability.Bypass) ||
    hasOrganizationCapability?.(
      OrganizationCapability.AdministrateOrganization
    ) ||
    hasOrganizationCapability?.(
      OrganizationCapability.ManagePlatformRegistration
    ) ||
    false;

  const { data, isLoading } = useActiveXtmPlatformBundleQuery(
    portalGraphqlClient,
    {},
    { queryKey: xtmPlatformBundleKeys.activeXtmPlatformBundle() }
  );

  const bundle = data?.activeXtmPlatformBundle;

  const xtmoneUrl =
    bundle?.products.find(
      (product) => product.platform_identifier === PlatformIdentifier.Xtmone
    )?.url ?? null;

  const xtmoneQuery = useXtmoneIntegrationStatus(xtmoneUrl);
  const xtmoneStatus = {
    data: xtmoneQuery.data,
    isLoading: xtmoneQuery.isLoading,
    isError: xtmoneQuery.isError,
    hasUrl: !!xtmoneUrl,
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-m">
        <div className="h-8 w-64 rounded bg-elevation-surface-highlight-layer-1" />
        <div className="h-4 w-full rounded bg-elevation-surface-highlight-layer-1" />
        <div className="h-4 w-5/6 rounded bg-elevation-surface-highlight-layer-1" />
      </div>
    );
  }

  if (!bundle) {
    return null;
  }

  const productOrder: Record<string, number> = {
    [PlatformIdentifier.Opencti]: 0,
    [PlatformIdentifier.Openaev]: 1,
    [PlatformIdentifier.Xtmone]: 2,
  };
  const orderedProducts = [...bundle.products].sort(
    (a, b) =>
      (productOrder[a.platform_identifier] ?? Number.MAX_SAFE_INTEGER) -
      (productOrder[b.platform_identifier] ?? Number.MAX_SAFE_INTEGER)
  );

  return (
    <div className="flex flex-col gap-m">
      <div className="flex flex-col gap-m sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-xs">
          <h1 className="heading-2xl">{tBundle('Title')}</h1>
          <p className="text-content-body-base text-text-default-secondary">
            {tBundle('Subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-s shrink-0">
          <ReachSalesButton
            variant="gradient"
            platformIdentifier={PlatformIdentifier.Xtmone}
          />
          <SlackSupportButton />
        </div>
      </div>
      <div className="grid gap-m sm:grid-cols-2 lg:grid-cols-3">
        <BundleInfoCard
          bundle={bundle}
          canManage={canManage}
          organizationId={me?.selected_organization_id}
        />
        <div className="flex items-center justify-center lg:col-span-2">
          <BundleGuideCard />
        </div>
      </div>
      <div className="grid gap-m sm:grid-cols-2 lg:grid-cols-3">
        {orderedProducts.map((product) => (
          <BundleProductCard
            key={product.service_instance_id}
            product={product}
            xtmoneStatus={xtmoneStatus}
            canManage={canManage}
          />
        ))}
      </div>
      <TrialLimitationsCard />
    </div>
  );
};
