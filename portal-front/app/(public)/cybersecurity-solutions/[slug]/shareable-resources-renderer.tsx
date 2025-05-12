import DashboardCarousel from '@/components/service/custom-dashboards/[details]/custom-dashboard-carousel-view';
import CustomDashboardCard from '@/components/service/custom-dashboards/custom-dashboard-card';
import DocumentBento from '@/components/ui/document-bento';
import ShareableResourceCard from '@/components/ui/shareable-resource-card';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';
import Image from 'next/image';

export const rendererMap: Record<
  string,
  (params: {
    document: documentItem_fragment$data;
    serviceInstance: NonNullable<serviceByIdQuery$data['serviceInstanceById']>;
    baseUrl: string;
  }) => JSX.Element
> = {
  'csv-feeds': ({ document, serviceInstance, baseUrl }) => (
    <ShareableResourceCard
      key={document?.id}
      serviceInstance={serviceInstance}
      document={document}
      detailUrl={`/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
      shareLinkUrl={`${baseUrl}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}>
      <DocumentBento
        document={document}
        serviceInstanceId={serviceInstance.id}
      />
    </ShareableResourceCard>
  ),
  default: ({ document, serviceInstance, baseUrl }) => (
    <CustomDashboardCard
      key={document.id}
      serviceInstance={serviceInstance}
      customDashboard={document}
      detailUrl={`/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
      shareLinkUrl={`${baseUrl}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
    />
  ),
};

export const slugRendererMap: Record<
  string,
  (params: {
    document: documentItem_fragment$data;
    serviceInstance: seoServiceInstanceFragment$data;
  }) => JSX.Element
> = {
  'csv-feeds': ({ document, serviceInstance }) => (
    <div className="relative w-full h-[35vh]">
      <Image
        fill
        className="object-cover object-top  rounded-lg"
        src={`/document/images/${serviceInstance.id}/${document.children_documents[0].id}`}
        alt={`A picture of ${document.name}`}
      />
    </div>
  ),
  default: ({ document, serviceInstance }) => (
    <DashboardCarousel
      serviceInstance={
        serviceInstance as unknown as NonNullable<
          serviceByIdQuery$data['serviceInstanceById']
        >
      }
      documentData={document}
    />
  ),
};
