import DashboardCarousel from '@/components/service/custom-dashboards/[slug]/custom-dashboard-carousel-view';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import Image from 'next/image';

const SlugDocument = async ({
  serviceInstance,
  document,
}: {
  serviceInstance: seoServiceInstanceFragment$data;
  document: documentItem_fragment$data;
}) => {
  switch (serviceInstance.slug) {
    case 'csv_feeds':
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

    case 'custom_open_cti_dashboards':
      return (
        <DashboardCarousel
          serviceInstance={
            serviceInstance as unknown as NonNullable<
              serviceByIdQuery$data['serviceInstanceById']
            >
          }
          documentData={document as documentItem_fragment$data}
        />
      );
  }
};

export default SlugDocument;
