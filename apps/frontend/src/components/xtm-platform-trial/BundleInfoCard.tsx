'use client';

import { CONTRACT_LABEL_BY_CONTRACT } from '@/components/registration/PlatformIdentifierMapping';
import { TrialsManageUsersDialog } from '@/components/service/trial-instances/manage-users/TrialsManageUsersDialog';
import { BundleCancelSheet } from '@/components/xtm-platform-trial/BundleCancelSheet';
import { XtmPlatformBundleData } from '@/components/xtm-platform-trial/xtm-platform-bundle.types';
import { daysUntil, useDateFormatter } from '@/utils/date';
import { Badge, Button, Card, CardContent } from '@filigran/ui';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface BundleInfoCardProps {
  bundle: XtmPlatformBundleData;
  canManage: boolean;
  organizationId?: string;
}

const InfoRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-center justify-between gap-s py-l">
    <span className="text-content-body-base text-text-default-secondary">
      {label}:
    </span>
    <span className="text-content-body-compact truncate">{children}</span>
  </div>
);

export const BundleInfoCard = ({
  bundle,
  canManage,
  organizationId,
}: BundleInfoCardProps) => {
  const t = useTranslations();
  const tBundle = useTranslations('XtmPlatformTrial');
  const tBundleInfo = useTranslations('XtmPlatformTrial.BundleInfo');
  const formatDate = useDateFormatter();
  const [openCancel, setOpenCancel] = useState(false);

  const remainingDays = bundle.end_date
    ? Math.max(daysUntil(new Date(bundle.end_date)), 0)
    : null;

  return (
    <Card className="h-full bg-elevation-background-layer-2">
      <CardContent className="p-4 flex flex-col gap-m h-full">
        <div className="flex items-center gap-xs min-w-0">
          <span className="text-content-body-large-medium truncate">
            {tBundleInfo('Title')}
          </span>
        </div>
        <div className="flex flex-col divide-y divide-elevation-border-subtle-layer-2">
          <InfoRow label={tBundleInfo('OrganizationName')}>
            {bundle.organization_name ?? '-'}
          </InfoRow>
          <InfoRow label={tBundleInfo('StartedOn')}>
            {formatDate(bundle.start_date ?? undefined, 'DATE_FULL') ?? '-'}
          </InfoRow>
          <InfoRow label={tBundleInfo('License')}>
            {bundle.license ? (
              <Badge className="bg-elevation-surface-highlight-layer-2 border-none">
                {t(CONTRACT_LABEL_BY_CONTRACT[bundle.license])}
              </Badge>
            ) : (
              '-'
            )}
          </InfoRow>
          <InfoRow label={tBundleInfo('Remaining')}>
            {remainingDays !== null ? (
              <Badge className="border-none bg-feedback-success-secondary-transparency text-content-body-base text-text-default-primary truncate">
                {tBundleInfo('DaysRemaining', { days: remainingDays })}
              </Badge>
            ) : (
              '-'
            )}
          </InfoRow>
          <InfoRow label={tBundleInfo('TrialRequester')}>
            {bundle.requester_email ?? '-'}
          </InfoRow>
        </div>
        {canManage && (
          <div className="flex flex-wrap items-center justify-end gap-s mt-auto">
            <Button
              variant="outline-destructive"
              onClick={() => setOpenCancel(true)}>
              {tBundle('CancelTrial')}
            </Button>
            <TrialsManageUsersDialog
              serviceInstanceId={bundle.service_instance_id}
              organizationId={organizationId}
              trigger={<Button>{t('Service.Trials.ManageUsers.Title')}</Button>}
            />
            <BundleCancelSheet
              deploymentRequestId={bundle.id}
              open={openCancel}
              setOpen={setOpenCancel}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
