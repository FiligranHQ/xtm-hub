import CustomDashboardCard from '@/components/service/custom-dashboards/[serviceInstanceId]/custom-dashboard-card';
import DocumentBento from '@/components/ui/document-bento';
import ShareableResourceCard from '@/components/ui/shareable-resource-card';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import { ShareableResource } from '@/utils/shareable-resources/shareable-resources.utils';
import { customDashboardsItem_fragment$data } from '@generated/customDashboardsItem_fragment.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';

const ParentDocumentCard = async ({
  serviceInstance,
  document,
  baseUrl,
}: {
  serviceInstance: seoServiceInstanceFragment$data;
  document: ShareableResource;
  baseUrl: string;
}) => {
  switch (serviceInstance.slug) {
    case 'csv_feeds':
      return (
        <ShareableResourceCard
          key={document?.id}
          document={document}
          detailUrl={`/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
          shareLinkUrl={`${baseUrl}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}>
          <DocumentBento
            document={document}
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
          customDashboard={
            document as unknown as customDashboardsItem_fragment$data
          }
        />
      );
  }
};

export default ParentDocumentCard;
