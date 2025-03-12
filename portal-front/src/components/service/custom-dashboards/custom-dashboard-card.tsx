'use client';
import { ServiceCapabilityName } from '@/components/service/[slug]/capabilities/capability.helper';
import CustomDashboardBento from '@/components/service/custom-dashboards/custom-dashboard-bento';
import DashboardUpdate from '@/components/service/custom-dashboards/custom-dashboard-update';
import { documentItem } from '@/components/service/document/document.graphql';
import { IconActions } from '@/components/ui/icon-actions';
import useServiceCapability from '@/hooks/useServiceCapability';
import { documentItem_fragment$key } from '@generated/documentItem_fragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import { MoreVertIcon } from 'filigran-icon';
import { Badge, Carousel } from 'filigran-ui';
import { CarouselItem } from 'filigran-ui/clients';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
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

  return (
    <>
      <li className="border-light flex flex-col relative rounded border bg-page-background gap-l aria-disabled:opacity-60">
        <Carousel>
          <CarouselItem>
            <CustomDashboardBento
              customDashboard={customDashboard}
              serviceInstance={serviceInstance}
            />
          </CarouselItem>
          {fileNames.map((name) => (
            <CarouselItem key={name}>
              <Image
                fill
                objectPosition="top"
                objectFit="cover"
                src={`/document/visualize/${serviceInstance.id}/${name}`}
                alt={`An image of ${name}`}
              />
            </CarouselItem>
          ))}
        </Carousel>

        <div
          className="cursor-pointer"
          onClick={() =>
            router.push(
              `/service/custom_dashboards/${serviceInstance.id}/${customDashboard.id}`
            )
          }>
          <div className="flex items-center px-l justify-between">
            {/*TODO : will be filled when design is finalized*/}
            <div className="flex gap-s items-center">
              {customDashboard?.labels?.map(({ id, name, color }) => (
                <Badge
                  key={id}
                  color={color}>
                  {name}
                </Badge>
              ))}
            </div>

            {(userCanUpdate || userCanDelete) && (
              <IconActions
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
                  data={data as unknown as documentItem_fragment$key}
                  connectionId={connectionId}
                  variant="menu"
                />
              </IconActions>
            )}
          </div>
          <h2 className="truncate flex-1 px-l mt-l max-h-[10rem] overflow-hidden">
            {(customDashboard?.short_description?.length ?? 0 > 0)
              ? customDashboard.short_description
              : 'No description'}
          </h2>
          <div className="txt-mini p-l items-center flex">
            {customDashboard.product_version && (
              <div>
                {t('Service.CustomDashboards.FromOCTIVersion')} :{' '}
                {customDashboard.product_version}
              </div>
            )}
            <Badge
              size="sm"
              className="ml-auto"
              style={{ color: '#7a7c85' }}>
              {t(customDashboard.active ? 'Badge.Published' : 'Badge.Draft')}
            </Badge>
          </div>
        </div>
      </li>
    </>
  );
};

export default CustomDashboardCard;
