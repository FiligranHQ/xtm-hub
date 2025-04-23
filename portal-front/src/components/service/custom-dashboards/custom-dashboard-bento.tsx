import DocumentBento from '@/components/ui/document-bento';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';

const CustomDashboardBento = ({
  customDashboard,
  serviceInstanceId,
}: {
  customDashboard: documentItem_fragment$data;
  serviceInstanceId: string;
}) => {
  return (
    <DocumentBento document={customDashboard}>
      <>
        {customDashboard.children_documents?.[0] && (
          <div
            className="flex-1"
            style={{
              backgroundImage: `url(/document/images/${serviceInstanceId}/${customDashboard.children_documents?.[0]?.id})`,
              backgroundSize: 'cover',
            }}
          />
        )}
      </>
    </DocumentBento>
  );
};

export default CustomDashboardBento;
