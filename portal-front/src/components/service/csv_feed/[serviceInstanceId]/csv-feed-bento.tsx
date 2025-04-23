import DocumentBento from '@/components/ui/document-bento';
import { csvFeedItem_fragment$data } from '@generated/csvFeedItem_fragment.graphql';
import { documentItem_fragment$data } from '@generated/documentItem_fragment.graphql';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { a11yDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CsvFeedBento = ({ csvFeed }: { csvFeed: csvFeedItem_fragment$data }) => {
  return (
    <DocumentBento document={csvFeed as unknown as documentItem_fragment$data}>
      <SyntaxHighlighter
        className="flex-1"
        language={'json'}
        style={a11yDark}
        customStyle={{
          fontSize: '0.5rem',
          backgroundColor: 'transparent',
          padding: 0,
          margin: 0,
          overflow: 'hidden',
        }}>
        {csvFeed.document_metadata?.find(
          (metadata) => metadata?.key === 'verified_json_text'
        )?.value ?? ''}
      </SyntaxHighlighter>
    </DocumentBento>
  );
};

export default CsvFeedBento;
