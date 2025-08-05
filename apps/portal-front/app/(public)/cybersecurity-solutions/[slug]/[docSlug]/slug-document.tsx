import DashboardCarousel from '@/components/service/custom-dashboards/[slug]/custom-dashboard-carousel-view';
import {
  SeoResource,
  ServiceSlug,
} from '@/utils/shareable-resources/shareable-resources.types';
import { customDashboardsItem_fragment$data } from '@generated/customDashboardsItem_fragment.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { serviceInstance_fragment$data } from '@generated/serviceInstance_fragment.graphql';
import Image from 'next/image';

const SlugDocument = async ({
  serviceInstance,
  document,
}: {
  serviceInstance: seoServiceInstanceFragment$data;
  document: SeoResource;
}) => {
  switch (serviceInstance.slug as ServiceSlug) {
    case ServiceSlug.OPEN_CTI_INTEGRATION_FEEDS:
      return (
        <div className="relative w-full h-[35vh]">
          <Image
            fill
            className="object-cover object-top rounded-lg"
            src={`/document/images/${serviceInstance.id}/${document.children_documents![0]!.id}`}
            alt={`A picture of ${document.name}`}
          />
        </div>
      );

    case ServiceSlug.OPEN_CTI_CUSTOM_DASHBOARDS:
      return (
        <DashboardCarousel
          serviceInstance={
            serviceInstance as unknown as serviceInstance_fragment$data
          }
          documentData={
            document as unknown as customDashboardsItem_fragment$data
          }
        />
      );
  }
};

export default SlugDocument;
