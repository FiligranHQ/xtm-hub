import CustomDashboardCard from '@/components/service/custom-dashboards/[serviceInstanceId]/custom-dashboard-card';
import DocumentBento from '@/components/ui/document-bento';
import ShareableResourceCard from '@/components/ui/shareable-resource-card';
import { PUBLIC_CYBERSECURITY_SOLUTIONS_PATH } from '@/utils/path/constant';
import {
  SeoCsvFeed,
  SeoCustomDashboard,
} from '@/utils/shareable-resources/shareable-resources.utils';
import { customDashboardsItem_fragment$data } from '@generated/customDashboardsItem_fragment.graphql';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { seoServiceInstanceFragment$data } from '@generated/seoServiceInstanceFragment.graphql';
import { serviceByIdQuery$data } from '@generated/serviceByIdQuery.graphql';

const ParentDocumentCard = async ({
  serviceInstance,
  document,
  baseUrl,
}: {
  serviceInstance: seoServiceInstanceFragment$data;
  document: SeoCsvFeed | SeoCustomDashboard;
  baseUrl: string;
}) => {
  switch (serviceInstance.slug) {
    case 'csv_feeds':
      return (
        <ShareableResourceCard
          key={document?.id}
          document={document as unknown as documentItem_fragment$data}
          detailUrl={`/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
          shareLinkUrl={`${baseUrl}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}>
          <DocumentBento
            document={document as unknown as documentItem_fragment$data}
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
          detailUrl={`/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
          shareLinkUrl={`${baseUrl}/${PUBLIC_CYBERSECURITY_SOLUTIONS_PATH}/${serviceInstance.slug}/${document.slug}`}
        />
      );
  }
};

export default ParentDocumentCard;
