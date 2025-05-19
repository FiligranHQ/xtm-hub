'use client';
import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import DashboardUpdate from '@/components/service/custom-dashboards/[serviceInstanceId]/custom-dashboard-update';
import DocumentBento from '@/components/ui/document-bento';
import { IconActions } from '@/components/ui/icon-actions';
import ShareableResourceCard from '@/components/ui/shareable-resource-card';
import useServiceCapability from '@/hooks/useServiceCapability';
import { customDashboardsItem_fragment$data } from '@generated/customDashboardsItem_fragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { MoreVertIcon } from 'filigran-icon';
import { Carousel } from 'filigran-ui';
import { CarouselItem } from 'filigran-ui/clients';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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
  const fileNames = (customDashboard.children_documents ?? []).map(
    (doc) => doc?.id
  );
  const userCanDelete = useServiceCapability(
    ServiceCapabilityName.Delete,
    serviceInstance
  );
  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upload,
    serviceInstance
  );
  const router = useRouter();

  const handleClickCarousel = (
    customDashboard: customDashboardsItem_fragment$data
  ) => {
    router.push(
      `/service/custom_dashboards/${serviceInstance.id}/${customDashboard.id}`
    );
  };

  return (
    <ShareableResourceCard
      key={customDashboard.id}
      document={customDashboard}
      detailUrl={detailUrl}
      shareLinkUrl={shareLinkUrl}
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
      }>
      <Carousel
        scrollButton="hover"
        dotButton="hover"
        className="h-full p-s">
        <CarouselItem
          className="cursor-pointer"
          onClick={() => handleClickCarousel(customDashboard)}>
          <DocumentBento
            document={customDashboard}
            serviceInstanceId={serviceInstance.id}
          />
        </CarouselItem>
        {fileNames.map((name) => (
          <CarouselItem
            key={name}
            className="cursor-pointer"
            onClick={() => handleClickCarousel(customDashboard)}>
            <Image
              fill
              objectPosition="top"
              objectFit="cover"
              src={`/document/images/${serviceInstance.id}/${name}`}
              alt={`An image of ${name}`}
            />
          </CarouselItem>
        ))}
      </Carousel>
    </ShareableResourceCard>
  );
};

export default CustomDashboardCard;
