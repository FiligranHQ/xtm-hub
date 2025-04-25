import DocumentBento from '@/components/ui/document-bento';
import { csvFeedItem_fragment$data } from '@generated/csvFeedItem_fragment.graphql';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';

const CsvFeedBento = ({
  csvFeed,
  serviceInstanceId,
}: {
  csvFeed: csvFeedItem_fragment$data;
  serviceInstanceId: string;
}) => {
  return (
    <DocumentBento document={csvFeed as unknown as documentItem_fragment$data}>
      <>
        {csvFeed.children_documents?.[0] && (
          <div
            className="flex-1"
            style={{
              backgroundImage: `url(/document/images/${serviceInstanceId}/${csvFeed.children_documents?.[0]?.id})`,
              backgroundSize: 'cover',
            }}
          />
        )}
      </>
    </DocumentBento>
  );
};

export default CsvFeedBento;
