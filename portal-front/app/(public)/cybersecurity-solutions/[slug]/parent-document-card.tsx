import CustomDashboardCard from '@/components/service/custom-dashboards/custom-dashboard-card';
import DocumentBento from '@/components/ui/document-bento';
import ShareableResourceCard from '@/components/ui/shareable-resource-card';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';

const ParentDocumentCard = async ({
  serviceInstance,
  document,
  baseUrl,
}: {
  serviceInstance: seoServiceInstanceFragment$data;
  document: documentItem_fragment$data;
  baseUrl: string;
}) => {
  switch (serviceInstance.slug) {
    case 'csv_feeds':
      return (
        <ShareableResourceCard
          key={document?.id}
          document={document as documentItem_fragment$data}
          detailUrl={`/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
          shareLinkUrl={`${baseUrl}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}>
          <DocumentBento
            document={document as documentItem_fragment$data}
            serviceInstanceId={serviceInstance.id}
          />
        </ShareableResourceCard>
      );

    case 'custom_open_cti_dashboards':
      return (
        <CustomDashboardCard
          key={document.id}
          serviceInstance={
            serviceInstance as unknown as NonNullable<
              serviceByIdQuery$data['serviceInstanceById']
            >
          }
          customDashboard={document as documentItem_fragment$data}
          detailUrl={`/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
          shareLinkUrl={`${baseUrl}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
        />
      );
  }
};

export default ParentDocumentCard;
