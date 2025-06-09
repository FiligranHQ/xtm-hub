import DashboardCarousel from '@/components/service/custom-dashboards/[slug]/custom-dashboard-carousel-view';
import {
  SeoCsvFeed,
  SeoCustomDashboard,
  ServiceSlug,
} from '@/utils/shareable-resources/shareable-resources.utils';
import { customDashboardsItem_fragment$data } from '@generated/customDashboardsItem_fragment.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import Image from 'next/image';

const SlugDocument = async ({
  serviceInstance,
  document,
}: {
  serviceInstance: seoServiceInstanceFragment$data;
  document: SeoCsvFeed | SeoCustomDashboard;
}) => {
  switch (serviceInstance.slug as ServiceSlug) {
    case 'open-cti-integration-feeds':
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

    case 'custom-open-cti-dashboards':
      return (
        <DashboardCarousel
          serviceInstance={
            serviceInstance as unknown as NonNullable<
              serviceByIdQuery$data['serviceInstanceById']
            >
          }
          documentData={
            document as unknown as customDashboardsItem_fragment$data
          }
        />
      );
  }
};

export default SlugDocument;
