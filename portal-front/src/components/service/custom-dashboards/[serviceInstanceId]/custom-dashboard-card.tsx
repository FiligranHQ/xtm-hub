'use client';
import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import DashboardUpdate from '@/components/service/custom-dashboards/[serviceInstanceId]/custom-dashboard-update';
import { IconActions } from '@/components/ui/icon-actions';
import ShareableResourceCard from '@/components/ui/shareable-resource-card';
import useServiceCapability from '@/hooks/useServiceCapability';
import { customDashboardsItem_fragment$data } from '@generated/customDashboardsItem_fragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { MoreVertIcon } from 'filigran-icon';
import { useTranslations } from 'next-intl';

interface CustomDashboardCardProps {
  customDashboard: customDashboardsItem_fragment$data;
  connectionId?: string;
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
  detailUrl: string;
  shareLinkUrl: string;
}

const CustomDashboardCard = ({
  customDashboard,
  connectionId,
  serviceInstance,
  detailUrl,
  shareLinkUrl,
}: CustomDashboardCardProps) => {
  const t = useTranslations();
  const userCanDelete = useServiceCapability(
    ServiceCapabilityName.Delete,
    serviceInstance
  );
  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upload,
    serviceInstance
  );

  return (
    <ShareableResourceCard
      key={customDashboard.id}
      document={customDashboard}
      detailUrl={detailUrl}
      shareLinkUrl={shareLinkUrl}
      serviceInstance={serviceInstance}
      extraContent={
        (userCanUpdate || userCanDelete) && (
          <IconActions
            className="z-[2]"
            icon={
              <>
                <MoreVertIcon className="h-4 w-4 text-primary" />
                <span className="sr-only">{t('Utils.OpenMenu')}</span>
              </>
            }>
            <DashboardUpdate
              serviceInstance={serviceInstance}
              customDashboard={customDashboard}
              connectionId={connectionId!}
              variant="menu"
            />
          </IconActions>
        )
      }
    />
  );
};

export default CustomDashboardCard;
