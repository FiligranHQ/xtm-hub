'use client';

import {
  getRegisteredPlatformServiceIdentifier,
  PlatformMetadataMapping,
} from '@/components/registration/PlatformIdentifierMapping';
import { PlatformUpdateSheet } from '@/components/service/components/PlatformUpdateSheet';
import { XtmoneStatusState } from '@/components/xtm-platform-trial/useXtmoneIntegrationStatus';
import { XtmPlatformBundleProduct } from '@/components/xtm-platform-trial/xtm-platform-bundle.types';
import { XtmoneConnectionStatus } from '@/components/xtm-platform-trial/XtmoneConnectionStatus';
import { useDateFormatter } from '@/utils/date';
import { EditIcon } from '@filigran/icon';
import { Badge, Button, Card, CardContent, Separator } from '@filigran/ui';
import { GradientButton } from '@filigran/ui/servers';
import {
  PlatformConfigurationStatus,
  PlatformIdentifier,
} from '@graphql/generated';
import { xtmPlatformBundleKeys } from '@graphql/xtm-platform-bundle/xtm-platform-bundle.keys';
import openaevTextLogo from '@public/logo_openaev_text.png';
import openctiTextLogo from '@public/logo_opencti_text.png';
import xtmoneTextLogo from '@public/logo_xtmone_text.png';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface BundleProductCardProps {
  product: XtmPlatformBundleProduct;
  xtmoneStatus: XtmoneStatusState;
  canManage: boolean;
}

const PRODUCT_TEXT_LOGO: Record<PlatformIdentifier, StaticImageData> = {
  [PlatformIdentifier.Opencti]: openctiTextLogo,
  [PlatformIdentifier.Openaev]: openaevTextLogo,
  [PlatformIdentifier.Xtmone]: xtmoneTextLogo,
};

export const BundleProductCard = ({
  product,
  xtmoneStatus,
  canManage,
}: BundleProductCardProps) => {
  const tProducts = useTranslations('XtmPlatformTrial.Products');
  const formatDate = useDateFormatter();
  const queryClient = useQueryClient();
  const [openEditName, setOpenEditName] = useState(false);

  const { name } = PlatformMetadataMapping[product.platform_identifier];
  const isXtmone = product.platform_identifier === PlatformIdentifier.Xtmone;
  const hasAccess = product.roles.length > 0;
  const accessUrl = product.url ?? null;
  const canAccess = isXtmone ? !!accessUrl : hasAccess && !!accessUrl;
  const roleLabel = product.roles.map((role) => role.name).join(', ');
  const accessLabel = tProducts('AccessProduct', { productName: name });

  const hasConnectivityInfo = product.connectivity_status != null;
  const isConnected =
    product.connectivity_status === PlatformConfigurationStatus.Active;
  const lastConnectionCheck = product.last_connectivity_check ?? null;

  const productNameRow = (
    <div className="flex items-center justify-between gap-s py-l">
      <span className="text-content-body-base text-text-default-secondary shrink-0 whitespace-nowrap">
        {tProducts('ProductName')}:
      </span>
      <div className="flex items-center gap-xs min-w-0">
        <Badge className="h-6 border-none bg-feedback-info-secondary-transparency text-content-body-base text-text-default-primary truncate">
          {product.name ?? '-'}
        </Badge>
        {canManage && (
          <Button
            variant="ghost"
            className="size-6 shrink-0 rounded-lg border border-elevation-border-strong p-0 text-text-default-primary"
            aria-label={tProducts('EditName')}
            onClick={() => setOpenEditName(true)}>
            <EditIcon className="size-4" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Card className="h-full bg-elevation-background-layer-1">
      <CardContent className="p-4 flex flex-col gap-m h-full">
        <div className="flex gap-s items-center min-w-0">
          <Image
            src={PRODUCT_TEXT_LOGO[product.platform_identifier]}
            alt={name}
            className="h-9 w-auto shrink-0"
          />
        </div>
        {isXtmone ? (
          <div className="flex flex-col">
            {productNameRow}
            <Separator className="mb-m" />
            <XtmoneConnectionStatus status={xtmoneStatus} />
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-elevation-border-subtle-layer-1">
            {productNameRow}
            <div className="flex items-start justify-between gap-s py-l">
              <span className="text-content-body-base text-text-default-secondary shrink-0 whitespace-nowrap">
                {tProducts('ConnectionStatus')}:
              </span>
              {!hasConnectivityInfo ? (
                <span className="text-content-body-base text-text-default-secondary text-left">
                  {tProducts('StatusUnavailable')}
                </span>
              ) : isConnected ? (
                <span className="text-content-body-base text-feedback-success-primary text-left">
                  {tProducts('StatusActive')}
                </span>
              ) : (
                <span className="text-content-body-base text-left">
                  <span className="text-feedback-error-primary">
                    {tProducts('ConnectionLost')}
                  </span>{' '}
                  <span className="text-text-default-primary">
                    {tProducts('ReconnectHint')}
                  </span>
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-s py-l">
              <span className="text-content-body-base text-text-default-secondary shrink-0 whitespace-nowrap">
                {tProducts('LastConnection')}:
              </span>
              <span className="text-content-body-compact truncate">
                {formatDate(lastConnectionCheck ?? undefined, 'DATE_FULL') ??
                  '-'}
              </span>
            </div>
            <div className="flex items-start justify-between gap-s py-l">
              <span className="text-content-body-base text-text-default-secondary shrink-0 whitespace-nowrap">
                {tProducts('Role')}:
              </span>
              {hasAccess ? (
                <span className="text-content-body-compact truncate">
                  {roleLabel}
                </span>
              ) : (
                <span className="text-content-body-compact text-left text-text-default-primary">
                  {tProducts('NoRole')} {tProducts('NoRoleHint')}
                </span>
              )}
            </div>
          </div>
        )}
        <div className="flex justify-end mt-auto">
          {isXtmone ? (
            canAccess && accessUrl ? (
              <Link
                href={accessUrl}
                target="_blank"
                rel="noopener noreferrer">
                <GradientButton
                  variant="ia"
                  className="bg-background dark:bg-none"
                  tabIndex={-1}>
                  {accessLabel}
                </GradientButton>
              </Link>
            ) : (
              <Button disabled>{accessLabel}</Button>
            )
          ) : (
            <Button
              asChild={canAccess}
              disabled={!canAccess}>
              {canAccess && accessUrl ? (
                <Link
                  href={accessUrl}
                  target="_blank"
                  rel="noopener noreferrer">
                  {accessLabel}
                </Link>
              ) : (
                <span>{accessLabel}</span>
              )}
            </Button>
          )}
        </div>
      </CardContent>
      {canManage && (
        <PlatformUpdateSheet
          serviceInstanceId={product.service_instance_id}
          serviceInstanceName={product.name ?? ''}
          platformUrl={product.url ?? ''}
          serviceDefinitionIdentifier={getRegisteredPlatformServiceIdentifier(
            product.platform_identifier
          )}
          open={openEditName}
          setOpen={setOpenEditName}
          onUpdated={() =>
            queryClient.invalidateQueries({
              queryKey: xtmPlatformBundleKeys.activeXtmPlatformBundle(),
            })
          }
        />
      )}
    </Card>
  );
};
