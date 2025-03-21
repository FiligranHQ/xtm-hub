'use client';
import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import CustomDashboardBento from '@/components/service/custom-dashboards/custom-dashboard-bento';
import DashboardUpdate from '@/components/service/custom-dashboards/custom-dashboard-update';
import { documentItem } from '@/components/service/document/document.graphql';
import BadgeOverflowCounter, {
  BadgeOverflow,
} from '@/components/ui/badge-overflow-counter';
import { IconActions } from '@/components/ui/icon-actions';
import useServiceCapability from '@/hooks/useServiceCapability';
import { documentItem_fragment$key } from '@generated/documentItem_fragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { MoreVertIcon } from 'filigran-icon';
import { Badge, Carousel } from 'filigran-ui';
import { CarouselItem } from 'filigran-ui/clients';
import { AspectRatio } from 'filigran-ui/servers';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { readInlineData } from 'react-relay';

interface CustomDashboardCardProps {
  data: documentItem_fragment$key;
  connectionId: string;
  serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
}

const CustomDashboardCard = ({
  data,
  connectionId,
  serviceInstance,
}: CustomDashboardCardProps) => {
  const customDashboard = readInlineData<documentItem_fragment$key>(
    documentItem,
    data
  );
  const router = useRouter();

  const t = useTranslations();
  const fileNames = (customDashboard.children_documents ?? [])?.map(
    ({ id }) => id
  );
  const userCanDelete = useServiceCapability(
    ServiceCapabilityName.Delete,
    serviceInstance
  );
  const userCanUpdate = useServiceCapability(
    ServiceCapabilityName.Upload,
    serviceInstance
  );

  const handleClickCarousel = () => {
    router.push(
      `/service/custom_dashboards/${serviceInstance.id}/${customDashboard.id}`
    );
  };

  return (
    <li className="border-light flex flex-col relative rounded border bg-page-background aria-disabled:opacity-60 hover:bg-hover">
      <AspectRatio
        ratio={16 / 9}
        className={'z-[10]'}>
        <Carousel
          scrollButton="hover"
          dotButton="hover"
          className="h-full">
          <CarouselItem
            className={'cursor-pointer'}
            onClick={handleClickCarousel}>
            <CustomDashboardBento
              customDashboard={customDashboard}
              serviceInstance={serviceInstance}
            />
          </CarouselItem>
          {fileNames.map((name) => (
            <CarouselItem
              key={name}
              className={'cursor-pointer'}
              onClick={handleClickCarousel}>
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
      </AspectRatio>
      <div className="flex flex-col flex-grow p-l space-y-s">
        <div className="flex items-center justify-between">
          <BadgeOverflowCounter
            badges={customDashboard?.labels as BadgeOverflow[]}
          />

          {(userCanUpdate || userCanDelete) && (
            <IconActions
              className={'z-[2]'}
              icon={
                <>
                  <MoreVertIcon className="h-4 w-4 text-primary" />
                  <span className="sr-only">{t('Utils.OpenMenu')}</span>
                </>
              }>
              <DashboardUpdate
                userCanUpdate={userCanUpdate}
                userCanDelete={userCanDelete}
                serviceInstanceId={serviceInstance?.id}
                customDashboard={customDashboard}
                connectionId={connectionId}
                variant="menu"
              />
            </IconActions>
          )}
        </div>
        <Link
          className="focus:outline-none focus:ring-2 focus:ring-ring after:cursor-pointer after:content-[' '] after:absolute after:inset-0"
          href={`/service/custom_dashboards/${serviceInstance.id}/${customDashboard.id}`}>
          <h3 className="line-clamp-2 text-ellipsis flex-1 max-h-[10rem] overflow-hidden">
            {customDashboard?.short_description}
          </h3>
        </Link>

        <div className="txt-mini items-center flex mt-auto">
          {customDashboard.product_version && (
            <div>
              {t('Service.CustomDashboards.FromOCTIVersion')} :{' '}
              {customDashboard.product_version}
            </div>
          )}
          <Badge
            size="sm"
            className="ml-auto"
            variant={customDashboard.active ? 'default' : 'warning'}>
            {t(
              customDashboard.active ? 'Badge.Published' : 'Badge.Draft'
            ).toUpperCase()}
          </Badge>
        </div>
      </div>
    </li>
  );
};

export default CustomDashboardCard;
