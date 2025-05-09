import CustomDashboardCard from '@/components/service/custom-dashboards/custom-dashboard-card';
import DocumentBento from '@/components/ui/document-bento';
import ShareableResourceCard from '@/components/ui/shareable-resource-card';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';

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
